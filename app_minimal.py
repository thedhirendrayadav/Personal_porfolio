"""
Minimal Flask app for Vercel deployment
Removes problematic imports and focuses on core functionality
"""

from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# Basic configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')

@app.route('/')
def index():
    """Simple index route"""
    return jsonify({
        'status': 'success',
        'message': 'Portfolio app is running',
        'environment': 'vercel' if os.environ.get('VERCEL') else 'local'
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': '2024-01-01T00:00:00Z'
    })

@app.route('/api/test')
def api_test():
    """API test endpoint"""
    return jsonify({
        'api': 'working',
        'database_type': os.environ.get('DATABASE_TYPE', 'unknown'),
        'supabase_configured': bool(os.environ.get('SUPABASE_URL'))
    })

if __name__ == '__main__':
    app.run(debug=True)