# Field Notes Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a coherent, responsive Field Notes archive with practical navigation and consistent category/search result context.

**Architecture:** The Flask routes already provide posts, featured posts, categories, and search query values. Update the three existing Jinja templates to emit a shared archive UI contract, style those classes in the editorial stylesheet, and protect the resulting markup with public-page rendering tests.

**Tech Stack:** Flask, Jinja2, pytest, HTML, CSS.

## Global Constraints

- Preserve `/blog`, `/blog/category/<category_slug>`, and `/blog/search` routes and GET search behavior.
- Keep posts, categories, counts, dates, excerpts, and reading times database-driven.
- Do not introduce sample posts, fake outcomes, metrics, images, or assets.
- Reuse existing design variables and mobile breakpoints.
- Preserve the mobile order: search, topic directory, listing.
- Do not modify or commit `design-reference/`.

---

## File Structure

- `templates/blog/index.html`: archive navigation and latest-notes context.
- `templates/blog/category.html`: consistent topic-result context.
- `templates/blog/search.html`: consistent search-result context.
- `static/css/editorial-portfolio.css`: desktop and mobile archive layout.
- `tests/test_public_pages.py`: rendering contract.

### Task 1: Define the Field Notes Rendering Contract

**Files:**
- Modify: `tests/test_public_pages.py`
- Test: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: patched existing `BlogModel` query methods.
- Produces: template requirements used in Tasks 2 and 3.

- [ ] **Step 1: Write a failing public-page test**

Append this test after `test_blog_views_use_public_routes_and_render_trusted_article_content`:

```python
def test_blog_archive_exposes_navigation_and_result_context(client, monkeypatch):
    post = {
        "id": 7,
        "title": "Practical Threat Modeling",
        "slug": "practical-threat-modeling",
        "excerpt": "A field guide for engineering teams.",
        "category": "Security",
        "created_at": datetime(2025, 2, 14),
        "reading_time": 6,
    }
    categories = [{"name": "Cybersecurity", "slug": "cybersecurity"}]
    monkeypatch.setattr(portfolio_app.BlogModel, "get_all_posts", lambda self, status="published", limit=None, offset=0: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_featured_posts", lambda self, limit=3: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "get_categories", lambda self: categories)
    monkeypatch.setattr(portfolio_app.BlogModel, "get_posts_by_category", lambda self, category, limit=None: [post])
    monkeypatch.setattr(portfolio_app.BlogModel, "search_posts", lambda self, query: [post])
    archive_html = client.get("/blog").get_data(as_text=True)
    category_html = client.get("/blog/category/cybersecurity").get_data(as_text=True)
    search_html = client.get("/blog/search?q=threat").get_data(as_text=True)
    assert 'class="archive-navigator"' in archive_html
    assert "Search the archive" in archive_html
    assert "Browse by topic" in archive_html
    assert 'aria-label="Browse writing topics"' in archive_html
    assert 'href="/blog/category/cybersecurity"' in archive_html
    assert "LATEST NOTES" in archive_html
    assert "TOPIC RESULTS" in category_html
    assert "1 FILED NOTE" in category_html
    assert "SEARCH RESULTS" in search_html
    assert "1 MATCHING NOTE" in search_html
```

- [ ] **Step 2: Verify RED**

Run `& ".\.venv\Scripts\python.exe" -m pytest tests/test_public_pages.py -k "archive_exposes_navigation" -v`.

Expected: the test fails because `archive-navigator` and the new result-context labels are absent.

- [ ] **Step 3: Commit the test**

Run `git add tests/test_public_pages.py` and `git commit -m "test: define field notes archive contract"`.

### Task 2: Implement the Shared Archive Content Model

**Files:**
- Modify: `templates/blog/index.html`
- Modify: `templates/blog/category.html`
- Modify: `templates/blog/search.html`
- Test: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: the existing `posts`, `featured_posts`, `categories`, `category_name`, `category_slug`, and `query` template values.
- Produces: `.archive-navigator`, `.archive-panel`, `.archive-topic-list`, `.archive-result-context`, and `.archive-result-actions`.

- [ ] **Step 1: Replace the main archive toolbar**

In `templates/blog/index.html`, replace the `blog-toolbar` section with:

```html
<section class="archive-navigator editorial-grid" data-section="01 — ARCHIVE NAVIGATION">
  <div class="archive-panel archive-search-panel">
    <p class="section-kicker accent">01 / ARCHIVE NAVIGATION</p>
    <h2>Search the archive.</h2>
    <p>Find field notes by subject, tool, or engineering question.</p>
    <form class="blog-search" action="{{ url_for('blog_search') }}" method="get" role="search">
      <label class="field" for="blog-query"><span class="field-label">SEARCH TERMS</span><input id="blog-query" type="search" name="q" placeholder="Threat modeling, Python, AI"></label>
      <button class="button button-primary" type="submit">Search ↗</button>
    </form>
  </div>
  <div class="archive-panel archive-topic-panel">
    <p class="section-kicker accent">TOPIC DIRECTORY</p>
    <h2>Browse by topic.</h2>
    {% if categories %}
      <nav class="archive-topic-list" aria-label="Browse writing topics">
        {% for category in categories %}<a href="{{ url_for('blog_category', category_slug=category.slug) }}"><span>{{ '%02d'|format(loop.index) }}</span>{{ category.name }}<b aria-hidden="true">↗</b></a>{% endfor %}
      </nav>
    {% else %}
      <p class="muted">Topics will appear here as new field notes are filed.</p>
    {% endif %}
  </div>
</section>
```

Change the all-posts label and heading to `03 / LATEST NOTES` and `Latest notes.`. Keep the dynamic post loop, empty state, and URLs unchanged.

- [ ] **Step 2: Add topic result context**

In `templates/blog/category.html`, replace the `archive-heading` with:

```html
<div class="archive-result-context">
  <div>
    <p class="section-kicker accent">01 / TOPIC RESULTS</p>
    <h2>Filed under {{ category_name }}.</h2>
    <p>Notes, research, and practical references grouped by this topic.</p>
  </div>
  <div class="archive-result-actions">
    <p class="meta">{{ posts|length }} FILED NOTE{{ '' if posts|length == 1 else 'S' }}</p>
    <a class="button" href="{{ url_for('blog') }}">All writing ←</a>
  </div>
</div>
```

Set the enclosing `data-section` value to `01 — TOPIC RESULTS`. Keep the current post loop and no-results branch.

- [ ] **Step 3: Add search result context**

In `templates/blog/search.html`, replace the current `section-head` with:

```html
<div class="archive-result-context">
  <div>
    <p class="section-kicker accent">01 / SEARCH RESULTS</p>
    <h2>{% if query %}Results for “{{ query }}”.{% else %}Search the archive.{% endif %}</h2>
    <p>{% if query %}Notes matching the current search terms.{% else %}Enter a subject, tool, or engineering question above.{% endif %}</p>
  </div>
  <div class="archive-result-actions">
    {% if query %}<p class="meta">{{ posts|length }} MATCHING NOTE{{ '' if posts|length == 1 else 'S' }}</p>{% endif %}
    <a class="button" href="{{ url_for('blog') }}">All writing ←</a>
  </div>
</div>
```

Set the enclosing `data-section` value to `01 — SEARCH RESULTS`; preserve the search form, article loop, and empty-state branches.

- [ ] **Step 4: Verify GREEN and commit**

Run `& ".\.venv\Scripts\python.exe" -m pytest tests/test_public_pages.py -k "archive_exposes_navigation" -v`.

Expected: `1 passed`.

Run `git add templates/blog/index.html templates/blog/category.html templates/blog/search.html` and `git commit -m "feat: unify field notes archive content"`.

### Task 3: Style and Validate the Responsive Archive

**Files:**
- Modify: `static/css/editorial-portfolio.css`
- Test: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: archive classes emitted by Task 2.
- Produces: bordered two-panel desktop navigation and a single-column mobile fallback.

- [ ] **Step 1: Replace obsolete toolbar rules**

Replace `.blog-toolbar` and `.blog-toolbar .filter-row` with:

```css
.archive-navigator { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block: 1px solid var(--line); }
.archive-panel { min-height: 22rem; padding: clamp(1.5rem, 3vw, 3rem); display: flex; flex-direction: column; gap: 1.25rem; }
.archive-search-panel { border-right: 1px solid var(--line); }
.archive-panel h2 { font-size: clamp(2.2rem, 4vw, 4.5rem); line-height: .92; letter-spacing: -.045em; }
.archive-panel > p:not(.section-kicker) { max-width: 42ch; color: var(--muted); }
.archive-panel .blog-search { margin-top: auto; }
.archive-topic-list { display: grid; margin-top: auto; border-top: 1px solid var(--line); }
.archive-topic-list a { display: grid; grid-template-columns: 3rem 1fr auto; gap: .75rem; align-items: center; padding-block: .75rem; border-bottom: 1px solid var(--line); font-family: var(--mono); font-size: .75rem; letter-spacing: .08em; }
.archive-topic-list a:hover { color: var(--accent); }
.archive-topic-list span, .archive-topic-list b { color: var(--muted); font-weight: 400; }
.archive-result-context { display: flex; justify-content: space-between; gap: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--line); }
.archive-result-context h2 { margin-block: .75rem; font-size: clamp(2.5rem, 5vw, 5.5rem); line-height: .92; letter-spacing: -.05em; }
.archive-result-context > div:first-child > p:last-child { max-width: 46ch; color: var(--muted); }
.archive-result-actions { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 1rem; }
```

Keep `.blog-search` and unrelated article/post styles untouched.

- [ ] **Step 2: Add the mobile fallback**

Inside the existing `@media (max-width: 820px)` block add:

```css
.archive-navigator { grid-template-columns: 1fr; }
.archive-panel { min-height: 0; }
.archive-search-panel { border-right: 0; border-bottom: 1px solid var(--line); }
.archive-result-context { flex-direction: column; }
.archive-result-actions { align-items: flex-start; }
```

The existing `@media (max-width: 520px)` search rule already makes search controls full width.

- [ ] **Step 3: Run final validation and publish**

Run `& ".\.venv\Scripts\python.exe" -m pytest tests/test_public_pages.py -v` and `git diff --check`.

Expected: all tests pass and whitespace validation returns no output.

Inspect `/blog`, `/blog/category/cybersecurity`, and `/blog/search?q=threat` with populated fixture data at `1440x1000` and `390x844`. Confirm desktop panels are adjacent and bordered, mobile stacks search before topics, and category/search pages show dynamic counts and archive return links.

Run `git add static/css/editorial-portfolio.css`, `git commit -m "style: refine field notes archive layout"`, and `git push origin main`.

## Plan Self-Review

- Coverage: the three tasks implement archive navigation, real topic links, topic/search result headers, responsive layout, accessibility labels, truth-based copy, test-first validation, and production-ready commits.
- Placeholders: no incomplete actions or undefined interfaces remain.
- Consistency: test strings, template class names, and CSS selectors use the same archive contract; no route or model change is necessary.