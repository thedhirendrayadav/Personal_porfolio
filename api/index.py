"""
Vercel Entry Point for Flask Application
This file is required for Vercel to properly serve the Flask app
"""

import sys
import os
from flask import Flask, jsonify

# Add the parent directory to the path so we can import our app
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Set Vercel environment flag
os.environ['VERCEL'] = '1'

# Set default environment variables if not present
if not os.environ.get('DATABASE_TYPE'):
    os.environ['DATABASE_TYPE'] = 'supabase'

if not os.environ.get('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'production'

if not os.environ.get('SECRET_KEY'):
    os.environ['SECRET_KEY'] = 'fallback-secret-key-for-vercel'

# Initialize app variable
app = None
import_error = None

try:
    # Try to import the main app
    from app import app as main_app
    app = main_app
    print("✅ Flask app imported successfully")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    import_error = str(e)
    import traceback
    traceback.print_exc()
    
except Exception as e:
    print(f"❌ General Error: {e}")
    import_error = str(e)
    import traceback
    traceback.print_exc()

# Create fallback app if main app failed to load
if app is None:
    print("🔄 Creating fallback Flask app")
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-key')
    
    @app.route('/')
    def hello():
        return jsonify({
            "status": "error",
            "message": f"Failed to load main application: {import_error}",
            "type": "import_error",
            "help": "Check Vercel function logs for details"
        })
    
    @app.route('/debug')
    def debug():
        return jsonify({
            "status": "debug",
            "error": import_error,
            "python_path": sys.path,
            "environment": {k: v for k, v in os.environ.items() if not k.startswith('SUPABASE')},
            "working_directory": os.getcwd(),
            "files_in_root": os.listdir(parent_dir) if os.path.exists(parent_dir) else []
        })
    
    @app.route('/health')
    def health():
        return jsonify({"status": "fallback_app_running"})
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "status": "error",
            "message": f"Main application failed to load: {import_error}",
            "path": "404",
            "type": "import_error"
        }), 404

# Vercel expects the WSGI application to be available as 'app'
# This is the entry point for Vercel
application = app

# For local testing
if __name__ == "__main__":
    app.run(debug=False)