"""
Database Module
Handles database connections and basic operations using unified database manager
"""

import os

# Check if running in Vercel environment
is_vercel = os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV') is not None

if is_vercel:
    # Use Vercel-optimized database manager
    try:
        from vercel_database_manager import vercel_db_manager as db_manager
        print("✅ Using Vercel-optimized database manager")
    except ImportError as e:
        print(f"⚠️ Vercel database manager not available: {e}")
        from rest_database_manager import rest_db_manager as db_manager
        print("✅ Using REST database manager fallback")
else:
    # Use standard database managers for local development
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

from config import DATABASE_TYPE


class Database:
    def __init__(self):
        self.db_manager = db_manager
    
    def ensure_database_setup(self):
        """Ensure database and tables exist"""
        self.db_manager.ensure_database_setup()
        self._create_site_visits_table()
    
    def _create_site_visits_table(self):
        """Create site visits table"""
        if DATABASE_TYPE == "mysql":
            query = """
                CREATE TABLE IF NOT EXISTS site_visits (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    visit_count INT DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """
            self.db_manager.execute_query(query)
        else:
            # For Supabase, table should be created via SQL editor
            # CREATE TABLE site_visits (
            #     id SERIAL PRIMARY KEY,
            #     visit_count INTEGER DEFAULT 0,
            #     last_updated TIMESTAMP DEFAULT NOW()
            # );
            pass
    
    def increment_visit_count(self):
        """Increment and return visit count"""
        try:
            # Try to get existing visit count from site_visits table
            existing = self.db_manager.select("site_visits", {"id": 1})
            
            if existing and len(existing) > 0:
                # Update existing count
                current_count = existing[0].get("visit_count", 0)
                new_count = current_count + 1
                self.db_manager.update("site_visits", {"visit_count": new_count}, {"id": 1})
                return new_count
            else:
                # Insert first record
                self.db_manager.insert("site_visits", {"id": 1, "visit_count": 1})
                return 1
                
        except Exception as e:
            print(f"Visit count error: {e}")
            # Return a reasonable default if database is not available
            return 1


# Global database instance
db = Database()