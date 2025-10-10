"""
Minimal Flask app for Vercel deployment
Removes problematic imports and focuses on core functionality
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json

app = Flask(__name__, static_folder='static')

# Add explicit static file handling
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Basic configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')

@app.route('/')
def index():
    """Simple index route"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': '2024-01-01T00:00:00Z'
    })

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/skills')
def skills():
    return render_template('skills.html')

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)