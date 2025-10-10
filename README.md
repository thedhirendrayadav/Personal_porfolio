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
- **Deployment**: Vercel, Railway, Render (multiple options)
- **Security**: CSRF tokens, rate limiting, input validation

## 🚀 Quick Deploy

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/personal_portfolio)

1. Click the deploy button above
2. Connect your GitHub account
3. Set environment variables (see below)
4. Deploy!

### Option 2: Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Click the deploy button
2. Connect your GitHub repository
3. Set environment variables
4. Deploy automatically

### Option 3: Deploy to Render

1. Fork this repository
2. Connect to Render
3. Set environment variables
4. Deploy

## ⚙️ Environment Variables

Set these in your deployment platform:

```bash
# Database Configuration
DATABASE_TYPE=supabase

# Supabase Configuration (get from supabase.com)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Security (generate secure values)
SECRET_KEY=your_64_character_secret_key
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# App Settings
FLASK_ENV=production
FLASK_DEBUG=False
```

## 🗄️ Database Setup

### Supabase Setup (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor
4. Copy and run the contents of `supabase_schema.sql`
5. Get your credentials from Settings → API

### Local Development with MySQL

1. Install MySQL
2. Update `.env` with your MySQL credentials
3. Set `DATABASE_TYPE=mysql`

## 🏃‍♂️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/personal_portfolio.git
   cd personal_portfolio
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
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
├── vercel.json          # Vercel deployment config
├── models/              # Database models
│   ├── project_model.py
│   ├── blog_model.py
│   └── contact_model.py
├── templates/           # HTML templates
├── static/             # CSS, JS, images
├── supabase_schema.sql # Database schema
└── docs/               # Documentation
```

## 🔧 Configuration

### Database Managers

The application includes multiple database managers for maximum compatibility:

- **`database_manager.py`**: Full-featured with Supabase Python client
- **`simple_database_manager.py`**: Simplified version with fallbacks
- **`rest_database_manager.py`**: REST API only (most compatible)

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

## 🚀 Deployment Platforms

### Vercel (Recommended)
- Zero configuration
- Automatic deployments
- Global CDN
- Free tier available

### Railway
- Simple GitHub integration
- Automatic deployments
- Built-in database options
- Easy environment management

### Render
- Free tier available
- Automatic SSL
- Custom domains
- Easy database integration

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

Ready to deploy? Click one of the deploy buttons above! 🚀