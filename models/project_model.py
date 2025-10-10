from datetime import datetime
from config import DATABASE_TYPE
import json

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


class ProjectModel:
    def __init__(self):
        self.db_manager = db_manager
    
    def create_projects_table(self):
        """Create projects table if it doesn't exist"""
        if DATABASE_TYPE == "mysql":
            query = """
                CREATE TABLE IF NOT EXISTS projects (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    long_description TEXT,
                    technologies JSON,
                    project_type ENUM('web', 'mobile', 'desktop', 'data', 'design') DEFAULT 'web',
                    status ENUM('completed', 'in_progress', 'planned') DEFAULT 'completed',
                    featured BOOLEAN DEFAULT FALSE,
                    image_url VARCHAR(500),
                    demo_url VARCHAR(500),
                    github_url VARCHAR(500),
                    case_study_url VARCHAR(500),
                    display_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """
            self.db_manager.execute_query(query)
        else:
            # For Supabase, create table via SQL editor:
            # CREATE TABLE projects (
            #     id SERIAL PRIMARY KEY,
            #     title VARCHAR(255) NOT NULL,
            #     description TEXT,
            #     long_description TEXT,
            #     technologies JSONB,
            #     project_type VARCHAR(20) DEFAULT 'web',
            #     status VARCHAR(20) DEFAULT 'completed',
            #     featured BOOLEAN DEFAULT FALSE,
            #     image_url VARCHAR(500),
            #     demo_url VARCHAR(500),
            #     github_url VARCHAR(500),
            #     case_study_url VARCHAR(500),
            #     display_order INTEGER DEFAULT 0,
            #     created_at TIMESTAMP DEFAULT NOW(),
            #     updated_at TIMESTAMP DEFAULT NOW()
            # );
            pass
    
    def add_project(self, project_data):
        """Add a new project"""
        data = {
            'title': project_data['title'],
            'description': project_data['description'],
            'long_description': project_data.get('long_description', ''),
            'technologies': project_data.get('technologies', '[]'),
            'project_type': project_data.get('project_type', 'web'),
            'status': project_data.get('status', 'completed'),
            'featured': project_data.get('featured', False),
            'image_url': project_data.get('image_url', ''),
            'demo_url': project_data.get('demo_url', ''),
            'github_url': project_data.get('github_url', ''),
            'case_study_url': project_data.get('case_study_url', ''),
            'display_order': project_data.get('display_order', 0)
        }
        
        if DATABASE_TYPE == "supabase":
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()
        
        return self.db_manager.insert("projects", data)
    
    def get_all_projects(self, featured_only=False):
        """Get all projects or only featured ones"""
        conditions = {"featured": True} if featured_only else None
        order_by = "display_order ASC, created_at DESC"
        
        projects = self.db_manager.select("projects", conditions=conditions, order_by=order_by)
        
        # Parse technologies JSON for each project
        for project in projects:
            if project.get('technologies') and isinstance(project['technologies'], str):
                try:
                    project['technologies'] = json.loads(project['technologies'])
                except:
                    project['technologies'] = []
        
        return projects
    
    def get_project_by_id(self, project_id):
        """Get a specific project by ID"""
        projects = self.db_manager.select("projects", {"id": project_id})
        project = projects[0] if projects else None
        
        if project and project.get('technologies') and isinstance(project['technologies'], str):
            try:
                project['technologies'] = json.loads(project['technologies'])
            except:
                project['technologies'] = []
        
        return project
    
    def update_project(self, project_id, project_data):
        """Update an existing project"""
        # Remove id from update data if present
        update_data = {k: v for k, v in project_data.items() if k != 'id'}
        
        if DATABASE_TYPE == "supabase":
            update_data['updated_at'] = datetime.now().isoformat()
        
        if update_data:
            self.db_manager.update("projects", update_data, {"id": project_id})
    
    def delete_project(self, project_id):
        """Delete a project"""
        self.db_manager.delete("projects", {"id": project_id})
    
    def get_projects_by_type(self, project_type):
        """Get projects by type"""
        projects = self.db_manager.select("projects", {"project_type": project_type}, "display_order ASC")
        
        # Parse technologies JSON for each project
        for project in projects:
            if project.get('technologies') and isinstance(project['technologies'], str):
                try:
                    project['technologies'] = json.loads(project['technologies'])
                except:
                    project['technologies'] = []
        
        return projects


class CategoryModel:
    def __init__(self):
        self.db_manager = db_manager
    
    def create_categories_table(self):
        """Create categories table"""
        if DATABASE_TYPE == "mysql":
            query = """
                CREATE TABLE IF NOT EXISTS categories (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    icon_svg TEXT,
                    color VARCHAR(7) DEFAULT '#6366f1',
                    display_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            self.db_manager.execute_query(query)
        else:
            # For Supabase, create via SQL editor:
            # CREATE TABLE categories (
            #     id SERIAL PRIMARY KEY,
            #     name VARCHAR(100) NOT NULL UNIQUE,
            #     description TEXT,
            #     icon_svg TEXT,
            #     color VARCHAR(7) DEFAULT '#6366f1',
            #     display_order INTEGER DEFAULT 0,
            #     created_at TIMESTAMP DEFAULT NOW()
            # );
            pass
    
    def get_all_categories(self):
        """Get all categories"""
        return self.db_manager.select("categories", order_by="display_order ASC")