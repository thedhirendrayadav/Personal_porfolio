-- Supabase Database Schema
-- Run this in your Supabase SQL editor to create all necessary tables

-- Enable Row Level Security (RLS) for all tables
-- You can customize these policies based on your security requirements

-- 1. Site Visits Table
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    visit_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert initial record
INSERT INTO site_visits (id, visit_count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    technologies JSONB,
    project_type VARCHAR(20) DEFAULT 'web',
    status VARCHAR(20) DEFAULT 'completed',
    featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    demo_url VARCHAR(500),
    github_url VARCHAR(500),
    case_study_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_svg TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    category VARCHAR(100),
    tags JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- 5. Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4a9bff',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Cybersecurity', 'cybersecurity', 'General cybersecurity topics and trends', '#ff6b6b'),
('Machine Learning', 'machine-learning', 'ML applications in cybersecurity', '#4ecdc4'),
('Artificial Intelligence', 'artificial-intelligence', 'AI-powered security solutions', '#45b7d1'),
('Threat Analysis', 'threat-analysis', 'Analysis of security threats and vulnerabilities', '#f39c12'),
('Security Tools', 'security-tools', 'Reviews and tutorials on security tools', '#9b59b6'),
('Research', 'research', 'Latest research in cybersecurity and AI', '#2ecc71'),
('Tutorials', 'tutorials', 'Step-by-step guides and tutorials', '#e74c3c'),
('News & Updates', 'news-updates', 'Latest news in cybersecurity world', '#34495e')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
-- Site visits - allow all operations for the app
CREATE POLICY "Allow all operations on site_visits" ON site_visits FOR ALL USING (true);

-- Projects - public read, authenticated write
CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Categories - public read, authenticated write
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Blog posts - public read for published posts, authenticated write
CREATE POLICY "Allow public read access to published blog posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Allow authenticated full access to blog posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- Blog categories - public read, authenticated write
CREATE POLICY "Allow public read access to blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access to blog categories" ON blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- Blog comments - public read for approved comments, public insert, authenticated manage
CREATE POLICY "Allow public read access to approved comments" ON blog_comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow public insert of comments" ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated manage comments" ON blog_comments FOR ALL USING (auth.role() = 'authenticated');

-- Contact messages - public insert, authenticated read/manage
CREATE POLICY "Allow public insert of contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read/manage contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();