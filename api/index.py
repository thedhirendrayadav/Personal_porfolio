"""
Vercel Entry Point for Flask Application
This file is required for Vercel to properly serve the Flask app
"""

import sys
import os

# Add the parent directory to the path so we can import our app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# This is the entry point for Vercel
if __name__ == "__main__":
    app.run()