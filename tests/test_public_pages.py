from contextlib import contextmanager
from datetime import datetime

import pytest
from flask import template_rendered

import app as portfolio_app


@contextmanager
def captured_templates(flask_app):
    recorded = []

    def record(sender, template, context, **extra):
        recorded.append((template, context))

    template_rendered.connect(record, flask_app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, flask_app)


@pytest.fixture()
def client(monkeypatch):
    portfolio_app.app.config.update(TESTING=True, WTF_CSRF_ENABLED=False)
    monkeypatch.setattr(portfolio_app, "get_visit_count_and_increment", lambda: 1)
    monkeypatch.setattr(portfolio_app.ProjectModel, "get_all_projects", lambda self, featured_only=False: [])
    monkeypatch.setattr(portfolio_app.CategoryModel, "get_all_categories", lambda self: [])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_all_posts", lambda self, status="published", limit=None, offset=0: [])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_featured_posts", lambda self, limit=3: [])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_categories", lambda self: [])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_recent_posts", lambda self, limit=5: [])
    return portfolio_app.app.test_client()


def test_public_pages_render(client):
    for path in ("/", "/about", "/skills", "/portfolio", "/contact", "/blog"):
        response = client.get(path)
        assert response.status_code == 200, path


def test_homepage_context_includes_featured_projects_and_recent_posts(client, monkeypatch):
    projects = [
        {
            "title": "Security Platform",
            "description": "Detection automation",
            "technologies": ["Python"],
        }
    ]
    posts = [
        {
            "title": "Threat Modeling",
            "slug": "threat-modeling",
            "excerpt": "Practical modeling",
            "reading_time": 5,
        }
    ]
    monkeypatch.setattr(
        portfolio_app.ProjectModel,
        "get_all_projects",
        lambda self, featured_only=False: projects,
    )
    monkeypatch.setattr(
        portfolio_app.BlogModel,
        "get_recent_posts",
        lambda self, limit=3: posts,
    )

    with captured_templates(portfolio_app.app) as templates:
        response = client.get("/")

    assert response.status_code == 200
    assert templates[0][1]["featured_projects"] == projects
    assert templates[0][1]["recent_posts"] == posts


def test_contact_form_contract(client):
    response = client.get("/contact")
    html = response.get_data(as_text=True)

    for field in (
        'name="name"',
        'name="email"',
        'name="subject"',
        'name="message"',
        'name="csrf_token"',
    ):
        assert field in html

    assert 'id="contactFormEnhanced"' in html
    assert 'id="formStatus"' in html


def test_public_shell_uses_editorial_assets_without_legacy_3d(client):
    html = client.get("/").get_data(as_text=True)

    assert 'class="site-header"' in html
    assert 'class="status-rail"' in html
    assert 'data-accent-toggle' in html
    assert 'href="/#lab"' in html
    assert "editorial-portfolio.css" in html
    assert "editorial-portfolio.js" in html
    assert "three.min.js" not in html
    assert "homepage-3d.js" not in html
    assert 'id="bgVideo"' not in html


def test_homepage_has_editorial_sections_and_accessible_portrait(client):
    html = client.get("/").get_data(as_text=True)

    for section_id in ("intro", "work", "expertise", "writing", "lab", "about", "contact"):
        assert f'id="{section_id}"' in html
    assert 'src="/static/images/profile.png' in html
    assert 'alt="Portrait of Dhirendra Yadav"' in html


def test_homepage_exposes_research_lab_content(client):
    html = client.get("/").get_data(as_text=True)

    assert 'data-section="04 — LAB"' in html
    assert "Research lab." in html
    assert "Threat modeling" in html
    assert "Applied AI research" in html


def test_homepage_renders_dynamic_project_and_post_content(client, monkeypatch):
    monkeypatch.setattr(
        portfolio_app.ProjectModel,
        "get_all_projects",
        lambda self, featured_only=False: [{
            "title": "Security Platform",
            "description": "Detection automation",
            "technologies": ["Python"],
            "project_type": "web",
        }],
    )
    monkeypatch.setattr(
        portfolio_app.BlogModel,
        "get_recent_posts",
        lambda self, limit=3: [{
            "title": "Threat Modeling",
            "slug": "threat-modeling",
            "excerpt": "Practical modeling",
            "reading_time": 5,
        }],
    )

    html = client.get("/").get_data(as_text=True)
    assert "Security Platform" in html
    assert "Threat Modeling" in html


def test_skills_page_has_five_competency_groups(client):
    html = client.get("/skills").get_data(as_text=True)
    for group in ("Security", "AI / ML", "Engineering", "Infrastructure", "Tools"):
        assert group in html


def test_contact_uses_editorial_form_contract(client):
    html = client.get("/contact").get_data(as_text=True)

    assert '<form id="contactFormEnhanced"' in html
    assert 'method="post"' in html
    assert 'action="/contact"' in html
    assert 'class="button button-primary submit-btn-enhanced"' in html
    assert "contact-enhanced.css" not in html
    assert "contact-enhanced.js" not in html


def test_blog_views_use_public_routes_and_render_trusted_article_content(client, monkeypatch):
    post = {
        "id": 7,
        "title": "Practical Threat Modeling",
        "slug": "practical-threat-modeling",
        "excerpt": "A field guide for engineering teams.",
        "content": "<h2>Map the system</h2><p>Start with trust boundaries.</p>",
        "category": "Security",
        "created_at": datetime(2025, 2, 14),
        "reading_time": 6,
        "views": 12,
        "featured_image": None,
        "tags": ["security", "architecture"],
    }
    monkeypatch.setattr(portfolio_app.BlogModel, "get_all_posts", lambda self, status="published", limit=None, offset=0: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_featured_posts", lambda self, limit=3: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_post_by_slug", lambda self, slug: post)
    monkeypatch.setattr(portfolio_app.BlogModel, "increment_views", lambda self, post_id: None)
    monkeypatch.setattr(portfolio_app.BlogModel, "get_posts_by_category", lambda self, category, limit=None: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "search_posts", lambda self, query: [post])

    responses = {
        "index": client.get("/blog"),
        "post": client.get("/blog/practical-threat-modeling"),
        "category": client.get("/blog/category/security"),
        "search": client.get("/blog/search?q=threat"),
    }

    for response in responses.values():
        assert response.status_code == 200
        html = response.get_data(as_text=True)
        assert "Practical Threat Modeling" in html
        assert "blog.index" not in html
        assert "blog.post" not in html
        assert "blog.search" not in html

    index_html = responses["index"].get_data(as_text=True)
    assert 'action="/blog/search"' in index_html
    assert 'href="/blog/practical-threat-modeling"' in index_html
    assert '<main class="rich-text">' in responses["post"].get_data(as_text=True)
    assert "<h2>Map the system</h2>" in responses["post"].get_data(as_text=True)


def test_404_uses_shared_editorial_shell(client):
    html = client.get("/missing-page").get_data(as_text=True)

    assert client.get("/missing-page").status_code == 404
    assert 'class="error-code"' in html
    assert "Page not found" in html
    assert 'href="/"' in html
    assert "glass-card" not in html
    assert "gsap" not in html.lower()
