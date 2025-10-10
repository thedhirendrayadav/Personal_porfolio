"""
Vercel-optimized Database Manager
Uses only REST API calls to avoid import issues in serverless environment
"""

import os
import requests
import json
from datetime import datetime
from config import DATABASE_TYPE, SUPABASE_CONFIG


class VercelDatabaseManager:
    def __init__(self):
        self.db_type = DATABASE_TYPE
        if self.db_type == "supabase":
            self.supabase_url = SUPABASE_CONFIG["url"]
            self.supabase_key = SUPABASE_CONFIG["key"]
            if not self.supabase_url or not self.supabase_key:
                raise ValueError("Supabase URL and key must be provided")
    
    def ensure_database_setup(self):
        """Ensure database is accessible"""
        if self.db_type == "supabase":
            # Test connection with a simple request
            try:
                self._test_supabase_connection()
                print("✅ Supabase connection verified")
            except Exception as e:
                print(f"⚠️ Supabase connection test failed: {e}")
    
    def _test_supabase_connection(self):
        """Test Supabase connection"""
        url = f"{self.supabase_url}/rest/v1/"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
        }
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            raise Exception(f"Connection test failed: {response.status_code}")
    
    def insert(self, table, data):
        """Insert data into table"""
        if self.db_type != "supabase":
            return None
            
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=10)
            if response.status_code in [200, 201]:
                result = response.json()
                if result and len(result) > 0:
                    return result[0].get('id')
                return True
            else:
                print(f"Insert failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Insert error: {e}")
            return None
    
    def select(self, table, conditions=None, order_by=None, limit=None, offset=None):
        """Select data from table"""
        if self.db_type != "supabase":
            return []
            
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
        }
        
        params = {}
        if conditions:
            for key, value in conditions.items():
                params[key] = f"eq.{value}"
        
        if order_by:
            parts = order_by.split()
            if len(parts) > 1 and parts[1].upper() == "DESC":
                params['order'] = f"{parts[0]}.desc"
            else:
                params['order'] = parts[0]
        
        if limit:
            params['limit'] = limit
        if offset:
            params['offset'] = offset
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Select failed: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"Select error: {e}")
            return []
    
    def update(self, table, data, conditions):
        """Update data in table"""
        if self.db_type != "supabase":
            return False
            
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
        }
        
        params = {}
        for key, value in conditions.items():
            params[key] = f"eq.{value}"
        
        try:
            response = requests.patch(url, json=data, headers=headers, params=params, timeout=10)
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"Update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Update error: {e}")
            return False
    
    def delete(self, table, conditions):
        """Delete data from table"""
        if self.db_type != "supabase":
            return False
            
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
        }
        
        params = {}
        for key, value in conditions.items():
            params[key] = f"eq.{value}"
        
        try:
            response = requests.delete(url, headers=headers, params=params, timeout=10)
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"Delete failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Delete error: {e}")
            return False


# Global instance for Vercel
vercel_db_manager = VercelDatabaseManager()