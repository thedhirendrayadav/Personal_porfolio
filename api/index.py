"""
Vercel Entry Point for Flask Application
This file is required for Vercel to properly serve the Flask app
"""

import sys
import os
from flask import Flask

# Add the parent directory to the path so we can import our app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Vercel environment flag
os.environ['VERCEL'] = '1'

# Set default environment variables if not present
if not os.environ.get('DATABASE_TYPE'):
    os.environ['DATABASE_TYPE'] = 'supabase'

if not os.environ.get('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'production'

try:
    # Try to import the main app
    from app import app
    print("✅ Flask app imported successfully")
    
    # Test basic functionality
    with app.app_context():
        print("✅ App context created successfully")
    
except Exception as e:
    print(f"❌ Error importing Flask app: {e}")
    import traceback
    traceback.print_exc()
    
    # Create a minimal Flask app as fallback
    app = Flask(__name__)
    
    @app.route('/')
    def hello():
        return {
            "status": "error",
            "message": f"Failed to load main application: {str(e)}",
            "type": "import_error"
        }
    
    @app.route('/debug')
    def debug():
        return {
            "status": "debug",
            "error": str(e),
            "python_path": sys.path,
            "environment": dict(os.environ),
            "working_directory": os.getcwd()
        }
    
    @app.route('/<path:path>')
    def catch_all(path):
        return {
            "status": "error",
            "message": f"Failed to load main application: {str(e)}",
            "path": path,
            "type": "import_error"
        }

# Vercel expects the WSGI application to be available as 'app'
# This is the entry point for Vercel
application = app

# For local testing
if __name__ == "__main__":
    app.run(debug=False)