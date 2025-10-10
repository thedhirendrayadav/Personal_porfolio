"""
Simple test endpoint for Vercel deployment debugging
"""

from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return {
        "status": "success",
        "message": "Vercel deployment is working!",
        "endpoint": "test"
    }

@app.route('/health')
def health():
    import os
    return {
        "status": "healthy",
        "vercel": os.environ.get('VERCEL', 'not set'),
        "vercel_env": os.environ.get('VERCEL_ENV', 'not set'),
        "python_path": os.environ.get('PYTHONPATH', 'not set')
    }

# Vercel entry point
application = app

if __name__ == "__main__":
    app.run(debug=True)