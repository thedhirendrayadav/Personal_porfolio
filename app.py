from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import datetime
import json
import os
import secrets
from functools import wraps
from config import APP_CONFIG, ADMIN_CONFIG
from unified_models import ProjectModel, CategoryModel, BlogModel, ContactModel
from database import db


def ensure_database_and_tables():
    """Ensure database and tables are set up"""
    db.ensure_database_setup()
    
    # Initialize models to create tables (MySQL only)
    project_model = ProjectModel()
    category_model = CategoryModel()
    blog_model = BlogModel()
    project_model.create_projects_table()
    category_model.create_categories_table()
    blog_model.create_blog_tables()


def get_visit_count_and_increment() -> int:
    """Get and increment visit count"""
    try:
        return db.increment_visit_count()
    except Exception as e:
        print(f"Visit count error: {e}")
        return 1  # Return a default value


app = Flask(__name__)

# Security Configuration
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', ADMIN_CONFIG["secret_key"]),
    SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=datetime.timedelta(hours=2),
    SEND_FILE_MAX_AGE_DEFAULT=31536000  # 1 year for static files
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
    return render_template("index.html", visit_count=visit_count, app_name=APP_CONFIG["name"]) 

@app.route("/about")
def about():
    return render_template("about.html", app_name=APP_CONFIG["name"])

@app.route("/portfolio")
def portfolio():
    project_model = ProjectModel()
    category_model = CategoryModel()
    
    # Get featured projects for display
    projects = project_model.get_all_projects(featured_only=True)
    categories = category_model.get_all_categories()
    
    # Parse technologies JSON for each project
    for project in projects:
        if project.get('technologies'):
            try:
                project['technologies'] = json.loads(project['technologies'])
            except:
                project['technologies'] = []
    
    return render_template("portfolio.html", 
                         app_name=APP_CONFIG["name"],
                         projects=projects,
                         categories=categories)

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

@app.route("/blog")
def blog():
    """Blog listing page"""
    blog_model = BlogModel()
    page = request.args.get('page', 1, type=int)
    per_page = 6
    offset = (page - 1) * per_page
    
    posts = blog_model.get_all_posts(limit=per_page, offset=offset)
    featured_posts = blog_model.get_featured_posts(limit=3)
    categories = blog_model.get_categories()
    recent_posts = blog_model.get_recent_posts(limit=5)
    
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
    post = blog_model.get_post_by_slug(slug)
    
    if not post:
        return render_template('404.html', app_name=APP_CONFIG["name"]), 404
    
    # Increment views
    blog_model.increment_views(post['id'])
    
    # Get related posts
    related_posts = blog_model.get_posts_by_category(post['category'], limit=3)
    recent_posts = blog_model.get_recent_posts(limit=5)
    categories = blog_model.get_categories()
    
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
    posts = blog_model.get_posts_by_category(category_slug)
    categories = blog_model.get_categories()
    recent_posts = blog_model.get_recent_posts(limit=5)
    
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
        posts = blog_model.search_posts(query)
    else:
        posts = []
    
    categories = blog_model.get_categories()
    recent_posts = blog_model.get_recent_posts(limit=5)
    
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
        
        post_data = {
            'title': request.form.get('title'),
            'slug': request.form.get('slug'),
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
        post_data = {
            'title': request.form.get('title'),
            'slug': request.form.get('slug'),
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
    """Generate and download modern CV as HTML (optimized for PDF printing)"""
    from flask import make_response
    
    # Render the CV template with PDF optimization
    html_content = render_template('cv_modern.html', pdf_mode=True)
    
    # Create response with proper headers for download
    response = make_response(html_content)
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    response.headers['Content-Disposition'] = 'attachment; filename="Dhirendra_Yadav_CV.html"'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route("/cv-preview")
def cv_preview():
    """Preview CV in browser (optimized for PDF printing)"""
    return render_template('cv_modern.html', pdf_mode=True)


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

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
