from contextlib import contextmanager

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
    assert "editorial-portfolio.css" in html
    assert "editorial-portfolio.js" in html
    assert "three.min.js" not in html
    assert "homepage-3d.js" not in html
    assert 'id="bgVideo"' not in html
