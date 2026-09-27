import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

APP_CONFIG = {
    "name": "Personal Portfolio",
}

# Database Configuration - Support both MySQL and Supabase
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "mysql").strip().lower()

# MySQL Configuration
# Local MySQL development settings. Production Render deployments use Supabase.
MYSQL_CONFIG = {
    "host": os.getenv("MYSQLHOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQLPORT", "3306")),
    "user": os.getenv("MYSQLUSER", "root"),
    "password": os.getenv("MYSQLPASSWORD", ""),
    "database": os.getenv("MYSQLDATABASE", "personal_portfolio"),
}

# Supabase Configuration
SUPABASE_CONFIG = {
    "url": os.getenv("SUPABASE_URL"),
    # This app calls Supabase only from its server. Prefer the current secret
    # key while retaining compatibility with legacy deployment variables.
    "key": (
        os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_KEY")
        or os.getenv("SUPABASE_KEY")
    ),
}

# Admin Authentication Configuration
ADMIN_CONFIG = {
    "username": os.getenv("ADMIN_USERNAME", ""),
    "password": os.getenv("ADMIN_PASSWORD", ""),
    "secret_key": os.getenv("SECRET_KEY"),
}

# Email Configuration (Gmail SMTP)
EMAIL_CONFIG = {
    "smtp_server": os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("MAIL_PORT", "587")),
    "sender_email": os.getenv("MAIL_USERNAME", ""),
    "sender_password": os.getenv("MAIL_PASSWORD", ""),  # Gmail App Password
    "receiver_email": os.getenv("RECEIVER_EMAIL", "Dhirendrayadav4999@gmail.com"),
}
