#!/usr/bin/env python3
"""
Database Connection Test Script
Run this to verify your database configuration is working correctly.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test database connection and basic operations"""
    print("🔍 Testing Database Connection...")
    print(f"Database Type: {os.getenv('DATABASE_TYPE', 'mysql')}")
    
    try:
        # Import database manager with fallbacks
        try:
            from database_manager import db_manager
            print("✅ Using full database manager")
        except ImportError as e:
            print(f"⚠️ Full database manager not available: {e}")
            try:
                from simple_database_manager import simple_db_manager as db_manager
                print("✅ Using simple database manager")
            except ImportError as e2:
                print(f"⚠️ Simple database manager not available: {e2}")
                from rest_database_manager import rest_db_manager as db_manager
                print("✅ Using REST database manager")
        
        print("✅ Database manager imported successfully")
        
        # Test basic connection
        if db_manager.db_type == "supabase":
            print(f"🔗 Supabase URL: {os.getenv('SUPABASE_URL', 'Not set')}")
            print(f"🔑 Supabase Key: {'Set' if os.getenv('SUPABASE_KEY') else 'Not set'}")
            
            # Test Supabase connection
            try:
                # Test a simple query to site_visits table
                result = db_manager.select('site_visits', limit=1)
                print("✅ Supabase connection test successful")
                print(f"📊 Site visits table accessible: {isinstance(result, list)}")
            except Exception as e:
                print(f"❌ Supabase query failed: {e}")
                print("💡 Make sure you've run the supabase_schema.sql in your Supabase project")
                return False
                
        else:
            print(f"🔗 MySQL Host: {os.getenv('MYSQL_HOST', '127.0.0.1')}")
            print(f"👤 MySQL User: {os.getenv('MYSQL_USER', 'root')}")
            print(f"🗄️ MySQL Database: {os.getenv('MYSQL_DATABASE', 'personal_portfolio')}")
            
            # Test MySQL connection
            if db_manager.connection:
                print("✅ MySQL connection established")
                
                # Test a simple query
                try:
                    cursor = db_manager.connection.cursor()
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    cursor.close()
                    print("✅ MySQL connection test successful")
                except Exception as e:
                    print(f"❌ MySQL query failed: {e}")
                    return False
            else:
                print("❌ MySQL connection not established")
                return False
        
        # Test models
        print("\n🧪 Testing Models...")
        
        # Test database setup
        from database import db
        db.ensure_database_setup()
        print("✅ Database setup completed")
        
        # Test visit count
        visit_count = db.increment_visit_count()
        print(f"✅ Visit count test: {visit_count}")
        
        # Test project model
        from models.project_model import ProjectModel
        project_model = ProjectModel()
        project_model.create_projects_table()
        projects = project_model.get_all_projects()
        print(f"✅ Projects model test: {len(projects)} projects found")
        
        # Test blog model
        from models.blog_model import BlogModel
        blog_model = BlogModel()
        blog_model.create_blog_tables()
        posts = blog_model.get_all_posts()
        print(f"✅ Blog model test: {len(posts)} posts found")
        
        # Test contact model
        from models.contact_model import ContactModel
        contact_model = ContactModel()
        messages = contact_model.get_all_messages()
        print(f"✅ Contact model test: {len(messages)} messages found")
        
        print("\n🎉 All tests passed! Database is ready for deployment.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your .env file configuration")
        print("2. Verify database credentials")
        print("3. Ensure database server is running")
        print("4. For Supabase: verify project URL and API keys")
        print("5. For MySQL: verify server connection and database exists")
        return False

def test_environment_variables():
    """Test if all required environment variables are set"""
    print("\n🔧 Checking Environment Variables...")
    
    required_vars = [
        'DATABASE_TYPE',
        'SECRET_KEY',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD'
    ]
    
    db_type = os.getenv('DATABASE_TYPE', 'mysql')
    
    if db_type == 'supabase':
        required_vars.extend([
            'SUPABASE_URL',
            'SUPABASE_KEY',
            'SUPABASE_SERVICE_KEY'
        ])
    else:
        required_vars.extend([
            'MYSQL_HOST',
            'MYSQL_USER',
            'MYSQL_PASSWORD',
            'MYSQL_DATABASE'
        ])
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value or value.startswith('your_') or value == 'your-secure-secret-key-for-production-2024':
            missing_vars.append(var)
        else:
            print(f"✅ {var}: Set")
    
    if missing_vars:
        print(f"\n❌ Missing or default values for: {', '.join(missing_vars)}")
        print("💡 Please update your .env file with proper values")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

if __name__ == "__main__":
    print("🚀 Personal Portfolio Database Test")
    print("=" * 50)
    
    # Test environment variables first
    env_ok = test_environment_variables()
    
    if not env_ok:
        print("\n❌ Environment variable check failed. Please fix .env file first.")
        sys.exit(1)
    
    # Test database connection
    db_ok = test_database_connection()
    
    if db_ok:
        print("\n🎯 Ready for deployment!")
        print("\nNext steps:")
        print("1. Commit your changes to git")
        print("2. Deploy to your chosen platform (Vercel, Railway, Render, etc.)")
        print("3. Set environment variables in your deployment platform")
        print("4. Test the deployed application")
        sys.exit(0)
    else:
        print("\n❌ Database test failed. Please check configuration.")
        sys.exit(1)