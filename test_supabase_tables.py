#!/usr/bin/env python3
"""
Test script to check if Supabase tables exist
"""

import os
import requests
from config import SUPABASE_CONFIG

def test_supabase_tables():
    """Test if required Supabase tables exist"""
    
    if not SUPABASE_CONFIG["url"] or not SUPABASE_CONFIG["key"]:
        print("❌ Supabase configuration missing")
        return False
    
    url = SUPABASE_CONFIG["url"]
    key = SUPABASE_CONFIG["key"]
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
    }
    
    # Test tables that should exist
    tables_to_test = [
        'site_visits',
        'projects', 
        'blog_posts',
        'blog_categories',
        'contact_messages'
    ]
    
    print("Testing Supabase tables...")
    
    for table in tables_to_test:
        try:
            test_url = f"{url}/rest/v1/{table}?limit=1"
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ Table '{table}' exists and accessible")
            elif response.status_code == 404:
                print(f"❌ Table '{table}' not found - needs to be created")
            else:
                print(f"⚠️ Table '{table}' - unexpected response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing table '{table}': {e}")
    
    print("\n📋 To create missing tables, run the SQL from supabase_schema.sql in your Supabase SQL editor")
    return True

if __name__ == "__main__":
    test_supabase_tables()