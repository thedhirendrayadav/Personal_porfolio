"""
Database Manager - Unified abstraction layer for MySQL and Supabase
"""

import os
import mysql.connector
from config import DATABASE_TYPE, MYSQL_CONFIG, SUPABASE_CONFIG
from datetime import datetime
import json

# Import Supabase with error handling
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError as e:
    print(f"Supabase import error: {e}")
    SUPABASE_AVAILABLE = False


class DatabaseManager:
    def __init__(self):
        self.db_type = DATABASE_TYPE
        self.connection = None
        self.supabase_client = None
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize database connection based on type"""
        if self.db_type == "supabase":
            self._init_supabase()
        else:
            self._init_mysql()
    
    def _init_supabase(self):
        """Initialize Supabase client"""
        if not SUPABASE_AVAILABLE:
            raise ImportError("Supabase client not available. Run: pip install supabase")
            
        if not SUPABASE_CONFIG["url"] or not SUPABASE_CONFIG["key"]:
            raise ValueError("Supabase URL and key must be provided")
        
        try:
            # Try the standard create_client method
            self.supabase_client = create_client(
                SUPABASE_CONFIG["url"],
                SUPABASE_CONFIG["key"]
            )
            print("✅ Supabase client initialized successfully")
        except TypeError as e:
            if "proxy" in str(e):
                print("⚠️ Proxy parameter issue detected, trying alternative initialization...")
                try:
                    # Alternative initialization without proxy parameter
                    from supabase._sync.client import SyncClient
                    self.supabase_client = SyncClient(
                        SUPABASE_CONFIG["url"],
                        SUPABASE_CONFIG["key"]
                    )
                    print("✅ Supabase client initialized with alternative method")
                except Exception as e2:
                    print(f"❌ Alternative Supabase initialization failed: {e2}")
                    raise
            else:
                print(f"❌ Supabase client initialization error: {e}")
                raise
        except Exception as e:
            print(f"❌ Supabase client initialization error: {e}")
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
        except mysql.connector.Error as e:
            print(f"MySQL connection error: {e}")
            raise
    
    def ensure_database_setup(self):
        """Ensure database and tables exist"""
        if self.db_type == "mysql":
            self._ensure_mysql_database()
        # Supabase tables should be created via SQL editor or migrations
    
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
    
    def execute_query(self, query, params=None, fetch_one=False, fetch_all=False):
        """Execute query based on database type"""
        if self.db_type == "supabase":
            return self._execute_supabase_query(query, params, fetch_one, fetch_all)
        else:
            return self._execute_mysql_query(query, params, fetch_one, fetch_all)
    
    def _execute_mysql_query(self, query, params=None, fetch_one=False, fetch_all=False):
        """Execute MySQL query"""
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            result = cursor.lastrowid
        
        cursor.close()
        return result
    
    def _execute_supabase_query(self, query, params=None, fetch_one=False, fetch_all=False):
        """Execute Supabase query (converted from SQL)"""
        # This is a simplified conversion - in practice, you'd use Supabase's query builder
        # For now, we'll implement basic CRUD operations
        pass
    
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
        return self.execute_query(query, values)
    
    def _supabase_insert(self, table, data):
        """Supabase insert"""
        result = self.supabase_client.table(table).insert(data).execute()
        if result.data:
            return result.data[0].get('id')
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
        
        return self.execute_query(query, params, fetch_all=True)
    
    def _supabase_select(self, table, conditions=None, order_by=None, limit=None, offset=None):
        """Supabase select"""
        query = self.supabase_client.table(table).select("*")
        
        if conditions:
            for key, value in conditions.items():
                query = query.eq(key, value)
        
        if order_by:
            # Parse order_by string (e.g., "created_at DESC")
            parts = order_by.split()
            column = parts[0]
            desc = len(parts) > 1 and parts[1].upper() == "DESC"
            query = query.order(column, desc=desc)
        
        if limit:
            query = query.limit(limit)
        
        if offset:
            query = query.offset(offset)
        
        result = query.execute()
        return result.data if result.data else []
    
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
        return self.execute_query(query, params)
    
    def _supabase_update(self, table, data, conditions):
        """Supabase update"""
        query = self.supabase_client.table(table).update(data)
        
        for key, value in conditions.items():
            query = query.eq(key, value)
        
        result = query.execute()
        return result.data
    
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
        return self.execute_query(query, params)
    
    def _supabase_delete(self, table, conditions):
        """Supabase delete"""
        query = self.supabase_client.table(table)
        
        for key, value in conditions.items():
            query = query.delete().eq(key, value)
        
        result = query.execute()
        return result.data
    
    def increment_counter(self, table, counter_field, conditions=None):
        """Increment a counter field"""
        if self.db_type == "supabase":
            # For Supabase, we need to fetch current value and update
            current = self.select(table, conditions)
            if current:
                new_value = current[0].get(counter_field, 0) + 1
                self.update(table, {counter_field: new_value}, conditions or {'id': current[0]['id']})
                return new_value
            else:
                # Insert new record
                data = {counter_field: 1}
                if conditions:
                    data.update(conditions)
                self.insert(table, data)
                return 1
        else:
            # MySQL can use atomic increment
            where_clause = ""
            params = []
            
            if conditions:
                where_clauses = []
                for key, value in conditions.items():
                    where_clauses.append(f"{key} = %s")
                    params.append(value)
                where_clause = f" WHERE {' AND '.join(where_clauses)}"
            
            query = f"UPDATE {table} SET {counter_field} = {counter_field} + 1{where_clause}"
            self.execute_query(query, params)
            
            # Return the new value
            select_query = f"SELECT {counter_field} FROM {table}{where_clause}"
            result = self.execute_query(select_query, params, fetch_one=True)
            return result[counter_field] if result else 1


# Global database manager instance
db_manager = DatabaseManager()