from datetime import datetime
from config import DATABASE_TYPE

# Import database manager with fallbacks
import os
is_vercel = os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV') is not None

if is_vercel:
    # Use Vercel-optimized database manager (no MySQL imports)
    try:
        from vercel_database_manager import vercel_db_manager as db_manager
    except ImportError:
        from rest_database_manager import rest_db_manager as db_manager
else:
    # Use standard database managers for local development
    try:
        from database_manager import db_manager
    except ImportError:
        try:
            from simple_database_manager import simple_db_manager as db_manager
        except ImportError:
            from rest_database_manager import rest_db_manager as db_manager


class ContactModel:
    def __init__(self):
        self.db_manager = db_manager
        self.create_contact_table()
    
    def create_contact_table(self):
        """Create contact messages table"""
        if DATABASE_TYPE == "mysql":
            query = """
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    subject VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            self.db_manager.execute_query(query)
        else:
            # For Supabase, create via SQL editor:
            # CREATE TABLE contact_messages (
            #     id SERIAL PRIMARY KEY,
            #     name VARCHAR(255) NOT NULL,
            #     email VARCHAR(255) NOT NULL,
            #     subject VARCHAR(255) NOT NULL,
            #     message TEXT NOT NULL,
            #     status VARCHAR(20) DEFAULT 'unread',
            #     created_at TIMESTAMP DEFAULT NOW()
            # );
            pass
    
    def save_message(self, message_data):
        """Save a contact form message"""
        data = {
            'name': message_data['name'],
            'email': message_data['email'],
            'subject': message_data['subject'],
            'message': message_data['message'],
            'status': message_data.get('status', 'unread')
        }
        
        if DATABASE_TYPE == "supabase":
            data['created_at'] = datetime.now().isoformat()
        
        return self.db_manager.insert("contact_messages", data)
    
    def get_all_messages(self, status=None):
        """Get all contact messages"""
        conditions = {"status": status} if status else None
        return self.db_manager.select("contact_messages", conditions=conditions, order_by="created_at DESC")
    
    def get_message_by_id(self, message_id):
        """Get a specific message by ID"""
        messages = self.db_manager.select("contact_messages", {"id": message_id})
        return messages[0] if messages else None
    
    def mark_as_read(self, message_id):
        """Mark a message as read"""
        self.db_manager.update("contact_messages", {"status": "read"}, {"id": message_id})
    
    def mark_as_replied(self, message_id):
        """Mark a message as replied"""
        self.db_manager.update("contact_messages", {"status": "replied"}, {"id": message_id})
    
    def delete_message(self, message_id):
        """Delete a contact message"""
        self.db_manager.delete("contact_messages", {"id": message_id})
    
    def get_unread_count(self):
        """Get count of unread messages"""
        messages = self.db_manager.select("contact_messages", {"status": "unread"})
        return len(messages)