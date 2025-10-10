"""
Health check endpoint for Vercel deployment
"""

from flask import Flask, jsonify
import os
import sys

app = Flask(__name__)

@app.route('/')
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "message": "Vercel deployment is working!",
        "environment": {
            "vercel": os.environ.get('VERCEL', 'not set'),
            "vercel_env": os.environ.get('VERCEL_ENV', 'not set'),
            "database_type": os.environ.get('DATABASE_TYPE', 'not set'),
            "supabase_url": "set" if os.environ.get('SUPABASE_URL') else "not set",
            "supabase_key": "set" if os.environ.get('SUPABASE_KEY') else "not set",
        },
        "python": {
            "version": sys.version,
            "path": sys.path[:3]  # First 3 paths only
        }
    })

# Vercel entry point
application = app

if __name__ == "__main__":
    app.run(debug=True)