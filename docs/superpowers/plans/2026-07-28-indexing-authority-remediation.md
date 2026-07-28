# Indexing and Authority Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a truthfully expanded, canonically routed portfolio and connect it to Google Search Console so crawling and indexing decisions can be measured and acted on.

**Architecture:** Flask remains responsible for canonical redirects, HTML metadata, structured data, and sitemap generation. Stable modification dates come from explicit route metadata, curated content source timestamps, and blog post timestamps rather than request time. Railway serves the verified build, while Google Search Console uses DNS ownership verification to monitor the whole root domain.

**Tech Stack:** Python 3, Flask, Jinja2, pytest, XML, Railway, Hostinger DNS, Google Search Console, Lighthouse.

## Global Constraints

- Preserve `www.dhirendrayadav.site` as the canonical host.
- Preserve the apex-to-www permanent redirect.
- Flask remains the application framework and Railway remains the deployment target.
- Preserve the existing database, uploads, deployment configuration, and unrelated user changes.
- Use only factual content already supported by the project registry, repository documentation, tests, or public deployment evidence.
- Do not invent employers, education details, certifications, dates, metrics, client names, production status, outcomes, or verification tokens.
- Follow red-green-refactor for every application behavior change.
- Do not claim a URL is indexed without visible Google Search Console or Google result evidence.

---

## File Map

- `app.py`: canonical-path redirects, sitemap entry assembly, stable modification-date selection, and public content routes.
- `tests/test_public_pages.py`: sitemap, metadata, public-content, and trailing-slash behavior tests.
- `templates/about.html`: factual authority and identity content already present locally.
- `templates/faq.html`: direct answer content and FAQ schema already present locally.
- `templates/blog/index.html`: discoverable links and answer-focused archive copy.
- `templates/blog/post.html`: visible author/date/evidence signals for published posts.
- `content/projects.json`: existing evidence source for project-page depth; edit only when a claim is already supported.
- `docs/superpowers/specs/2026-07-28-indexing-authority-remediation-design.md`: approved design authority.

---

### Task 1: Canonical Trailing-Slash Redirects

**Files:**
- Modify: `app.py` immediately after application initialization and before public route handling
- Test: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: Flask `request`, `redirect`, and the existing route map.
- Produces: `redirect_noncanonical_trailing_slash()` returning either `None` or a permanent `308` response.

- [ ] **Step 1: Write the failing redirect tests**

Add these tests to `tests/test_public_pages.py`:

```python
@pytest.mark.parametrize(
    ("source", "target"),
    [
        ("/about/", "/about"),
        ("/skills/", "/skills"),
        ("/portfolio/", "/portfolio"),
        ("/faq/", "/faq"),
        ("/work/secure-portfolio-platform/", "/work/secure-portfolio-platform"),
    ],
)
def test_public_trailing_slash_redirects_to_canonical_path(client, source, target):
    response = client.get(source, follow_redirects=False)

    assert response.status_code == 308
    assert response.headers["Location"].endswith(target)


def test_homepage_does_not_redirect_as_a_trailing_slash_variant(client):
    response = client.get("/", follow_redirects=False)

    assert response.status_code == 200
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
$env:TEMP="$PWD\.pytest-codex-indexing"; $env:TMP="$env:TEMP"; .\.venv\Scripts\python.exe -m pytest tests\test_public_pages.py::test_public_trailing_slash_redirects_to_canonical_path tests\test_public_pages.py::test_homepage_does_not_redirect_as_a_trailing_slash_variant -q
```

Expected: the parametrized test fails because Flask currently returns `404` for inner trailing-slash URLs.

- [ ] **Step 3: Implement the minimal redirect**

Add this request hook in `app.py`:

```python
@app.before_request
def redirect_noncanonical_trailing_slash():
    path = request.path or "/"
    if path == "/" or not path.endswith("/"):
        return None

    canonical_path = path.rstrip("/")
    adapter = app.url_map.bind_to_environ(request.environ)
    try:
        adapter.match(canonical_path, method=request.method)
    except Exception:
        return None

    query = request.query_string.decode("utf-8")
    location = canonical_path if not query else f"{canonical_path}?{query}"
    return redirect(location, code=308)
```

Narrow the exception to `werkzeug.routing.RequestRedirect` and
`werkzeug.exceptions.NotFound` only if the existing imports make that clean;
do not catch unrelated request-processing exceptions.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the Step 2 command again.

Expected: all six cases pass.

- [ ] **Step 5: Commit**

```powershell
git add app.py tests/test_public_pages.py
git commit -m "fix: canonicalize trailing slash routes"
```

---

### Task 2: Stable and Content-Specific Sitemap Dates

**Files:**
- Modify: `app.py:969-997`
- Test: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: route metadata, `load_curated_projects()`, and blog post dictionaries.
- Produces:
  - `normalize_sitemap_date(value, fallback) -> str`
  - `build_sitemap_entries() -> list[tuple[str, str, str]]`

- [ ] **Step 1: Write failing sitemap tests**

Add:

```python
def test_sitemap_dates_are_stable_across_requests(client):
    first = client.get("/sitemap.xml").get_data(as_text=True)
    second = client.get("/sitemap.xml").get_data(as_text=True)

    assert first == second
    assert "<lastmod>" in first


def test_sitemap_uses_blog_update_date(client, monkeypatch):
    monkeypatch.setattr(
        portfolio_app.BlogModel,
        "get_all_posts",
        lambda self, status="published", limit=200, offset=0: [
            {
                "slug": "secure-flask-response-headers",
                "created_at": "2026-07-20T10:00:00+00:00",
                "updated_at": "2026-07-27T12:30:00+00:00",
            }
        ],
    )

    xml = client.get("/sitemap.xml").get_data(as_text=True)

    assert "<loc>https://www.dhirendrayadav.site/blog/secure-flask-response-headers</loc>" in xml
    assert "<lastmod>2026-07-27</lastmod>" in xml


def test_sitemap_does_not_assign_request_date_to_every_url(client, monkeypatch):
    monkeypatch.setattr(portfolio_app.datetime, "date", FrozenDateReturning2026July29)

    xml = client.get("/sitemap.xml").get_data(as_text=True)

    assert xml.count("<lastmod>2026-07-29</lastmod>") == 0
```

Define the small test helper in the same file:

```python
class FrozenDateReturning2026July29(datetime.date):
    @classmethod
    def today(cls):
        return cls(2026, 7, 29)
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
$env:TEMP="$PWD\.pytest-codex-indexing"; $env:TMP="$env:TEMP"; .\.venv\Scripts\python.exe -m pytest tests\test_public_pages.py::test_sitemap_dates_are_stable_across_requests tests\test_public_pages.py::test_sitemap_uses_blog_update_date tests\test_public_pages.py::test_sitemap_does_not_assign_request_date_to_every_url -q
```

Expected: the blog-date and blanket-current-date tests fail against the existing `datetime.date.today()` implementation.

- [ ] **Step 3: Implement stable sitemap metadata**

Add:

```python
PUBLIC_ROUTE_LASTMOD = {
    "/": "2026-07-28",
    "/about": "2026-07-28",
    "/skills": "2026-07-28",
    "/portfolio": "2026-07-28",
    "/contact": "2026-07-28",
    "/blog": "2026-07-28",
    "/faq": "2026-07-28",
}


def normalize_sitemap_date(value, fallback="2026-07-28"):
    if value is None:
        return fallback
    if hasattr(value, "date"):
        value = value.date()
    text = str(value)
    candidate = text[:10]
    try:
        return datetime.date.fromisoformat(candidate).isoformat()
    except ValueError:
        return fallback


def build_sitemap_entries():
    entries = [
        (path, priority, PUBLIC_ROUTE_LASTMOD[path])
        for path, priority in (
            ("/", "1.0"),
            ("/about", "0.8"),
            ("/skills", "0.8"),
            ("/portfolio", "0.9"),
            ("/contact", "0.7"),
            ("/blog", "0.8"),
            ("/faq", "0.6"),
        )
    ]
    for project in load_curated_projects():
        entries.append(
            (
                f"/work/{project['slug']}",
                "0.7",
                normalize_sitemap_date(project.get("updated_at")),
            )
        )
    for post in BlogModel().get_all_posts(
        status="published", limit=200, offset=0
    ):
        if post.get("slug"):
            entries.append(
                (
                    f"/blog/{post['slug']}",
                    "0.7",
                    normalize_sitemap_date(
                        post.get("updated_at") or post.get("created_at")
                    ),
                )
            )
    return entries
```

Update `sitemap_xml()` to deduplicate `(path, priority, lastmod)` records and
render each entry with its own `lastmod`. Preserve exception handling around
optional project/database sources so a temporary database failure does not
remove static routes.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the Step 2 command again.

Expected: three tests pass.

- [ ] **Step 5: Run sitemap XML parsing check**

Run:

```powershell
@'
import xml.etree.ElementTree as ET
from app import app
with app.test_client() as client:
    response = client.get("/sitemap.xml")
    assert response.status_code == 200
    root = ET.fromstring(response.data)
    assert root.tag.endswith("urlset")
    assert len(root) >= 19
print("sitemap xml valid")
'@ | .\.venv\Scripts\python.exe -
```

Expected: `sitemap xml valid`.

- [ ] **Step 6: Commit**

```powershell
git add app.py tests/test_public_pages.py
git commit -m "fix: use stable sitemap modification dates"
```

---

### Task 3: Evidence-Only Metadata and Authority Content

**Files:**
- Modify: `templates/about.html`
- Modify: `templates/faq.html`
- Modify: `templates/blog/index.html`
- Modify: `templates/blog/post.html`
- Modify only when supported: `content/projects.json`
- Test: `tests/test_public_pages.py`
- Test: `tests/test_project_content.py`

**Interfaces:**
- Consumes: existing curated project fields, blog post fields, visible
  credentials, and current entity-schema context.
- Produces: distinct page metadata, direct-answer sections, visible author/date
  signals, and evidence-rich project copy.

- [ ] **Step 1: Write failing authority-content tests**

Add:

```python
def test_about_page_exposes_verifiable_entity_details(client):
    html = client.get("/about").get_data(as_text=True)

    assert "BSc IT graduate" in html
    assert "Bhaktapur, Nepal" in html
    assert "Credentials & participation" in html
    assert "Django Certificate" in html


def test_faq_metadata_and_schema_cover_indexing_questions(client):
    html = client.get("/faq").get_data(as_text=True)

    assert "Get direct answers about Dhirendra Yadav" in html
    assert '"@type": "FAQPage"' in html
    assert "Are the portfolio projects production systems?" in html


def test_blog_archive_links_to_published_posts(client, monkeypatch):
    monkeypatch.setattr(
        portfolio_app.BlogModel,
        "get_all_posts",
        lambda self, status="published", limit=None, offset=0: [
            {
                "slug": "secure-flask-response-headers",
                "title": "How to set secure response headers in Flask",
                "excerpt": "A tested field note based on this portfolio deployment.",
                "created_at": "2026-07-28",
                "category": "Security",
            }
        ],
    )

    html = client.get("/blog").get_data(as_text=True)

    assert "/blog/secure-flask-response-headers" in html
    assert "How to set secure response headers in Flask" in html
```

- [ ] **Step 2: Run tests and verify the actual RED/GREEN boundary**

Run:

```powershell
$env:TEMP="$PWD\.pytest-codex-indexing"; $env:TMP="$env:TEMP"; .\.venv\Scripts\python.exe -m pytest tests\test_public_pages.py::test_about_page_exposes_verifiable_entity_details tests\test_public_pages.py::test_faq_metadata_and_schema_cover_indexing_questions tests\test_public_pages.py::test_blog_archive_links_to_published_posts -q
```

Expected: About and FAQ may already pass because approved local work exists;
the blog-link test must exercise the live template contract. Do not rewrite
already-correct code simply to manufacture a RED result. For any new behavior
that passes immediately, add a narrower missing behavior assertion before
editing production code.

- [ ] **Step 3: Make only evidence-supported content changes**

Preserve the approved local About and FAQ content. For each project below 400
visible words, add content only by rendering existing structured fields:

```jinja2
{% if project.get('architecture') %}
<section aria-labelledby="architecture-title">
  <h2 id="architecture-title">How is this system structured?</h2>
  <p>{{ project.get('architecture') }}</p>
</section>
{% endif %}

{% if project.get('outcomes') %}
<section aria-labelledby="outcomes-title">
  <h2 id="outcomes-title">What was verified?</h2>
  <ul>
  {% for outcome in project.get('outcomes') %}
    <li>{{ outcome }}</li>
  {% endfor %}
  </ul>
</section>
{% endif %}
```

Use the registry's real field names after inspecting `content/projects.json`;
do not add template references to fields the loader does not expose. If a
project lacks supported evidence, leave it concise rather than inventing text.

Ensure `templates/blog/index.html` renders standard anchor links for every
published post and `templates/blog/post.html` visibly renders author,
publication/update date, and evidence status when those fields exist.

- [ ] **Step 4: Run focused content tests**

Run:

```powershell
$env:TEMP="$PWD\.pytest-codex-indexing"; $env:TMP="$env:TEMP"; .\.venv\Scripts\python.exe -m pytest tests\test_public_pages.py tests\test_project_content.py -q
```

Expected: all tests pass with no raw private paths, secrets, or unsupported
claims exposed.

- [ ] **Step 5: Commit**

Stage only files actually changed:

```powershell
git add templates/about.html templates/faq.html templates/blog/index.html templates/blog/post.html templates/project_detail.html tests/test_public_pages.py tests/test_project_content.py
git commit -m "feat: strengthen evidence led search content"
```

Do not stage `content/projects.json` unless supported registry changes were
necessary and reviewed.

---

### Task 4: Full Local Verification

**Files:**
- No production edits expected
- Generated checks remain outside committed source

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: fresh regression, crawl, schema, and performance evidence.

- [ ] **Step 1: Run the complete test suite in a writable temp directory**

```powershell
$env:TEMP="$PWD\.pytest-codex-indexing-full"; $env:TMP="$env:TEMP"; .\.venv\Scripts\python.exe -m pytest tests -q
```

Expected: exit code `0` and zero failures.

- [ ] **Step 2: Compile Python sources**

```powershell
.\.venv\Scripts\python.exe -m compileall -q app.py models services utils
```

Expected: exit code `0`.

- [ ] **Step 3: Start the local Flask server**

```powershell
Start-Process -FilePath "$PWD\.venv\Scripts\python.exe" -ArgumentList "app.py" -WorkingDirectory "$PWD" -RedirectStandardOutput "$PWD\.tmp\indexing-server.out.log" -RedirectStandardError "$PWD\.tmp\indexing-server.err.log" -WindowStyle Hidden
```

- [ ] **Step 4: Crawl every sitemap URL locally**

Use a Python one-shot check:

```powershell
@'
import requests
import xml.etree.ElementTree as ET
base = "http://127.0.0.1:5000"
xml = requests.get(f"{base}/sitemap.xml", timeout=20)
xml.raise_for_status()
root = ET.fromstring(xml.content)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
paths = [node.text.replace("https://www.dhirendrayadav.site", "") for node in root.findall("sm:url/sm:loc", ns)]
for path in paths:
    response = requests.get(f"{base}{path}", timeout=20, allow_redirects=False)
    assert response.status_code == 200, (path, response.status_code)
print(f"local crawl passed: {len(paths)} URLs")
'@ | .\.venv\Scripts\python.exe -
```

Expected: at least 19 URLs pass.

- [ ] **Step 5: Verify local redirects and JSON-LD**

Check `/about/`, `/work/secure-portfolio-platform/`, apex host behavior through
the existing host-redirect test suite, and parse every
`application/ld+json` block with `json.loads`.

Expected: canonical redirects are `308`, homepage stays `200`, and all JSON-LD
blocks parse.

- [ ] **Step 6: Run a fresh local mobile Lighthouse audit**

Run the repository's existing Lighthouse command or:

```powershell
npx lighthouse http://127.0.0.1:5000/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=reports/lighthouse-mobile-indexing-remediation.json --chrome-flags="--headless --no-sandbox"
```

Expected: SEO, accessibility, and best-practices remain at least `0.95`; record
performance, LCP, TBT, and CLS without inventing a pass threshold beyond the
measured result.

---

### Task 5: Railway Deployment and Live Verification

**Files:**
- Deployment uses the current reviewed working tree
- Do not modify `.env`, database data, uploads, or Railway variables unless a
  verified requirement demands it

**Interfaces:**
- Consumes: locally verified commit state.
- Produces: online Railway deployment serving the canonical site.

- [ ] **Step 1: Inspect deployment scope**

```powershell
git status --short
railway status
railway variables --kv
```

Confirm the linked project is `personal-portfolio`, service is `web`, and
unrelated untracked files are excluded by `.railwayignore` or deployment
configuration. Do not print secret values into the final response.

- [ ] **Step 2: Deploy**

```powershell
railway up --detach
```

Expected: a deployment identifier is returned.

- [ ] **Step 3: Wait for terminal deployment state**

Poll Railway deployment status at bounded intervals no longer than 60 seconds.

Expected: deployment becomes `SUCCESS`/`Online`. If it fails, inspect build and
runtime logs before retrying.

- [ ] **Step 4: Run live canonical and sitemap checks**

Verify:

```text
http://dhirendrayadav.site/ -> HTTPS -> 308 www -> 200
https://dhirendrayadav.site/ -> 308 www -> 200
https://www.dhirendrayadav.site/about/ -> 308 /about -> 200
https://www.dhirendrayadav.site/sitemap.xml -> 200 XML
```

Fetch every sitemap URL and assert `200`, self-referencing www canonical,
`index, follow`, one H1, and parseable JSON-LD.

- [ ] **Step 5: Rerun production Lighthouse**

```powershell
npx lighthouse https://www.dhirendrayadav.site/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=reports/lighthouse-mobile-indexing-remediation-production.json --chrome-flags="--headless --no-sandbox"
```

Record actual scores and compare them to the pre-change artifact.

---

### Task 6: Google Search Console Domain Verification and Submission

**Files:**
- No source file edits unless Google provides a verification token that must be
  stored as a Railway environment variable for an HTML-tag fallback
- Preferred verification surface: Hostinger DNS TXT record

**Interfaces:**
- Consumes: canonical production domain and Google-provided verification value.
- Produces: verified Search Console domain property, submitted sitemap, and
  URL Inspection evidence.

- [ ] **Step 1: Open the existing Search Console handoff tab**

Confirm the signed-in account is the user-provided Google account and the page
shows `Add property`.

- [ ] **Step 2: Add the domain property**

Enter exactly:

```text
dhirendrayadav.site
```

Choose the Domain property flow so all protocols and subdomains are included.

- [ ] **Step 3: Capture the exact DNS TXT verification record**

Copy the complete Google-provided TXT value. Do not shorten, normalize, or
invent it.

- [ ] **Step 4: Apply the TXT record in the connected DNS provider**

Create a root-domain TXT record using the provider's required host value
(`@` or blank) and the exact Google verification string. Preserve existing A,
CNAME, MX, and TXT records.

- [ ] **Step 5: Verify ownership**

Return to Search Console and click Verify after DNS reports the TXT record.

Expected: a visible ownership-success state. If DNS propagation is pending,
leave the property saved and report the exact pending state without repeated
record changes.

- [ ] **Step 6: Submit the sitemap**

In the Sitemaps report, submit:

```text
sitemap.xml
```

Expected: Search Console shows a successful submission or a specific fetch
status that can be diagnosed.

- [ ] **Step 7: Inspect and request indexing for priority URLs**

Inspect these canonical URLs one at a time:

```text
https://www.dhirendrayadav.site/
https://www.dhirendrayadav.site/about
https://www.dhirendrayadav.site/portfolio
https://www.dhirendrayadav.site/work/secure-portfolio-platform
https://www.dhirendrayadav.site/work/multi-channel-ai-messaging
https://www.dhirendrayadav.site/work/nepse-market-intelligence
```

Request indexing only when the live test says the URL is available to Google.
Record the actual indexed/crawled/discovered state for each URL.

- [ ] **Step 8: Final evidence report**

Report:

- deployment identifier and online state;
- full test count and result;
- number of live sitemap URLs checked;
- production Lighthouse scores;
- Search Console verification state;
- sitemap submission state;
- priority URL Inspection results;
- any remaining external blocker and its exact owner/action.

Do not claim ranking or full indexing guarantees.
