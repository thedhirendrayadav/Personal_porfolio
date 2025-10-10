#!/usr/bin/env python3
"""
Test script to verify the app can start without errors
"""

import os
import sys

def test_app_startup():
    """Test if the app can be imported and initialized without errors"""
    try:
        print("Testing app startup...")
        
        # Test config import
        from config import APP_CONFIG, ADMIN_CONFIG, DATABASE_TYPE
        print(f"✅ Config loaded - Database type: {DATABASE_TYPE}")
        
        # Test database import
        from database import db
        print("✅ Database module imported")
        
        # Test models import
        from unified_models import ProjectModel, CategoryModel, BlogModel, ContactModel
        print("✅ Models imported")
        
        # Test Flask app import (this will trigger database initialization)
        print("Testing Flask app import...")
        from app import app
        print("✅ Flask app imported successfully")
        
        # Test a simple route
        with app.test_client() as client:
            response = client.get('/')
            print(f"✅ Index route test: Status {response.status_code}")
            
        print("\n🎉 All tests passed! The app should work on Vercel.")
        return True
        
    except Exception as e:
        print(f"❌ Error during startup test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_app_startup()
    sys.exit(0 if success else 1)