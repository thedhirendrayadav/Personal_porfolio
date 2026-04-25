"""
Unified models file - combines all model classes
"""
from models.project_model import ProjectModel, CategoryModel
from models.blog_model import BlogModel
from models.contact_model import ContactModel

__all__ = ['ProjectModel', 'CategoryModel', 'BlogModel', 'ContactModel']
