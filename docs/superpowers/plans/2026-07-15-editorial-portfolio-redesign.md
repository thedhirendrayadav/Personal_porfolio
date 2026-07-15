# Editorial Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public portfolio presentation with an original editorial experience inspired by the analyzed reference while preserving Flask routes, dynamic data, contact behavior, admin UI, and Railway deployment.

**Architecture:** Public pages continue to use Jinja inheritance through `templates/base.html`. A single new stylesheet and script own the public visual system and interactions; obsolete public CSS/JS references are removed from the base but their files remain untouched. The homepage route gains guarded reads for featured projects and recent posts using existing models.

**Tech Stack:** Flask 3, Jinja2, semantic HTML, CSS custom properties/Grid/Flexbox, vanilla JavaScript, MySQL-backed existing models, pytest, Playwright/agent-browser for responsive QA.

## Global Constraints

- Preserve every existing public route, endpoint name, model, database manager, admin template, and printable CV.
- Default canvas is `#0b0c0c`, primary text `#f1eee8`, primary accent `#9df9f3`, signal accent `#ff5c4d`.
- Do not copy reference-site logos, wording, awards, exact compositions, or brand assets.
- Do not use Three.js, WebGL, autoplay background video, custom cursor, glass-card systems, or orbital effects.
- Use existing `static/images/profile.png` and owned portfolio assets; external project/blog images may render only from existing data fields.
- Contact form must retain `name`, `email`, `subject`, `message`, CSRF hidden input, POST-to-`/contact`, and JSON status handling.
- Public content must remain readable and navigable without JavaScript.
- Support `prefers-reduced-motion`, visible keyboard focus, 44px touch targets, and WCAG AA text contrast.
- No horizontal overflow at 1440x900, 1024x768, 390x844, or 360x800.
- Leave `design-reference/` untouched.

---

### Task 1: Public Rendering Contract Tests

**Files:**
- Create: `tests/test_public_pages.py`
- Modify: `app.py`

**Interfaces:**
- Consumes: Flask `app`, existing `ProjectModel.get_all_projects(featured_only=True)`, `BlogModel.get_recent_posts(limit=3)`.
- Produces: homepage context keys `featured_projects: list[dict]` and `recent_posts: list[dict]`; route smoke-test coverage.

- [ ] **Step 1: Write failing tests**

Create tests that configure `app.config['TESTING'] = True`, monkeypatch visit counting and model reads, then assert:

```python
PUBLIC_PATHS = ["/", "/about", "/skills", "/portfolio", "/contact", "/blog"]


def test_public_pages_render(client):
    for path in PUBLIC_PATHS:
        response = client.get(path)
        assert response.status_code == 200


def test_homepage_renders_featured_projects_and_recent_posts(client, monkeypatch):
    monkeypatch.setattr("app.ProjectModel.get_all_projects", lambda self, featured_only=False: [
        {"title": "Security Platform", "description": "Detection automation", "technologies": ["Python"]}
    ])
    monkeypatch.setattr("app.BlogModel.get_recent_posts", lambda self, limit=3: [
        {"title": "Threat Modeling", "slug": "threat-modeling", "excerpt": "Practical modeling", "reading_time": 5}
    ])
    response = client.get("/")
    assert b"Security Platform" in response.data
    assert b"Threat Modeling" in response.data


def test_contact_form_contract(client):
    response = client.get("/contact")
    html = response.get_data(as_text=True)
    for field in ('name="name"', 'name="email"', 'name="subject"', 'name="message"', 'name="csrf_token"'):
        assert field in html
    assert 'id="contactFormEnhanced"' in html
    assert 'id="formStatus"' in html
```

- [ ] **Step 2: Run tests to verify RED**

Run: `pytest tests/test_public_pages.py -q`
Expected: homepage content assertions fail because the route does not provide project/post data; template-related failures are acceptable before Task 2.

- [ ] **Step 3: Add guarded homepage data reads**

Update `index()` so it builds `featured_projects` and `recent_posts` through existing models, catches database exceptions independently, and passes both lists to `index.html`. Do not change model implementations.

- [ ] **Step 4: Re-run focused tests**

Run: `pytest tests/test_public_pages.py -q`
Expected: homepage data contract passes; template assertions may remain pending until Tasks 2-4.

- [ ] **Step 5: Commit**

```bash
git add tests/test_public_pages.py app.py
git commit -m "test: define public portfolio rendering contracts"
```

### Task 2: Shared Editorial Shell and Design System

**Files:**
- Create: `static/css/editorial-portfolio.css`
- Create: `static/js/editorial-portfolio.js`
- Rewrite: `templates/base.html`

**Interfaces:**
- Consumes: existing Jinja SEO blocks, `asset_version`, Flask endpoint names, `request.path`, `current_year`.
- Produces: `.site-header`, `.editorial-nav`, `.mobile-menu`, `.section-index`, `.status-rail`, `.editorial-section`, `[data-reveal]`, `[data-section]`, and global CSS tokens used by all later templates.

- [ ] **Step 1: Add shell assertions to tests**

Assert the homepage contains `site-header`, `status-rail`, `editorial-portfolio.css`, and `editorial-portfolio.js`, and does not contain `three.min.js`, `bgVideo`, or `homepage-3d.js`.

- [ ] **Step 2: Run focused shell test to verify RED**

Run: `pytest tests/test_public_pages.py -q`
Expected: shell assertions fail on the existing base.

- [ ] **Step 3: Implement the base template**

Rewrite the public base with preserved SEO blocks, skip link, fixed wordmark, numbered route/anchor navigation, accessible mobile menu, `main#main-content`, status rail, and shared footer. Load only the consolidated CSS/JS plus Font Awesome only if icons remain necessary.

- [ ] **Step 4: Implement the design system stylesheet**

Define color/type/spacing tokens, layout container, fixed header, navigation, mobile overlay, landmark headings, project/media rows, article rows, form controls, focus states, status rail, responsive rules, and reduced-motion overrides. Keep section radius at 0 and repeated item radius at no more than 8px.

- [ ] **Step 5: Implement shared interactions**

Add defensive vanilla JS for mobile-menu state, active section tracking via `IntersectionObserver`, scroll progress via `requestAnimationFrame`, local clock, theme preference, and reveal classes. Every selector lookup must tolerate missing elements.

- [ ] **Step 6: Run focused tests and syntax diagnostics**

Run: `pytest tests/test_public_pages.py -q`
Expected: shell assertions pass; remaining page-content failures identify later tasks.

- [ ] **Step 7: Commit**

```bash
git add templates/base.html static/css/editorial-portfolio.css static/js/editorial-portfolio.js tests/test_public_pages.py
git commit -m "feat: add editorial portfolio shell"
```

### Task 3: Homepage, Portfolio, About, and Skills

**Files:**
- Rewrite: `templates/index.html`
- Rewrite: `templates/portfolio.html`
- Rewrite: `templates/about.html`
- Rewrite: `templates/skills.html`
- Extend: `static/css/editorial-portfolio.css`

**Interfaces:**
- Consumes: `featured_projects`, `recent_posts`, `projects`, `categories`, existing static assets, shared shell classes.
- Produces: homepage anchors `#intro`, `#work`, `#expertise`, `#writing`, `#about`, `#contact`; portfolio filter `data-project-filter`; no-JS project list.

- [ ] **Step 1: Add semantic content tests**

Assert homepage anchors exist, profile image has non-empty alt text, project content renders from injected data, and skills page contains five named competency groups.

- [ ] **Step 2: Run tests to verify RED**

Run: `pytest tests/test_public_pages.py -q`
Expected: new semantic assertions fail.

- [ ] **Step 3: Rewrite homepage**

Implement the identity hero, selected dynamic work with static empty state, expertise rows, credentials/evidence strip, dynamic recent writing with empty state, about preview, and oversized contact close. Use existing profile and certificate assets.

- [ ] **Step 4: Rewrite portfolio page**

Render database projects as editorial case studies. Provide a concise static fallback set only when `projects` is empty. Add category/type filter controls as progressive enhancement using existing data fields.

- [ ] **Step 5: Rewrite about and skills pages**

Build portrait/biography/timeline/evidence sections for About and competency matrices/methodology for Skills. Remove page-level Three.js and obsolete script/style blocks.

- [ ] **Step 6: Add project filtering behavior**

Extend the consolidated script so filter buttons update `hidden` and `aria-pressed` without preventing all projects from showing when JS is unavailable.

- [ ] **Step 7: Run focused tests**

Run: `pytest tests/test_public_pages.py -q`
Expected: homepage/core-page assertions pass.

- [ ] **Step 8: Commit**

```bash
git add templates/index.html templates/portfolio.html templates/about.html templates/skills.html static/css/editorial-portfolio.css static/js/editorial-portfolio.js tests/test_public_pages.py
git commit -m "feat: redesign portfolio core pages"
```

### Task 4: Contact, Blog, and Error Pages

**Files:**
- Rewrite: `templates/contact.html`
- Rewrite: `templates/blog/index.html`
- Rewrite: `templates/blog/post.html`
- Rewrite: `templates/blog/category.html`
- Rewrite: `templates/blog/search.html`
- Rewrite: `templates/404.html`
- Extend: `static/css/editorial-portfolio.css`
- Extend: `static/js/editorial-portfolio.js`

**Interfaces:**
- Consumes: existing blog context keys and trusted `post.content | safe`; contact POST JSON `{success, message}`.
- Produces: `#contactFormEnhanced`, `#formStatus`, `.submit-btn-enhanced`, accessible blog rows, valid route URLs using top-level Flask endpoint names.

- [ ] **Step 1: Add blog/contact/error assertions**

Assert contact contract, blog index landmark, post content container, search/category empty state, and shared-shell 404 output.

- [ ] **Step 2: Run tests to verify RED**

Run: `pytest tests/test_public_pages.py -q`
Expected: blog/error assertions fail on legacy templates.

- [ ] **Step 3: Rewrite contact page and behavior**

Preserve input names/IDs and CSRF. Submit with `fetch`, disable the submit button while pending, render server messages in `#formStatus`, and fall back to normal form submission when Fetch is unavailable.

- [ ] **Step 4: Rewrite blog templates**

Use editorial rows, readable article typography, real top-level endpoints (`blog`, `blog_post`, `blog_category`, `blog_search`), resilient datetime output, and explicit empty states. Keep `post.content | safe`.

- [ ] **Step 5: Rewrite 404**

Use only the inherited shell and provide clear Home and Portfolio actions.

- [ ] **Step 6: Run focused tests**

Run: `pytest tests/test_public_pages.py -q`
Expected: all public route and markup tests pass.

- [ ] **Step 7: Commit**

```bash
git add templates/contact.html templates/blog templates/404.html static/css/editorial-portfolio.css static/js/editorial-portfolio.js tests/test_public_pages.py
git commit -m "feat: redesign contact blog and error pages"
```

### Task 5: Responsive Browser QA and Production Deployment

**Files:**
- Modify as required by findings: public templates, `static/css/editorial-portfolio.css`, `static/js/editorial-portfolio.js`

**Interfaces:**
- Consumes: complete public redesign and existing Railway project `personal-portfolio`, service `web`.
- Produces: responsive, console-clean production deployment.

- [ ] **Step 1: Run full Python diagnostics**

Run: `pytest -q`
Expected: all tests pass.

Run: VS Code/Pylance syntax diagnostics on modified Python files.
Expected: no new errors.

- [ ] **Step 2: Start local Flask server**

Run with configured environment on an available local port and verify `/`, `/portfolio`, `/about`, `/skills`, `/blog`, `/contact`, and a missing route return expected statuses.

- [ ] **Step 3: Capture responsive screenshots**

Capture Home, Portfolio, About, Skills, Blog, Contact, and 404 at 1440x900 and 390x844; additionally check 1024x768 and 360x800 for overflow.

- [ ] **Step 4: Validate browser behavior**

Verify mobile menu keyboard operation, active section tracking, project filters, contact loading/error display, reduced motion, no horizontal overflow, no overlapping text, no missing owned assets, and no console errors.

- [ ] **Step 5: Fix and re-run focused QA**

Apply only issues found by screenshots/console checks, then repeat the affected viewport and route checks.

- [ ] **Step 6: Commit validated redesign**

```bash
git add templates static/css/editorial-portfolio.css static/js/editorial-portfolio.js app.py tests
git commit -m "fix: polish responsive editorial portfolio"
```

- [ ] **Step 7: Push to GitHub**

Push `main` to `https://github.com/thedhirendrayadav/Personal_porfolio.git` using the authenticated account. Confirm the remote branch points at the final commit.

- [ ] **Step 8: Deploy Railway and verify**

Deploy the current directory to Railway service `web`, poll until deployment status is `SUCCESS`, fetch the public URL, and verify HTTP 200 plus expected hero text.
