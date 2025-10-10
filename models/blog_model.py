from datetime import datetime
import json
from config import DATABASE_TYPE

# Import database manager with fallbacks
try:
    from database_manager import db_manager
except ImportError:
    try:
        from simple_database_manager import simple_db_manager as db_manager
    except ImportError:
        from rest_database_manager import rest_db_manager as db_manager

class BlogModel:
    def __init__(self):
        self.db_manager = db_manager
    
    def create_blog_tables(self):
        """Create blog-related tables"""
        if DATABASE_TYPE == "mysql":
            # Blog posts table
            self.db_manager.execute_query("""
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    excerpt TEXT,
                    content LONGTEXT NOT NULL,
                    featured_image VARCHAR(500),
                    category VARCHAR(100),
                    tags JSON,
                    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                    featured BOOLEAN DEFAULT FALSE,
                    views INT DEFAULT 0,
                    reading_time INT DEFAULT 5,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    published_at TIMESTAMP NULL
                )
            """)
            
            # Blog categories table
            self.db_manager.execute_query("""
                CREATE TABLE IF NOT EXISTS blog_categories (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    color VARCHAR(7) DEFAULT '#4a9bff',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Blog comments table
            self.db_manager.execute_query("""
                CREATE TABLE IF NOT EXISTS blog_comments (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    post_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    website VARCHAR(255),
                    content TEXT NOT NULL,
                    status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
                )
            """)
        else:
            # For Supabase, create tables via SQL editor
            pass
        
        # Insert default categories
        self.insert_default_categories()
    
    def insert_default_categories(self):
        """Insert default cybersecurity categories"""
        categories = [
            {'name': 'Cybersecurity', 'slug': 'cybersecurity', 'description': 'General cybersecurity topics and trends', 'color': '#ff6b6b'},
            {'name': 'Machine Learning', 'slug': 'machine-learning', 'description': 'ML applications in cybersecurity', 'color': '#4ecdc4'},
            {'name': 'Artificial Intelligence', 'slug': 'artificial-intelligence', 'description': 'AI-powered security solutions', 'color': '#45b7d1'},
            {'name': 'Threat Analysis', 'slug': 'threat-analysis', 'description': 'Analysis of security threats and vulnerabilities', 'color': '#f39c12'},
            {'name': 'Security Tools', 'slug': 'security-tools', 'description': 'Reviews and tutorials on security tools', 'color': '#9b59b6'},
            {'name': 'Research', 'slug': 'research', 'description': 'Latest research in cybersecurity and AI', 'color': '#2ecc71'},
            {'name': 'Tutorials', 'slug': 'tutorials', 'description': 'Step-by-step guides and tutorials', 'color': '#e74c3c'},
            {'name': 'News & Updates', 'slug': 'news-updates', 'description': 'Latest news in cybersecurity world', 'color': '#34495e'}
        ]
        
        for category in categories:
            try:
                # Check if category exists
                existing = self.db_manager.select("blog_categories", {"slug": category['slug']})
                if not existing:
                    self.db_manager.insert("blog_categories", category)
            except Exception as e:
                print(f"Error inserting category {category['name']}: {e}")
    
    def add_post(self, post_data):
        """Add a new blog post"""
        published_at = datetime.now().isoformat() if post_data.get('status') == 'published' else None
        
        data = {
            'title': post_data['title'],
            'slug': post_data['slug'],
            'excerpt': post_data.get('excerpt', ''),
            'content': post_data['content'],
            'featured_image': post_data.get('featured_image', ''),
            'category': post_data.get('category', ''),
            'tags': json.dumps(post_data.get('tags', [])),
            'status': post_data.get('status', 'draft'),
            'featured': post_data.get('featured', False),
            'reading_time': post_data.get('reading_time', 5),
            'published_at': published_at
        }
        
        if DATABASE_TYPE == "supabase":
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()
        
        return self.db_manager.insert("blog_posts", data)
    
    def get_all_posts(self, status='published', limit=None, offset=0):
        """Get all blog posts"""
        posts = self.db_manager.select(
            "blog_posts", 
            conditions={"status": status},
            order_by="created_at DESC",
            limit=limit,
            offset=offset
        )
        
        # Parse tags JSON
        for post in posts:
            if post.get('tags') and isinstance(post['tags'], str):
                try:
                    post['tags'] = json.loads(post['tags'])
                except:
                    post['tags'] = []
        
        return posts
    
    def get_post_by_slug(self, slug):
        """Get a single post by slug"""
        posts = self.db_manager.select("blog_posts", {"slug": slug, "status": "published"})
        post = posts[0] if posts else None
        
        if post and post.get('tags') and isinstance(post['tags'], str):
            try:
                post['tags'] = json.loads(post['tags'])
            except:
                post['tags'] = []
        
        return post
    
    def get_featured_posts(self, limit=3):
        """Get featured posts"""
        posts = self.db_manager.select(
            "blog_posts",
            conditions={"status": "published", "featured": True},
            order_by="created_at DESC",
            limit=limit
        )
        
        for post in posts:
            if post.get('tags') and isinstance(post['tags'], str):
                try:
                    post['tags'] = json.loads(post['tags'])
                except:
                    post['tags'] = []
        
        return posts
    
    def get_posts_by_category(self, category, limit=None):
        """Get posts by category"""
        posts = self.db_manager.select(
            "blog_posts",
            conditions={"category": category, "status": "published"},
            order_by="created_at DESC",
            limit=limit
        )
        
        for post in posts:
            if post.get('tags') and isinstance(post['tags'], str):
                try:
                    post['tags'] = json.loads(post['tags'])
                except:
                    post['tags'] = []
        
        return posts
    
    def get_categories(self):
        """Get all categories"""
        return self.db_manager.select("blog_categories", order_by="name")
    
    def increment_views(self, post_id):
        """Increment post views"""
        if DATABASE_TYPE == "mysql":
            query = "UPDATE blog_posts SET views = views + 1 WHERE id = %s"
            self.db_manager.execute_query(query, (post_id,))
        else:
            # For Supabase, get current views and increment
            posts = self.db_manager.select("blog_posts", {"id": post_id})
            if posts:
                current_views = posts[0].get('views', 0)
                self.db_manager.update("blog_posts", {"views": current_views + 1}, {"id": post_id})
    
    def search_posts(self, query, limit=10):
        """Search posts by title and content"""
        if DATABASE_TYPE == "mysql":
            search_query = """
                SELECT * FROM blog_posts 
                WHERE (title LIKE %s OR content LIKE %s OR excerpt LIKE %s) 
                AND status = 'published'
                ORDER BY created_at DESC LIMIT %s
            """
            search_term = f"%{query}%"
            posts = self.db_manager.execute_query(search_query, (search_term, search_term, search_term, limit), fetch_all=True)
        else:
            # For Supabase, we'll need to implement text search differently
            # This is a simplified version - Supabase supports full-text search
            all_posts = self.db_manager.select("blog_posts", {"status": "published"}, "created_at DESC")
            posts = []
            for post in all_posts:
                if (query.lower() in post.get('title', '').lower() or 
                    query.lower() in post.get('content', '').lower() or 
                    query.lower() in post.get('excerpt', '').lower()):
                    posts.append(post)
                    if len(posts) >= limit:
                        break
        
        for post in posts:
            if post.get('tags') and isinstance(post['tags'], str):
                try:
                    post['tags'] = json.loads(post['tags'])
                except:
                    post['tags'] = []
        
        return posts
    
    def get_recent_posts(self, limit=5):
        """Get recent posts"""
        return self.get_all_posts(limit=limit)
    
    def get_popular_posts(self, limit=5):
        """Get popular posts by views"""
        posts = self.db_manager.select(
            "blog_posts",
            conditions={"status": "published"},
            order_by="views DESC, created_at DESC",
            limit=limit
        )
        
        for post in posts:
            if post.get('tags') and isinstance(post['tags'], str):
                try:
                    post['tags'] = json.loads(post['tags'])
                except:
                    post['tags'] = []
        
        return posts
    
    def update_post(self, post_id, post_data):
        """Update a blog post"""
        update_data = {}
        
        for field in ['title', 'slug', 'excerpt', 'content', 'featured_image', 'category', 'status', 'featured', 'reading_time']:
            if field in post_data:
                if field == 'tags':
                    update_data[field] = json.dumps(post_data[field])
                else:
                    update_data[field] = post_data[field]
        
        if 'status' in post_data and post_data['status'] == 'published':
            update_data['published_at'] = datetime.now().isoformat()
        
        if DATABASE_TYPE == "supabase":
            update_data['updated_at'] = datetime.now().isoformat()
        
        if update_data:
            self.db_manager.update("blog_posts", update_data, {"id": post_id})
    
    def delete_post(self, post_id):
        """Delete a blog post"""
        self.db_manager.delete("blog_posts", {"id": post_id})