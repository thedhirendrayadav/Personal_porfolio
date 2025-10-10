"""
Database Module
Handles database connections and basic operations using unified database manager
"""

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
            # Check if record exists (try both table names)
            existing = None
            try:
                existing = self.db_manager.select("site_visits", {"id": 1})
            except:
                try:
                    existing = self.db_manager.select("visits", {"id": 1})
                except:
                    pass
            
            if existing:
                # Update existing count
                if "visit_count" in existing[0]:
                    new_count = existing[0]["visit_count"] + 1
                    table_name = "site_visits"
                else:
                    # Using visits table, just increment ID or return current count
                    new_count = len(existing) + 1
                    table_name = "visits"
                
                try:
                    self.db_manager.update(table_name, {"visit_count": new_count}, {"id": 1})
                except:
                    # If update fails, try insert
                    self.db_manager.insert("visits", {"visited_at": "now()"})
                return new_count
            else:
                # Insert first record
                try:
                    self.db_manager.insert("site_visits", {"id": 1, "visit_count": 1})
                except:
                    self.db_manager.insert("visits", {"visited_at": "now()"})
                return 1
                
        except Exception as e:
            print(f"Visit count error: {e}")
            return 0


# Global database instance
db = Database()