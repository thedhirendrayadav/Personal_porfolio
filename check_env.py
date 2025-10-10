#!/usr/bin/env python3
"""
Environment variable checker for Vercel deployment
"""

import os
from dotenv import load_dotenv

# Load .env file for local testing
load_dotenv()

def check_environment():
    """Check if all required environment variables are set"""
    
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY', 
        'SECRET_KEY',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD'
    ]
    
    print("🔍 Checking environment variables...")
    
    missing_vars = []
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            # Show first few characters for security
            display_value = value[:10] + "..." if len(value) > 10 else value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    # Check optional vars
    optional_vars = ['DATABASE_TYPE', 'FLASK_ENV', 'VERCEL', 'VERCEL_ENV']
    print("\n📋 Optional environment variables:")
    for var in optional_vars:
        value = os.environ.get(var, 'not set')
        print(f"   {var}: {value}")
    
    if missing_vars:
        print(f"\n❌ Missing required variables: {', '.join(missing_vars)}")
        print("   Set these in your Vercel dashboard under Settings > Environment Variables")
        return False
    else:
        print("\n✅ All required environment variables are set!")
        return True

if __name__ == "__main__":
    check_environment()