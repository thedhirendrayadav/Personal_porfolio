import sys

# Reconfigure stdout/stderr to UTF-8 so emoji (✅/⚠️) in print() work on Windows
# consoles (which default to cp1252 and would otherwise raise UnicodeEncodeError).
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash, Response
import datetime
import json
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from werkzeug.exceptions import NotFound
from werkzeug.routing import RequestRedirect
from config import APP_CONFIG, ADMIN_CONFIG, EMAIL_CONFIG
from unified_models import ProjectModel, CategoryModel, BlogModel, ContactModel
from database import db
from project_content import (
    get_curated_neighbors,
    get_curated_project,
    load_curated_projects,
)
from field_notes import get_curated_field_notes
from slug_utils import slugify_text


def ensure_database_and_tables():
    """Ensure database and tables are set up"""
    try:
        db.ensure_database_setup()
        
        # Initialize models to create tables (MySQL only)
        project_model = ProjectModel()
        category_model = CategoryModel()
        blog_model = BlogModel()
        project_model.create_projects_table()
        category_model.create_categories_table()
        blog_model.create_blog_tables()
    except Exception as e:
        print(f"Database setup error: {e}")
        # Continue without database for static content


def get_visit_count_and_increment() -> int:
    """Get and increment visit count"""
    try:
        return db.increment_visit_count()
    except Exception as e:
        print(f"Visit count error: {e}")
        return 1  # Return a default value


def send_email_notification(name, email, subject, message):
    """Send email notification when someone submits the contact form"""
    sender_email = EMAIL_CONFIG["sender_email"]
    sender_password = EMAIL_CONFIG["sender_password"]
    receiver_email = EMAIL_CONFIG["receiver_email"]

    if not sender_password:
        print("Email not sent: SENDER_PASSWORD not configured")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = sender_email
        msg["To"] = receiver_email
        msg["Subject"] = f"Portfolio Contact: {subject}"
        msg["Reply-To"] = email

        html_body = f"""\
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4a9bff, #6c5ce7); padding: 20px; border-radius: 10px 10px 0 0;">
    <h2 style="color: #fff; margin: 0;">New Contact Form Submission</h2>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
    <p><strong>Subject:</strong> {subject}</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0;">
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0;">{message}</p>
  </div>
  <p style="color: #888; font-size: 12px; margin-top: 15px;">Sent from your portfolio contact form</p>
</body>
</html>"""

        text_body = f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}"

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"]) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

        print(f"Email notification sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


app = Flask(__name__)
ASSET_VERSION = os.environ.get('ASSET_VERSION', str(int(datetime.datetime.now().timestamp())))
SITE_URL = os.environ.get('SITE_URL', 'https://www.dhirendrayadav.site').rstrip('/')
SITE_NAME = 'Dhirendra Yadav'
SITE_DESCRIPTION = 'Dhirendra Yadav builds secure automation, AI/ML systems, and practical digital products from Bhaktapur, Nepal.'
INDEXNOW_KEY = os.environ.get('INDEXNOW_KEY', 'dy-portfolio-indexnow-20260728')
CANONICAL_HOST = 'www.dhirendrayadav.site'


@app.before_request
def redirect_generated_railway_hostname():
    """Keep Railway's generated service URL out of the public URL graph."""
    request_host = request.host.split(':', 1)[0].lower()
    if request_host.endswith('.up.railway.app'):
        destination = f'https://{CANONICAL_HOST}{request.full_path}'
        if destination.endswith('?'):
            destination = destination[:-1]
        return redirect(destination, code=308)


@app.before_request
def redirect_noncanonical_trailing_slash():
    """Redirect valid inner routes to their slashless canonical paths."""
    path = request.path or "/"
    if path == "/" or not path.endswith("/"):
        return None

    canonical_path = path.rstrip("/")
    adapter = app.url_map.bind_to_environ(request.environ)
    try:
        adapter.match(canonical_path, method=request.method)
    except (NotFound, RequestRedirect):
        return None

    query = request.query_string.decode("utf-8")
    location = canonical_path if not query else f"{canonical_path}?{query}"
    return redirect(location, code=308)

# Security Configuration
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', ADMIN_CONFIG["secret_key"]),
    SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=datetime.timedelta(hours=2),
    # Keep local edits instant while allowing browsers and crawlers to reuse
    # versioned production assets between page views.
    SEND_FILE_MAX_AGE_DEFAULT=(
        datetime.timedelta(days=7)
        if os.environ.get('RAILWAY_ENVIRONMENT')
        or os.environ.get('RAILWAY_ENVIRONMENT_NAME')
        else 0
    )
)

# Security Headers Middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "frame-ancestors 'none'"
    )
    # Only add HSTS in production with HTTPS
    if request.is_secure:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    # Keep private/tooling endpoints out of search indexes even if discovered
    # through a link, while leaving the public content graph indexable.
    if request.path.startswith(('/admin', '/api', '/debug', '/blog/search')):
        response.headers['X-Robots-Tag'] = 'noindex, nofollow, noarchive'
    return response

# CSRF Protection
def generate_csrf_token():
    """Generate CSRF token"""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(16)
    return session['csrf_token']

def validate_csrf_token():
    """Validate CSRF token"""
    token = session.get('csrf_token')
    if not token:
        return False
    
    # Check form data first, then headers
    form_token = request.form.get('csrf_token')
    header_token = request.headers.get('X-CSRF-Token')
    
    return token == (form_token or header_token)

# Rate limiting storage (simple in-memory for demo)
rate_limit_storage = {}

def check_rate_limit(key, limit, window):
    """Simple rate limiting check"""
    import time
    now = time.time()
    
    if key not in rate_limit_storage:
        rate_limit_storage[key] = []
    
    # Clean old entries
    rate_limit_storage[key] = [t for t in rate_limit_storage[key] if now - t < window]
    
    # Check limit
    if len(rate_limit_storage[key]) >= limit:
        return False
    
    # Add current request
    rate_limit_storage[key].append(now)
    return True

# Ensure DB exists on startup
try:
    ensure_database_and_tables()
    print("✅ Database initialization completed")
except Exception as e:
    print(f"⚠️ Database initialization warning: {e}")
    # Continue anyway - the app might still work with fallback methods


# ===================================
# AUTHENTICATION SYSTEM
# ===================================

def admin_required(f):
    """Decorator to require admin authentication with session timeout"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login', next=request.url))
        
        # Check session timeout
        if 'last_activity' in session:
            if datetime.datetime.now() - session['last_activity'] > datetime.timedelta(hours=2):
                session.clear()
                flash('Session expired. Please log in again.', 'warning')
                return redirect(url_for('admin_login'))
        
        session['last_activity'] = datetime.datetime.now()
        return f(*args, **kwargs)
    return decorated_function


@app.route("/admin/login", methods=['GET', 'POST'])
def admin_login():
    """Admin login page with security"""
    if request.method == 'POST':
        # Rate limiting for login attempts
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if not check_rate_limit(f"login_{client_ip}", 5, 900):  # 5 attempts per 15 minutes
            flash('Too many login attempts. Please try again later.', 'error')
            return render_template("admin/login.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token()), 429
        
        # CSRF Protection
        if not validate_csrf_token():
            flash('Security token validation failed. Please try again.', 'error')
            return render_template("admin/login.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token()), 403
        
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Input validation
        if not username or not password:
            flash('Username and password are required!', 'error')
            return render_template("admin/login.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token())
        
        if len(username) > 50 or len(password) > 100:
            flash('Invalid input length!', 'error')
            return render_template("admin/login.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token())
        
        if (username == ADMIN_CONFIG["username"] and 
            password == ADMIN_CONFIG["password"]):
            session.permanent = True
            session['admin_logged_in'] = True
            session['admin_username'] = username
            session['last_activity'] = datetime.datetime.now()
            flash('Successfully logged in!', 'success')
            
            # Redirect to intended page or dashboard
            next_page = request.args.get('next')
            if next_page and next_page.startswith('/admin/'):
                return redirect(next_page)
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template("admin/login.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token())


@app.route("/admin/logout")
def admin_logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    session.pop('admin_username', None)
    flash('Successfully logged out!', 'success')
    return redirect(url_for('index'))


@app.route("/")
def index():
    visit_count = get_visit_count_and_increment()
    try:
        database_projects = ProjectModel().get_all_projects(featured_only=True)
    except Exception as exc:
        print(f"Homepage project load error: {exc}")
        database_projects = []
    featured_projects = database_projects or [
        project for project in load_curated_projects() if project["featured"]
    ]
    content_source = "database" if database_projects else "curated"

    try:
        recent_posts = BlogModel().get_recent_posts(limit=3)
    except Exception as exc:
        print(f"Homepage blog load error: {exc}")
        recent_posts = []

    return render_template(
        "index.html",
        visit_count=visit_count,
        app_name=APP_CONFIG["name"],
        featured_projects=featured_projects,
        recent_posts=recent_posts,
        content_source=content_source,
    )

@app.route("/about")
def about():
    return render_template("about.html", app_name=APP_CONFIG["name"])

@app.route("/portfolio")
def portfolio():
    project_model = ProjectModel()
    category_model = CategoryModel()

    try:
        database_projects = project_model.get_all_projects(featured_only=True)
        categories = category_model.get_all_categories()
    except Exception as exc:
        print(f"Portfolio project load error: {exc}")
        database_projects = []
        categories = []
    projects = database_projects or load_curated_projects()
    content_source = "database" if database_projects else "curated"
    
    # Retain model-normalized technology lists while supporting legacy JSON strings.
    for project in projects:
        if isinstance(project.get('technologies'), str):
            try:
                project['technologies'] = json.loads(project['technologies'])
            except json.JSONDecodeError:
                project['technologies'] = []
    
    return render_template("portfolio.html", 
                         app_name=APP_CONFIG["name"],
                         projects=projects,
                         categories=categories,
                         content_source=content_source)


@app.route("/work/<slug>")
def curated_project_detail(slug):
    project = get_curated_project(slug)
    if not project:
        alias_project = next(
            (
                candidate
                for candidate in load_curated_projects()
                if slugify_text(candidate["title"]) == slug
            ),
            None,
        )
        if alias_project:
            return redirect(
                url_for("curated_project_detail", slug=alias_project["slug"]),
                code=301,
            )
        return render_template("404.html", app_name=APP_CONFIG["name"]), 404

    previous_project, next_project = get_curated_neighbors(slug)
    return render_template(
        "project_detail.html",
        app_name=APP_CONFIG["name"],
        project=project,
        previous_project=previous_project,
        next_project=next_project,
        project_source="curated",
    )


@app.route("/portfolio/<int:project_id>")
def project_detail(project_id):
    project_model = ProjectModel()
    project = project_model.get_project_by_id(project_id)

    if not project:
        return render_template("404.html", app_name=APP_CONFIG["name"]), 404

    if isinstance(project.get("technologies"), str):
        try:
            project["technologies"] = json.loads(project["technologies"])
        except json.JSONDecodeError:
            project["technologies"] = []

    projects = project_model.get_all_projects()
    project_index = next(
        (index for index, candidate in enumerate(projects) if candidate.get("id") == project_id),
        None,
    )
    previous_project = projects[project_index - 1] if project_index else None
    next_project = (
        projects[project_index + 1]
        if project_index is not None and project_index + 1 < len(projects)
        else None
    )

    return render_template(
        "project_detail.html",
        app_name=APP_CONFIG["name"],
        project=project,
        previous_project=previous_project,
        next_project=next_project,
        project_source="database",
    )

@app.route("/skills")
def skills():
    return render_template("skills.html", app_name=APP_CONFIG["name"])

@app.route("/contact", methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Rate limiting for contact form
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if not check_rate_limit(f"contact_{client_ip}", 3, 3600):  # 3 submissions per hour
            return jsonify({'success': False, 'message': 'Too many submissions. Please try again later.'}), 429
        
        # CSRF Protection
        if not validate_csrf_token():
            return jsonify({'success': False, 'message': 'Security token validation failed.'}), 403
        
        # Get and validate form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()
        
        # Input validation
        if not all([name, email, subject, message]):
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        # Length validation
        if len(name) > 100 or len(email) > 255 or len(subject) > 200 or len(message) > 5000:
            return jsonify({'success': False, 'message': 'Input too long'})
        
        # Email validation (basic)
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({'success': False, 'message': 'Invalid email format'})
        
        # Name validation (no special characters except spaces, hyphens, apostrophes)
        name_pattern = r"^[a-zA-Z\s\-']+$"
        if not re.match(name_pattern, name):
            return jsonify({'success': False, 'message': 'Invalid name format'})
        
        try:
            # Save to database
            contact_model = ContactModel()
            message_data = {
                'name': name,
                'email': email,
                'subject': subject,
                'message': message,
                'status': 'unread'
            }
            contact_model.save_message(message_data)
            
            # Send email notification
            send_email_notification(name, email, subject, message)
            
            # Log the message for debugging
            print(f"Contact form submission saved:")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Subject: {subject}")
            
            return jsonify({
                'success': True, 
                'message': 'Thank you for your message! I will get back to you within 24 hours.'
            })
        except Exception as e:
            print(f"Error saving contact message: {e}")
            return jsonify({
                'success': False, 
                'message': 'Sorry, there was an error sending your message. Please try again.'
            })
    
    return render_template("contact.html", app_name=APP_CONFIG["name"], csrf_token=generate_csrf_token())


# ===================================
# ADMIN ROUTES FOR PROJECT MANAGEMENT
# ===================================

@app.route("/admin")
@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    """Admin dashboard with overview"""
    project_model = ProjectModel()
    projects = project_model.get_all_projects()
    
    stats = {
        'total_projects': len(projects),
        'featured_projects': len([p for p in projects if p.get('featured')]),
        'completed_projects': len([p for p in projects if p.get('status') == 'completed']),
        'in_progress_projects': len([p for p in projects if p.get('status') == 'in_progress'])
    }
    
    return render_template("admin/dashboard.html", 
                         app_name=APP_CONFIG["name"],
                         stats=stats,
                         recent_projects=projects[:5])

@app.route("/admin/projects")
@admin_required
def admin_projects():
    """Admin page to manage projects"""
    project_model = ProjectModel()
    projects = project_model.get_all_projects()
    
    # Parse technologies JSON for each project
    for project in projects:
        if project.get('technologies'):
            try:
                project['technologies'] = json.loads(project['technologies'])
            except:
                project['technologies'] = []
    
    return render_template("admin/projects.html", 
                         app_name=APP_CONFIG["name"],
                         projects=projects)

@app.route("/admin/projects/add", methods=['GET', 'POST'])
@admin_required
def admin_add_project():
    """Add a new project"""
    if request.method == 'POST':
        project_model = ProjectModel()
        
        # Get form data
        project_data = {
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'long_description': request.form.get('long_description', ''),
            'technologies': json.dumps(request.form.getlist('technologies')),
            'project_type': request.form.get('project_type', 'web'),
            'status': request.form.get('status', 'completed'),
            'featured': bool(request.form.get('featured')),
            'image_url': request.form.get('image_url', ''),
            'demo_url': request.form.get('demo_url', ''),
            'github_url': request.form.get('github_url', ''),
            'case_study_url': request.form.get('case_study_url', ''),
            'display_order': int(request.form.get('display_order', 0))
        }
        
        project_id = project_model.add_project(project_data)
        return jsonify({'success': True, 'project_id': project_id})
    
    return render_template("admin/add_project.html", app_name=APP_CONFIG["name"])

@app.route("/admin/projects/<int:project_id>/edit", methods=['GET', 'POST'])
@admin_required
def admin_edit_project(project_id):
    """Edit an existing project"""
    project_model = ProjectModel()
    
    if request.method == 'POST':
        project_data = {
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'long_description': request.form.get('long_description', ''),
            'technologies': json.dumps(request.form.getlist('technologies')),
            'project_type': request.form.get('project_type', 'web'),
            'status': request.form.get('status', 'completed'),
            'featured': bool(request.form.get('featured')),
            'image_url': request.form.get('image_url', ''),
            'demo_url': request.form.get('demo_url', ''),
            'github_url': request.form.get('github_url', ''),
            'case_study_url': request.form.get('case_study_url', ''),
            'display_order': int(request.form.get('display_order', 0))
        }
        
        project_model.update_project(project_id, project_data)
        return jsonify({'success': True})
    
    project = project_model.get_project_by_id(project_id)
    if project and project.get('technologies'):
        try:
            project['technologies'] = json.loads(project['technologies'])
        except:
            project['technologies'] = []
    
    return render_template("admin/edit_project.html", 
                         app_name=APP_CONFIG["name"],
                         project=project)

@app.route("/admin/projects/<int:project_id>/delete", methods=['POST'])
@admin_required
def admin_delete_project(project_id):
    """Delete a project"""
    project_model = ProjectModel()
    project_model.delete_project(project_id)
    return jsonify({'success': True})

@app.route("/api/projects")
def api_projects():
    """API endpoint to get projects"""
    project_model = ProjectModel()
    project_type = request.args.get('type')
    featured_only = request.args.get('featured') == 'true'
    
    if project_type:
        projects = project_model.get_projects_by_type(project_type)
    else:
        projects = project_model.get_all_projects(featured_only=featured_only)
    
    # Parse technologies JSON for each project
    for project in projects:
        if project.get('technologies'):
            try:
                project['technologies'] = json.loads(project['technologies'])
            except:
                project['technologies'] = []
    
    return jsonify(projects)



@app.route("/faq")
def faq():
    return render_template("faq.html", app_name=APP_CONFIG["name"])

# ===================================
# BLOG ROUTES
# ===================================

def get_public_field_notes(limit=None, offset=0):
    """Return database posts, falling back to the curated evidence-led notes."""
    try:
        posts = BlogModel().get_all_posts(status='published', limit=limit, offset=offset)
    except Exception:
        posts = []
    return posts or get_curated_field_notes()[offset:offset + limit if limit else None]


def get_public_recent_field_notes(limit=5):
    try:
        posts = BlogModel().get_recent_posts(limit=limit)
    except Exception:
        posts = []
    return posts or get_curated_field_notes()[:limit]


def get_public_featured_field_notes(limit=3):
    """Return featured database posts without making the public archive DB-dependent."""
    try:
        posts = BlogModel().get_featured_posts(limit=limit)
    except Exception:
        posts = []
    return posts or [post for post in get_curated_field_notes() if post['featured']][:limit]


def get_public_categories():
    try:
        categories = BlogModel().get_categories()
    except Exception:
        categories = []
    if categories:
        return categories
    return [
        {'name': category, 'slug': category.lower().replace(' ', '-')}
        for category in sorted({post['category'] for post in get_curated_field_notes()})
    ]

@app.route("/blog")
def blog():
    """Blog listing page"""
    page = request.args.get('page', 1, type=int)
    per_page = 6
    offset = (page - 1) * per_page
    
    posts = get_public_field_notes(limit=per_page, offset=offset)
    featured_posts = get_public_featured_field_notes(limit=3)
    categories = get_public_categories()
    recent_posts = get_public_recent_field_notes(limit=5)
    
    return render_template("blog/index.html", 
                         app_name=APP_CONFIG["name"],
                         posts=posts,
                         featured_posts=featured_posts,
                         categories=categories,
                         recent_posts=recent_posts,
                         current_page=page)

@app.route("/blog/<slug>")
def blog_post(slug):
    """Individual blog post page"""
    blog_model = BlogModel()
    try:
        post = blog_model.get_post_by_slug(slug)
    except Exception:
        post = None
    if not post:
        post = next((candidate for candidate in get_curated_field_notes() if candidate['slug'] == slug), None)
    
    if not post:
        return render_template('404.html', app_name=APP_CONFIG["name"]), 404
    
    # Increment views
    if post.get('source') != 'curated':
        try:
            blog_model.increment_views(post['id'])
        except Exception:
            pass
    
    # Get related posts
    if post.get('source') == 'curated':
        related_posts = [candidate for candidate in get_curated_field_notes() if candidate['category'] == post['category']]
    else:
        try:
            related_posts = blog_model.get_posts_by_category(post['category'], limit=3)
        except Exception:
            related_posts = []
    recent_posts = get_public_recent_field_notes(limit=5)
    categories = get_public_categories()
    
    return render_template("blog/post.html",
                         app_name=APP_CONFIG["name"],
                         post=post,
                         related_posts=related_posts,
                         recent_posts=recent_posts,
                         categories=categories)

@app.route("/blog/category/<category_slug>")
def blog_category(category_slug):
    """Blog posts by category"""
    blog_model = BlogModel()
    try:
        posts = blog_model.get_posts_by_category(category_slug)
    except Exception:
        posts = []
    if not posts:
        posts = [post for post in get_curated_field_notes() if post['category'].lower().replace(' ', '-') == category_slug]
    categories = get_public_categories()
    recent_posts = get_public_recent_field_notes(limit=5)
    
    # Find category name
    category_name = category_slug.replace('-', ' ').title()
    
    return render_template("blog/category.html",
                         app_name=APP_CONFIG["name"],
                         posts=posts,
                         category_name=category_name,
                         category_slug=category_slug,
                         categories=categories,
                         recent_posts=recent_posts)

@app.route("/blog/search")
def blog_search():
    """Blog search"""
    query = request.args.get('q', '')
    blog_model = BlogModel()
    
    if query:
        try:
            posts = blog_model.search_posts(query)
        except Exception:
            posts = []
        if not posts:
            posts = [
                post for post in get_curated_field_notes()
                if query.lower() in f"{post['title']} {post['excerpt']} {post['content']}".lower()
            ]
    else:
        posts = []
    
    categories = get_public_categories()
    recent_posts = get_public_recent_field_notes(limit=5)
    
    return render_template("blog/search.html",
                         app_name=APP_CONFIG["name"],
                         posts=posts,
                         query=query,
                         categories=categories,
                         recent_posts=recent_posts)

# ===================================
# ADMIN BLOG ROUTES
# ===================================

@app.route("/admin/blog")
@admin_required
def admin_blog():
    """Admin blog management"""
    blog_model = BlogModel()
    posts = blog_model.get_all_posts(status='published') + blog_model.get_all_posts(status='draft')
    categories = blog_model.get_categories()
    
    return render_template("admin/blog.html",
                         app_name=APP_CONFIG["name"],
                         posts=posts,
                         categories=categories)

@app.route("/admin/blog/add", methods=['GET', 'POST'])
@admin_required
def admin_add_blog_post():
    """Add new blog post"""
    if request.method == 'POST':
        blog_model = BlogModel()
        title = request.form.get('title', '').strip()
        submitted_slug = request.form.get('slug', '').strip()
        post_data = {
            'title': title,
            'slug': submitted_slug or slugify_text(title),
            'excerpt': request.form.get('excerpt'),
            'content': request.form.get('content'),
            'featured_image': request.form.get('featured_image', ''),
            'category': request.form.get('category'),
            'tags': request.form.getlist('tags'),
            'status': request.form.get('status', 'draft'),
            'featured': bool(request.form.get('featured')),
            'reading_time': int(request.form.get('reading_time', 5))
        }
        
        post_id = blog_model.add_post(post_data)
        return jsonify({'success': True, 'post_id': post_id})
    
    blog_model = BlogModel()
    categories = blog_model.get_categories()
    
    return render_template("admin/add_blog_post.html",
                         app_name=APP_CONFIG["name"],
                         categories=categories)

@app.route("/admin/blog/<int:post_id>/edit", methods=['GET', 'POST'])
@admin_required
def admin_edit_blog_post(post_id):
    """Edit blog post"""
    blog_model = BlogModel()
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        submitted_slug = request.form.get('slug', '').strip()
        post_data = {
            'title': title,
            'slug': submitted_slug or slugify_text(title),
            'excerpt': request.form.get('excerpt'),
            'content': request.form.get('content'),
            'featured_image': request.form.get('featured_image', ''),
            'category': request.form.get('category'),
            'tags': request.form.getlist('tags'),
            'status': request.form.get('status', 'draft'),
            'featured': bool(request.form.get('featured')),
            'reading_time': int(request.form.get('reading_time', 5))
        }
        
        blog_model.update_post(post_id, post_data)
        return jsonify({'success': True})
    
    # Get post data for editing
    cursor = blog_model.connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM blog_posts WHERE id = %s", (post_id,))
    post = cursor.fetchone()
    cursor.close()
    
    if post and post['tags']:
        try:
            post['tags'] = json.loads(post['tags'])
        except:
            post['tags'] = []
    
    categories = blog_model.get_categories()
    
    return render_template("admin/edit_blog_post.html",
                         app_name=APP_CONFIG["name"],
                         post=post,
                         categories=categories)

@app.route("/admin/blog/<int:post_id>/delete", methods=['POST'])
@admin_required
def admin_delete_blog_post(post_id):
    """Delete blog post"""
    blog_model = BlogModel()
    blog_model.delete_post(post_id)
    return jsonify({'success': True})

# ===================================
# ADMIN CONTACT MANAGEMENT ROUTES
# ===================================

@app.route("/admin/contacts")
@admin_required
def admin_contacts():
    """Admin contact messages management"""
    contact_model = ContactModel()
    messages = contact_model.get_all_messages()
    
    # Count unread messages
    unread_count = len([msg for msg in messages if msg.get('status') == 'unread'])
    
    return render_template("admin/contacts.html",
                         app_name=APP_CONFIG["name"],
                         messages=messages,
                         unread_count=unread_count)

@app.route("/admin/contacts/<int:message_id>/read", methods=['POST'])
@admin_required
def admin_mark_message_read(message_id):
    """Mark contact message as read"""
    # CSRF Protection for admin actions
    if not validate_csrf_token():
        return jsonify({'success': False, 'error': 'CSRF token validation failed'}), 403
    
    try:
        contact_model = ContactModel()
        contact_model.mark_as_read(message_id)
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error marking message as read: {e}")
        return jsonify({'success': False, 'error': 'Database error'}), 500

# ===================================
# CV DOWNLOAD ROUTE
# ===================================

@app.route("/download-cv")
def download_cv():
    """Generate and download the verified professional CV as a PDF."""
    from io import BytesIO
    from xhtml2pdf import pisa

    html_content = render_template('cv_print_optimized.html')
    pdf_buffer = BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_content,
        dest=pdf_buffer,
        encoding='UTF-8',
    )
    pdf_bytes = pdf_buffer.getvalue()

    if pisa_status.err or not pdf_bytes.startswith(b'%PDF'):
        app.logger.error('CV PDF generation failed: %s', getattr(pisa_status, 'log', 'invalid PDF output'))
        return Response('CV PDF generation failed.', status=500, mimetype='text/plain')

    response = Response(pdf_bytes, mimetype='application/pdf')
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename="Dhirendra_Yadav_CV.pdf"'
    response.headers['Cache-Control'] = 'public, max-age=300'

    return response

@app.route("/cv")
def cv_main():
    """Main CV page - print optimized"""
    return render_template('cv_print_optimized.html')


# Debug route to check if static files are accessible
@app.route("/debug/static")
def debug_static():
    import os
    static_path = os.path.join(app.root_path, 'static', 'images', 'profile.jpg')
    file_exists = os.path.exists(static_path)
    file_size = os.path.getsize(static_path) if file_exists else 0
    return f"Static file check:<br>Path: {static_path}<br>Exists: {file_exists}<br>Size: {file_size} bytes"


# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', app_name=APP_CONFIG["name"], current_year=datetime.datetime.now().year), 404

@app.context_processor
def inject_current_year():
    return {'current_year': datetime.datetime.now().year}

@app.context_processor
def inject_csrf_token():
    return {'csrf_token': generate_csrf_token()}

@app.context_processor
def inject_asset_version():
    return {'asset_version': ASSET_VERSION}


@app.context_processor
def inject_seo_context():
    """Provide stable, query-free canonical URLs and JSON-LD entity data."""
    path = request.path or '/'
    canonical_url = f"{SITE_URL}{path if path == '/' else path.rstrip('/')}"
    return {
        'site_url': SITE_URL,
        'site_name': SITE_NAME,
        'site_description': SITE_DESCRIPTION,
        'canonical_url': canonical_url,
        'default_og_image': f"{SITE_URL}/static/images/profile-hero.jpg",
        'google_site_verification': os.environ.get('GOOGLE_SITE_VERIFICATION', ''),
        'bing_site_verification': os.environ.get('BING_SITE_VERIFICATION', ''),
    }


@app.route('/robots.txt')
def robots_txt():
    """Explicit crawl policy for search and answer engines."""
    body = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /debug/
Disallow: /blog/search

Sitemap: {SITE_URL}/sitemap.xml
"""
    return Response(body, mimetype='text/plain')


def normalize_sitemap_date(value, fallback):
    """Return an ISO calendar date without using the request date."""
    if value is None:
        return fallback
    if hasattr(value, 'date') and not isinstance(value, str):
        value = value.date()
    candidate = str(value)[:10]
    try:
        return datetime.date.fromisoformat(candidate).isoformat()
    except ValueError:
        return fallback


@app.route('/sitemap.xml')
def sitemap_xml():
    """Generate a discoverable sitemap from public routes and content."""
    release_date = '2026-07-28'
    route_dates = {
        '/': release_date,
        '/about': release_date,
        '/skills': release_date,
        '/portfolio': release_date,
        '/contact': release_date,
        '/blog': release_date,
        '/faq': release_date,
    }
    urls = [
        ('/', '1.0', route_dates['/']),
        ('/about', '0.8', route_dates['/about']),
        ('/skills', '0.8', route_dates['/skills']),
        ('/portfolio', '0.9', route_dates['/portfolio']),
        ('/contact', '0.7', route_dates['/contact']),
        ('/blog', '0.8', route_dates['/blog']),
        ('/faq', '0.6', route_dates['/faq']),
    ]
    try:
        urls.extend(
            (
                f"/work/{project['slug']}",
                '0.7',
                normalize_sitemap_date(project.get('updated_at'), release_date),
            )
            for project in load_curated_projects()
        )
    except Exception:
        pass
    try:
        posts = get_public_field_notes(limit=200, offset=0)
        urls.extend(
            (
                f"/blog/{post['slug']}",
                '0.7',
                normalize_sitemap_date(
                    post.get('updated_at') or post.get('created_at'),
                    release_date,
                ),
            )
            for post in posts
            if post.get('slug')
        )
    except Exception:
        pass
    # Deduplicate routes so crawlers receive one canonical URL per resource.
    unique_urls = {}
    for path, priority, lastmod in urls:
        previous = unique_urls.get(path)
        if previous is None or priority > previous[0]:
            unique_urls[path] = (priority, lastmod)
    entries = ''.join(
        f'<url><loc>{SITE_URL}{path}</loc><lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>{priority}</priority></url>'
        for path, (priority, lastmod) in unique_urls.items()
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{entries}</urlset>'
    return Response(xml, mimetype='application/xml')


@app.route('/llms.txt')
def llms_txt():
    """Compact entity and content map for AI answer engines."""
    return Response(f"""# {SITE_NAME}

> {SITE_DESCRIPTION}

## Entity
- Name: Dhirendra Yadav
- Location: Bhaktapur, Nepal
- Focus: cybersecurity, AI/ML, systems engineering, secure automation, and product engineering
- Website: {SITE_URL}
- Contact: mailto:thedhirendrayadav@gmail.com
- GitHub: https://github.com/thedhirendrayadav
- LinkedIn: https://www.linkedin.com/in/dhirendra-yadav-3b1387425

## Public pages
- [Home]({SITE_URL}/): Identity, specialties, selected work, and current availability.
- [About]({SITE_URL}/about): Background, education, working principles, and professional focus.
- [Expertise]({SITE_URL}/skills): Cybersecurity, AI/ML, product engineering, and automation capabilities.
- [Selected work]({SITE_URL}/portfolio): Evidence-led project and systems case studies.
- [Writing]({SITE_URL}/blog): Field notes and technical analysis.
- [FAQ]({SITE_URL}/faq): Direct answers about services, location, and project status.
- [Contact]({SITE_URL}/contact): Project enquiries and collaboration.

## Selected case studies
- [Secure Portfolio Platform]({SITE_URL}/work/secure-portfolio-platform): Flask platform controls, implementation evidence, and current limitations.
- [Multi-Channel AI Messaging]({SITE_URL}/work/multi-channel-ai-messaging): Channel boundaries, queue processing, authorization, and data-model evidence.
- [NEPSE Market Intelligence]({SITE_URL}/work/nepse-market-intelligence): Research workflow covering ingestion, indicators, models, and backtesting constraints.
- [RunPod Media Orchestrator]({SITE_URL}/work/runpod-media-orchestrator): GPU workflow boundaries, lifecycle control, and verification evidence.

## Editorial standard
Project pages distinguish claims, sources, constraints, and verified outcomes. Treat prototypes and in-development systems as such; do not describe them as production deployments unless the page explicitly says so.
    """, mimetype='text/plain')


@app.route('/humans.txt')
def humans_txt():
    """Publish a lightweight authorship and contact signal for people and agents."""
    return Response(f"""/* TEAM */
Name: {SITE_NAME}
Role: Cybersecurity, AI/ML, and systems engineer
Location: Bhaktapur, Nepal
Website: {SITE_URL}
Contact: thedhirendrayadav@gmail.com

/* SITE */
Standards: HTTPS, semantic HTML, JSON-LD, RSS, XML sitemap
Last updated: {datetime.date.today().isoformat()}
""", mimetype='text/plain')


@app.route('/manifest.webmanifest')
def manifest_webmanifest():
    """Minimal install metadata with a stable canonical identity."""
    return jsonify({
        "name": "Dhirendra Yadav — Security Fieldwork",
        "short_name": "Dhirendra Yadav",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "background_color": "#0b0c0c",
        "theme_color": "#9df9f3",
        "description": SITE_DESCRIPTION,
        "icons": [{"src": "/static/svg/favicon.svg", "sizes": "any", "type": "image/svg+xml"}],
    })


@app.route(f'/{INDEXNOW_KEY}.txt')
def indexnow_key_file():
    """IndexNow ownership key used by Bing, Yahoo, and Yandex discovery."""
    return Response(INDEXNOW_KEY, mimetype='text/plain')


@app.route('/feed.xml')
def feed_xml():
    """RSS feed for published field notes."""
    posts = get_public_field_notes(limit=20, offset=0)
    items = []
    for post in posts:
        slug = post.get('slug')
        if not slug:
            continue
        title = post.get('title', '')
        excerpt = post.get('excerpt') or ''
        items.append(f'<item><title>{title}</title><link>{SITE_URL}/blog/{slug}</link><guid>{SITE_URL}/blog/{slug}</guid><description>{excerpt}</description></item>')
    xml = f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>{SITE_NAME} — Field Notes</title><link>{SITE_URL}/blog</link><description>{SITE_DESCRIPTION}</description>{"".join(items)}</channel></rss>'
    return Response(xml, mimetype='application/rss+xml')

if __name__ == "__main__":
    # Bind to 0.0.0.0 and honor Railway's $PORT; disable debug in production.
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "False").lower() in ("1", "true", "yes")
    app.run(debug=debug, host="0.0.0.0", port=port)
