"""
REST Database Manager - Works with both MySQL and Supabase via REST API
This version avoids Python client dependency issues by using direct HTTP requests
"""

import os
import mysql.connector
import requests
import json
from datetime import datetime
from config import DATABASE_TYPE, MYSQL_CONFIG, SUPABASE_CONFIG


class RestDatabaseManager:
    def __init__(self):
        self.db_type = DATABASE_TYPE
        self.connection = None
        self.supabase_url = None
        self.supabase_key = None
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize database connection based on type"""
        if self.db_type == "supabase":
            self._init_supabase()
        else:
            self._init_mysql()
    
    def _init_supabase(self):
        """Initialize Supabase REST API connection"""
        if not SUPABASE_CONFIG["url"] or not SUPABASE_CONFIG["key"]:
            raise ValueError("Supabase URL and key must be provided")
        
        self.supabase_url = SUPABASE_CONFIG["url"]
        self.supabase_key = SUPABASE_CONFIG["key"]
        
        # Test connection
        try:
            url = f"{self.supabase_url}/rest/v1/"
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
            }
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                print("✅ Supabase REST API connection successful")
            else:
                print(f"⚠️ Supabase connection test returned: {response.status_code}")
        except Exception as e:
            print(f"❌ Supabase connection test failed: {e}")
            raise
    
    def _init_mysql(self):
        """Initialize MySQL connection"""
        try:
            self.connection = mysql.connector.connect(
                host=MYSQL_CONFIG["host"],
                user=MYSQL_CONFIG["user"],
                password=MYSQL_CONFIG["password"],
                database=MYSQL_CONFIG["database"],
                autocommit=True
            )
            print("✅ MySQL connection established")
        except mysql.connector.Error as e:
            print(f"❌ MySQL connection error: {e}")
            raise
    
    def ensure_database_setup(self):
        """Ensure database and tables exist"""
        if self.db_type == "mysql":
            self._ensure_mysql_database()
        else:
            print("ℹ️ For Supabase, ensure tables are created via SQL editor")
    
    def _ensure_mysql_database(self):
        """Ensure MySQL database exists"""
        try:
            temp_connection = mysql.connector.connect(
                host=MYSQL_CONFIG["host"],
                user=MYSQL_CONFIG["user"],
                password=MYSQL_CONFIG["password"],
                autocommit=True
            )
            
            cursor = temp_connection.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_CONFIG['database']}")
            cursor.close()
            temp_connection.close()
            
            # Reconnect to the specific database
            self._init_mysql()
            
        except mysql.connector.Error as e:
            print(f"Database setup error: {e}")
            raise
    
    def insert(self, table, data):
        """Insert data into table"""
        if self.db_type == "supabase":
            return self._supabase_insert(table, data)
        else:
            return self._mysql_insert(table, data)
    
    def _mysql_insert(self, table, data):
        """MySQL insert"""
        columns = list(data.keys())
        placeholders = ["%s"] * len(columns)
        values = list(data.values())
        
        query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
        cursor = self.connection.cursor()
        cursor.execute(query, values)
        result = cursor.lastrowid
        cursor.close()
        return result
    
    def _supabase_insert(self, table, data):
        """Supabase insert via REST API"""
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
                return True  # Success but no ID returned
            else:
                print(f"Supabase insert failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Supabase insert error: {e}")
            return None
    
    def select(self, table, conditions=None, order_by=None, limit=None, offset=None):
        """Select data from table"""
        if self.db_type == "supabase":
            return self._supabase_select(table, conditions, order_by, limit, offset)
        else:
            return self._mysql_select(table, conditions, order_by, limit, offset)
    
    def _mysql_select(self, table, conditions=None, order_by=None, limit=None, offset=None):
        """MySQL select"""
        query = f"SELECT * FROM {table}"
        params = []
        
        if conditions:
            where_clauses = []
            for key, value in conditions.items():
                where_clauses.append(f"{key} = %s")
                params.append(value)
            query += f" WHERE {' AND '.join(where_clauses)}"
        
        if order_by:
            query += f" ORDER BY {order_by}"
        
        if limit:
            query += f" LIMIT {limit}"
            if offset:
                query += f" OFFSET {offset}"
        
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(query, params)
        result = cursor.fetchall()
        cursor.close()
        return result
    
    def _supabase_select(self, table, conditions=None, order_by=None, limit=None, offset=None):
        """Supabase select via REST API"""
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
        }
        
        params = {}
        
        # Add conditions
        if conditions:
            for key, value in conditions.items():
                params[key] = f"eq.{value}"
        
        # Add ordering
        if order_by:
            # Convert "created_at DESC" to "created_at.desc"
            order_parts = order_by.split()
            if len(order_parts) > 1 and order_parts[1].upper() == "DESC":
                params['order'] = f"{order_parts[0]}.desc"
            else:
                params['order'] = order_parts[0]
        
        # Add limit and offset
        if limit:
            params['limit'] = limit
        if offset:
            params['offset'] = offset
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Supabase select failed: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"Supabase select error: {e}")
            return []
    
    def update(self, table, data, conditions):
        """Update data in table"""
        if self.db_type == "supabase":
            return self._supabase_update(table, data, conditions)
        else:
            return self._mysql_update(table, data, conditions)
    
    def _mysql_update(self, table, data, conditions):
        """MySQL update"""
        set_clauses = []
        params = []
        
        for key, value in data.items():
            set_clauses.append(f"{key} = %s")
            params.append(value)
        
        where_clauses = []
        for key, value in conditions.items():
            where_clauses.append(f"{key} = %s")
            params.append(value)
        
        query = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE {' AND '.join(where_clauses)}"
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        cursor.close()
        return True
    
    def _supabase_update(self, table, data, conditions):
        """Supabase update via REST API"""
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
        }
        
        # Build query parameters for conditions
        params = {}
        for key, value in conditions.items():
            params[key] = f"eq.{value}"
        
        try:
            response = requests.patch(url, json=data, headers=headers, params=params, timeout=10)
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"Supabase update failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Supabase update error: {e}")
            return False
    
    def delete(self, table, conditions):
        """Delete data from table"""
        if self.db_type == "supabase":
            return self._supabase_delete(table, conditions)
        else:
            return self._mysql_delete(table, conditions)
    
    def _mysql_delete(self, table, conditions):
        """MySQL delete"""
        where_clauses = []
        params = []
        
        for key, value in conditions.items():
            where_clauses.append(f"{key} = %s")
            params.append(value)
        
        query = f"DELETE FROM {table} WHERE {' AND '.join(where_clauses)}"
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        cursor.close()
        return True
    
    def _supabase_delete(self, table, conditions):
        """Supabase delete via REST API"""
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
        }
        
        # Build query parameters for conditions
        params = {}
        for key, value in conditions.items():
            params[key] = f"eq.{value}"
        
        try:
            response = requests.delete(url, headers=headers, params=params, timeout=10)
            if response.status_code in [200, 204]:
                return True
            else:
                print(f"Supabase delete failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Supabase delete error: {e}")
            return False


# Global database manager instance
rest_db_manager = RestDatabaseManager()