from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/api/test')
def test():
    """Simple test endpoint to verify Vercel deployment"""
    return jsonify({
        'status': 'success',
        'message': 'Vercel deployment is working',
        'python_version': os.sys.version,
        'environment': dict(os.environ)
    })

if __name__ == '__main__':
    app.run()