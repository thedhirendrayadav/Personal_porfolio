# 🚀 Personal Portfolio Website

A modern, responsive personal portfolio website built with Flask and Supabase, featuring a complete admin panel for content management.

## ✨ Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Admin Panel**: Full CRUD operations for projects, blog posts, and contact messages
- **Database Agnostic**: Supports both MySQL and Supabase
- **Security First**: CSRF protection, rate limiting, and secure authentication
- **Blog System**: Complete blogging platform with categories and tags
- **Contact Form**: Secure contact form with spam protection
- **Visit Tracking**: Real-time visitor analytics
- **SEO Optimized**: Proper meta tags and structured data

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Database**: Supabase (PostgreSQL) / MySQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Deployment**: Render (Flask web service) with Supabase Postgres
- **Security**: CSRF tokens, rate limiting, input validation

## 🚀 Deploy to Render

The repository includes a `render.yaml` Blueprint for one Flask web service. Render builds the app from GitHub, runs it with Gunicorn, checks `/healthz`, and redeploys when the linked branch receives a commit.

### 1. Prepare Supabase

1. Create a Supabase project in Singapore so the database is near the Render service region.
2. Open its SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy the project URL and a server-side secret key from **Project Settings → API Keys**. A legacy `service_role` key is also supported.

### 2. Connect Render to GitHub

1. In Render, choose **New → Blueprint** and connect `thedhirendrayadav/Personal_porfolio`.
2. Select the repository's `main` branch and deploy the Blueprint.
3. When prompted, enter `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Render generates `SECRET_KEY` for the service.
4. After the first deploy, add `MAIL_USERNAME`, `MAIL_PASSWORD`, and `RECEIVER_EMAIL` in Render if contact form email notifications are needed.

Keep the Supabase secret key and admin credentials in Render's environment settings. Do not put them in GitHub or frontend code. The database tables use RLS and grant access to the service role used by the Flask backend.

### Required Render settings

`render.yaml` sets `DATABASE_TYPE=supabase`, uses `gunicorn --bind 0.0.0.0:$PORT app:app`, and configures `/healthz` as the health check. If the app uses a custom domain, set `SITE_URL` in Render to that canonical URL.

## 🗄️ Database Setup

For local MySQL development, set `DATABASE_TYPE=mysql` and provide `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE` in `.env`. Render production uses Supabase.

## 🏃‍♂️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thedhirendrayadav/Personal_porfolio.git
   cd Personal_porfolio
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment**:
   ```powershell
   Copy-Item .env.example .env
   # Edit .env with your credentials
   ```

4. **Test database connection**:
   ```bash
   python test_database.py
   ```

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Access the application**:
   - Website: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin/login

## 📁 Project Structure

```
personal_portfolio/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── database.py           # Database connection handler
├── requirements.txt      # Python dependencies
├── render.yaml          # Render Blueprint
├── models/              # Database models
│   ├── project_model.py
│   ├── blog_model.py
│   └── contact_model.py
├── templates/           # HTML templates
├── static/             # CSS, JS, images
├── supabase/
│   └── schema.sql      # Supabase database schema
└── docs/               # Documentation
```

## 🔧 Configuration

### Database Managers

The app uses `database_manager.py` for local MySQL and server-side Supabase REST calls. Supabase table setup is kept in `supabase/schema.sql` and is run once from the Supabase SQL Editor.

### Security Features

- CSRF protection on all forms
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Secure session management
- SQL injection prevention

## 📊 Admin Panel Features

Access at `/admin/login` with your admin credentials:

- **Dashboard**: Overview of site statistics
- **Projects**: Add, edit, delete portfolio projects
- **Blog**: Complete blog management system
- **Contact**: View and manage contact form submissions
- **Analytics**: Visit tracking and statistics

## 🎨 Customization

### Styling
- Edit CSS files in `static/css/`
- Modify templates in `templates/`
- Update colors and fonts in the CSS variables

### Content
- Add your projects via the admin panel
- Write blog posts through the admin interface
- Update personal information in templates

## 🔍 Testing

Run the test suite:

```bash
# Test database connection
python test_database.py

# Test the application
python -m pytest tests/

# Check for security issues
python -m bandit -r .
```

## 📈 Performance

- Optimized database queries
- Efficient static file serving
- Compressed responses
- Cached database connections
- Minimal JavaScript footprint

## 🛡️ Security

- Environment variables for sensitive data
- CSRF protection
- Rate limiting
- Input validation
- Secure headers
- SQL injection prevention

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Open a GitHub issue
- **Deployment Help**: See `DEPLOYMENT_GUIDE.md`
- **Setup Help**: See `SETUP_CREDENTIALS.md`

## 🎯 Roadmap

- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Social media integration
- [ ] API endpoints
- [ ] Mobile app

---

**Built with ❤️ using Flask and Supabase**

Ready to deploy? Connect this GitHub repository to Render and follow the setup steps above. 🚀
