# Search, Profile, and Mobile Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the portfolio in Google Search Console, align GitHub and LinkedIn with the portfolio's supported identity, repair the website's social entity graph, and materially improve mobile loading performance.

**Architecture:** Account changes are handled as isolated browser workflows with a visible success state for each platform. Website changes use test-first Flask template updates and pre-generated optimized image assets, followed by one production deployment and live link, schema, redirect, sitemap, and Lighthouse verification.

**Tech Stack:** Google Search Console, Hostinger DNS, GitHub, LinkedIn, Flask/Jinja, pytest, Pillow image tooling, Lighthouse, Railway.

## Global Constraints

- Canonical website: `https://www.dhirendrayadav.site`.
- Canonical GitHub profile: `https://github.com/thedhirendrayadav`.
- Canonical LinkedIn profile: `https://www.linkedin.com/in/dhirendra-yadav-3b1387425/`.
- External-profile claims must already be supported by the portfolio.
- Preserve all existing Railway, mail, and unrelated DNS records.
- Do not change education history, employment history, verification state, profile photo, or open-to-work preferences.
- Preserve the portfolio's established editorial visual direction.
- Do not buy links, automate unsolicited outreach, or create misleading endorsements.
- Preserve unrelated worktree changes and stage only files owned by the task being committed.

---

## File Responsibility Map

- `templates/base.html`: canonical social links, footer labels, and `Person.sameAs`.
- `app.py`: AI-readable social profile listing and default social preview image.
- `templates/index.html`: responsive homepage portrait markup and LCP priority.
- `templates/about.html`: responsive about-page portrait markup.
- `content/projects.json`: optimized project artwork paths and dimensions.
- `static/images/profile-hero-cutout.webp`: optimized transparent homepage LCP portrait.
- `static/images/profile-about-cutout.webp`: optimized transparent homepage about portrait.
- `static/images/profile-about-full.webp`: optimized transparent about-page portrait.
- `static/images/profile-social-1200x630.webp`: dedicated social preview image.
- `static/images/projects/*.webp`: optimized project artwork served by project cards.
- `tests/test_public_pages.py`: social graph, accessible link, portrait, and LCP markup contracts.
- `tests/test_project_content.py`: optimized project artwork registry contract.

---

### Task 1: Verify the Google Search Console domain property

**Files:**
- External: Google Search Console property `dhirendrayadav.site`
- External: Hostinger DNS zone `dhirendrayadav.site`

**Interfaces:**
- Consumes: Google TXT verification value generated for `dhirendrayadav.site`.
- Produces: a verified Search Console domain property that covers apex, `www`, HTTP, and HTTPS variants.

- [ ] **Step 1: Open the pending Search Console verification dialog**

Use the signed-in Google account `the.dhirendrayadav@gmail.com`. Confirm the
dialog title is `Verify domain ownership via DNS record dhirendrayadav.site`
and the record type is `TXT (recommended)`.

- [ ] **Step 2: Sign in to Hostinger and open the domain DNS zone**

Open `dhirendrayadav.site` → DNS / Nameservers. Before editing, confirm the zone
still contains the production `www` CNAME, apex Railway routing record, and
`_railway-verify` TXT record.

- [ ] **Step 3: Add the Google verification TXT record**

Create this record using the value from the still-open Search Console dialog:

```text
Type: TXT
Name/Host: @
Value: google-site-verification=V19x6iTc5PrzBTD08tfZ7OpgigKUyh5OPqdr0O8Gcw8
TTL: 300 or the Hostinger default
```

Do not replace another TXT record. Confirm Hostinger shows the new record in
the DNS table.

- [ ] **Step 4: Confirm public DNS propagation**

Run:

```powershell
Resolve-DnsName dhirendrayadav.site -Server 1.1.1.1 -Type TXT
Resolve-DnsName dhirendrayadav.site -Server 8.8.8.8 -Type TXT
```

Expected: at least one returned TXT string exactly matches the Search Console
verification value. If neither resolver has it, leave the Search Console dialog
open and retry after propagation; do not add duplicate records.

- [ ] **Step 5: Verify ownership**

Return to Search Console and select `Verify`.

Expected: Search Console displays an ownership verification success state for
the domain property `dhirendrayadav.site`.

---

### Task 2: Submit and validate the sitemap

**Files:**
- External: Google Search Console property `sc-domain:dhirendrayadav.site`

**Interfaces:**
- Consumes: verified domain property from Task 1 and the live sitemap URL.
- Produces: an accepted sitemap entry in Search Console.

- [ ] **Step 1: Verify the live sitemap before submission**

Run:

```powershell
curl.exe -sS -I https://www.dhirendrayadav.site/sitemap.xml
curl.exe -sS https://www.dhirendrayadav.site/sitemap.xml | Select-String "<urlset|<loc>"
```

Expected: HTTP `200`, XML content type, a `<urlset>` root, and canonical
`https://www.dhirendrayadav.site/` URLs.

- [ ] **Step 2: Submit the sitemap**

In Search Console, select the domain property, open `Sitemaps`, and submit:

```text
https://www.dhirendrayadav.site/sitemap.xml
```

- [ ] **Step 3: Confirm submission state**

Expected: the sitemap appears in the submitted list with `Success` or an
accepted processing state. Record the discovered URL count if Search Console
shows it.

- [ ] **Step 4: Inspect the canonical homepage**

Use URL inspection for:

```text
https://www.dhirendrayadav.site/
```

If Google reports the URL is not indexed, select `Request indexing` once.
Do not repeat the request if Google reports it is queued or indexed.

---

### Task 3: Align the GitHub profile

**Files:**
- External: GitHub profile `thedhirendrayadav`

**Interfaces:**
- Consumes: canonical identity and profile copy from the approved specification.
- Produces: a public GitHub profile with matching identity, positioning, location, and website.

- [ ] **Step 1: Open GitHub profile editing**

On `https://github.com/thedhirendrayadav`, select `Edit profile`.

- [ ] **Step 2: Enter the approved profile values**

Use these exact values:

```text
Name: Dhirendra Yadav
Bio: Cybersecurity & Systems Engineer building secure automation, AI/ML systems, and practical digital products.
Location: Bhaktapur, Nepal
Website: https://www.dhirendrayadav.site
```

Leave employer, social account, email visibility, and status unchanged.

- [ ] **Step 3: Save the profile**

Select GitHub's profile save action once.

Expected: a visible success state or the edit form closes with the new values
rendered on the profile.

- [ ] **Step 4: Verify the public profile**

Reload `https://github.com/thedhirendrayadav` and confirm the name, bio,
location, and website are publicly visible and the website link resolves to the
canonical portfolio.

---

### Task 4: Align the LinkedIn profile

**Files:**
- External: LinkedIn profile `dhirendra-yadav-3b1387425`

**Interfaces:**
- Consumes: approved LinkedIn headline and About copy.
- Produces: a public LinkedIn profile aligned with the portfolio.

- [ ] **Step 1: Update the headline**

Open the profile intro editor and set:

```text
Cybersecurity & Systems Engineer | Secure Automation | AI/ML Systems | Full-Stack Product Engineering
```

Keep the existing Nepal location unless LinkedIn offers `Bhaktapur, Nepal`
without changing country or region.

- [ ] **Step 2: Save the intro**

Select LinkedIn's save action once.

Expected: the profile top card displays the approved headline.

- [ ] **Step 3: Add or update the About section**

Use this exact content:

```text
I am Dhirendra Yadav, a BSc IT graduate focused on cybersecurity, AI/ML, and full-stack systems. I build secure automation, intelligent tools, and practical digital products from Bhaktapur, Nepal.

My work includes defensive automation, production web systems, AI integrations, and data-backed operational platforms. I document the reasoning, implementation, and verification behind selected projects at dhirendrayadav.site.

I am open to collaboration and opportunities involving cybersecurity engineering, AI/ML systems, automation, and product engineering.
```

- [ ] **Step 4: Save and verify the About section**

Expected: the saved About section renders the three approved paragraphs without
truncation in edit mode.

- [ ] **Step 5: Add the canonical portfolio link to contact information**

Set the website URL to:

```text
https://www.dhirendrayadav.site
```

Choose LinkedIn's `Portfolio` website type when that option is available.

- [ ] **Step 6: Verify the public profile**

Reload `https://www.linkedin.com/in/dhirendra-yadav-3b1387425/` and confirm the
headline, About text, and portfolio contact link are visible. Do not modify
education, experience, profile image, verification, or open-to-work settings.

---

### Task 5: Repair the portfolio social entity graph

**Files:**
- Modify: `templates/base.html:53`
- Modify: `templates/base.html:131-132`
- Modify: `app.py:1005-1006`
- Modify: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: canonical GitHub and LinkedIn URLs.
- Produces: consistent visible links and `Person.sameAs` structured data.

- [ ] **Step 1: Write the failing social-link test**

Add to `tests/test_public_pages.py`:

```python
def test_public_identity_uses_active_social_profiles(client):
    response = client.get("/")
    html = response.get_data(as_text=True)

    github = "https://github.com/thedhirendrayadav"
    linkedin = "https://www.linkedin.com/in/dhirendra-yadav-3b1387425/"
    obsolete_linkedin = "https://www.linkedin.com/in/dhirendra-yadav-3040b82b4"

    assert github in html
    assert linkedin in html
    assert obsolete_linkedin not in html
    assert 'aria-label="Dhirendra Yadav on GitHub"' in html
    assert 'aria-label="Dhirendra Yadav on LinkedIn"' in html
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_public_pages.py::test_public_identity_uses_active_social_profiles
```

Expected: `FAIL` because the obsolete LinkedIn URL is still rendered.

- [ ] **Step 3: Update visible and structured social links**

In `templates/base.html`, use:

```jinja2
'sameAs': [
  'https://github.com/thedhirendrayadav',
  'https://www.linkedin.com/in/dhirendra-yadav-3b1387425/'
]
```

Update the footer links to:

```html
<a href="https://github.com/thedhirendrayadav" target="_blank" rel="noreferrer noopener" aria-label="Dhirendra Yadav on GitHub">GitHub ↗</a>
<a href="https://www.linkedin.com/in/dhirendra-yadav-3b1387425/" target="_blank" rel="noreferrer noopener" aria-label="Dhirendra Yadav on LinkedIn">LinkedIn ↗</a>
```

In `app.py`, update the AI-readable profile list to:

```python
- GitHub: https://github.com/thedhirendrayadav
- LinkedIn: https://www.linkedin.com/in/dhirendra-yadav-3b1387425/
```

- [ ] **Step 4: Run the focused test**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_public_pages.py::test_public_identity_uses_active_social_profiles
```

Expected: `1 passed`.

- [ ] **Step 5: Search for obsolete profile references**

Run:

```powershell
rg -n "dhirendra-yadav-3040b82b4" app.py templates tests content
```

Expected: no matches.

- [ ] **Step 6: Commit the social entity repair**

```powershell
git add -- app.py templates/base.html tests/test_public_pages.py
git commit -m "fix: align portfolio social profiles"
```

---

### Task 6: Generate optimized profile and project images

**Files:**
- Create: `static/images/profile-hero-cutout.webp`
- Create: `static/images/profile-about-cutout.webp`
- Create: `static/images/profile-about-full.webp`
- Create: `static/images/profile-social-1200x630.webp`
- Create: `static/images/projects/*.webp`
- Modify: `content/projects.json`
- Modify: `tests/test_project_content.py`

**Interfaces:**
- Consumes: existing PNG/JPEG source artwork.
- Produces: browser-ready WebP files with the same intrinsic dimensions as their source assets.

- [ ] **Step 1: Write the failing optimized-project-media test**

Update the expected media paths in
`tests/test_project_content.py::test_curated_projects_use_generated_field_journal_art`
from `.png` to `.webp`, then add:

```python
assert all(project["image_url"].endswith(".webp") for project in projects)
```

- [ ] **Step 2: Run the project media test and verify it fails**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_project_content.py::test_curated_projects_use_generated_field_journal_art
```

Expected: `FAIL` because `content/projects.json` still references PNG assets.

- [ ] **Step 3: Generate the optimized WebP assets**

Run this mechanical image-generation command from the repository root:

```powershell
@'
from pathlib import Path
from PIL import Image, ImageOps

image_root = Path("static/images")
profile_sources = [
    image_root / "profile-hero-cutout.png",
    image_root / "profile-about-cutout.png",
    image_root / "profile-about-full.png",
]

for source in profile_sources:
    with Image.open(source) as image:
        image.save(source.with_suffix(".webp"), "WEBP", quality=82, method=6)

with Image.open(image_root / "profile-hero.jpg") as image:
    fitted = ImageOps.fit(image.convert("RGB"), (1200, 630), method=Image.Resampling.LANCZOS)
    fitted.save(image_root / "profile-social-1200x630.webp", "WEBP", quality=82, method=6)

for source in sorted((image_root / "projects").glob("*-field-journal.png")):
    with Image.open(source) as image:
        image.convert("RGB").save(source.with_suffix(".webp"), "WEBP", quality=80, method=6)
'@ | .\.venv\Scripts\python.exe -
```

Expected: each source has a corresponding `.webp` file, and no source file is
deleted.

- [ ] **Step 4: Update the project registry**

Replace every `static/images/projects/*-field-journal.png` value in
`content/projects.json` with the matching `.webp` path. Preserve each existing
`image_width` and `image_height`.

- [ ] **Step 5: Verify generated files and size reduction**

Run:

```powershell
Get-ChildItem static\images\profile-*.webp,static\images\projects\*.webp |
  Sort-Object Length -Descending |
  Select-Object Name,Length
```

Expected: every listed WebP exists and is smaller than its source image.

- [ ] **Step 6: Run the project media tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_project_content.py
```

Expected: all project content tests pass.

- [ ] **Step 7: Commit optimized project media**

```powershell
git add -- content/projects.json tests/test_project_content.py static/images/*.webp static/images/projects/*.webp
git commit -m "perf: optimize portfolio image delivery"
```

---

### Task 7: Serve responsive profile images and prioritize the LCP asset

**Files:**
- Modify: `app.py:941`
- Modify: `templates/index.html:14-16`
- Modify: `templates/index.html:95`
- Modify: `templates/about.html:9`
- Modify: `tests/test_public_pages.py`

**Interfaces:**
- Consumes: optimized WebP assets from Task 6.
- Produces: responsive, dimensioned portrait markup and a dedicated 1200×630 social preview image.

- [ ] **Step 1: Write the failing portrait-performance test**

Add to `tests/test_public_pages.py`:

```python
def test_homepage_prioritizes_optimized_lcp_portrait(client):
    html = client.get("/").get_data(as_text=True)

    assert "profile-hero-cutout.webp" in html
    assert 'width="1086"' in html
    assert 'height="1448"' in html
    assert 'fetchpriority="high"' in html
    assert 'loading="eager"' in html
    assert 'decoding="async"' in html
    assert "profile-about-cutout.webp" in html


def test_about_page_uses_optimized_dimensioned_portrait(client):
    html = client.get("/about").get_data(as_text=True)

    assert "profile-about-full.webp" in html
    assert 'width="1126"' in html
    assert 'height="1397"' in html
    assert 'decoding="async"' in html
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_public_pages.py::test_homepage_prioritizes_optimized_lcp_portrait tests/test_public_pages.py::test_about_page_uses_optimized_dimensioned_portrait
```

Expected: both tests fail because the templates still use PNG assets.

- [ ] **Step 3: Update the homepage portraits**

Replace the hero image in `templates/index.html` with:

```jinja2
<img
  src="{{ url_for('static', filename='images/profile-hero-cutout.webp', v=asset_version) }}"
  alt="Portrait of Dhirendra Yadav"
  width="1086"
  height="1448"
  loading="eager"
  fetchpriority="high"
  decoding="async">
```

Replace the homepage about-preview image with:

```jinja2
<img
  src="{{ url_for('static', filename='images/profile-about-cutout.webp', v=asset_version) }}"
  alt="Portrait of Dhirendra Yadav"
  width="1254"
  height="1254"
  loading="lazy"
  decoding="async">
```

- [ ] **Step 4: Update the about-page portrait**

Use this image in `templates/about.html`:

```jinja2
<img
  src="{{ url_for('static', filename='images/profile-about-full.webp', v=asset_version) }}"
  alt="Portrait of Dhirendra Yadav"
  width="1126"
  height="1397"
  decoding="async">
```

- [ ] **Step 5: Use the dedicated social preview**

Change `default_og_image` in `app.py` to:

```python
'default_og_image': f"{SITE_URL}/static/images/profile-social-1200x630.webp",
```

- [ ] **Step 6: Run the focused tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_public_pages.py::test_homepage_prioritizes_optimized_lcp_portrait tests/test_public_pages.py::test_about_page_uses_optimized_dimensioned_portrait
```

Expected: `2 passed`.

- [ ] **Step 7: Update superseded portrait assertions**

Change existing exact PNG assertions in `tests/test_public_pages.py` to their
corresponding WebP filenames while preserving the behavioral intent of each
test.

- [ ] **Step 8: Run all public-page tests**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_public_pages.py
```

Expected: all public-page tests pass.

- [ ] **Step 9: Commit responsive portrait delivery**

```powershell
git add -- app.py templates/index.html templates/about.html tests/test_public_pages.py
git commit -m "perf: prioritize responsive portrait assets"
```

---

### Task 8: Run complete verification and deploy

**Files:**
- Verify: all task-owned source, templates, content, tests, and static assets
- External: Railway service `web`

**Interfaces:**
- Consumes: completed website changes from Tasks 5–7.
- Produces: a successful production deployment with verified canonical links and performance evidence.

- [ ] **Step 1: Run the complete test suite**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest -q --basetemp .tmp\pytest-search-profile-performance
```

Expected: all tests pass.

- [ ] **Step 2: Validate repository references**

Run:

```powershell
rg -n "dhirendra-yadav-3040b82b4|profile-hero-cutout\.png|profile-about-cutout\.png|profile-about-full\.png" app.py templates content tests
```

Expected: no obsolete LinkedIn or served portrait references remain.

- [ ] **Step 3: Deploy the existing Railway web service**

Run:

```powershell
$env:RAILWAY_CALLER='skill:use-railway@1.3.0'
$env:RAILWAY_AGENT_SESSION='railway-search-profile-performance-20260728'
railway up --service 387ff12a-61b3-49c5-b174-659ed372bf70 --environment c2acab52-c20c-4d63-884b-ee3b0a488a4f --ci --message "Align search profiles and improve mobile image delivery" --json
```

Poll the returned deployment ID until its state is `SUCCESS`. If it fails, read
the build and deployment logs before changing code.

- [ ] **Step 4: Verify live social links and structured data**

Run:

```powershell
$html = curl.exe -sS https://www.dhirendrayadav.site/
$html | Select-String "github.com/thedhirendrayadav|linkedin.com/in/dhirendra-yadav-3b1387425"
```

Expected: both canonical URLs appear in the live footer and JSON-LD.

- [ ] **Step 5: Verify generated-host and apex redirects**

Run:

```powershell
curl.exe -sS -I https://web-production-5da7d.up.railway.app/
curl.exe -sS -I https://dhirendrayadav.site/
```

Expected: both return a permanent redirect whose `Location` is
`https://www.dhirendrayadav.site/`. If apex TLS is still pending, report that
separately without treating the website deployment as failed.

- [ ] **Step 6: Run a fresh mobile Lighthouse measurement**

Run:

```powershell
npx --yes lighthouse https://www.dhirendrayadav.site/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --chrome-flags="--headless --disable-gpu --no-sandbox" --output=json --output-path="$env:TEMP\lighthouse-dhirendra-mobile-after.json" --quiet
```

Extract the score and metrics:

```powershell
$j = Get-Content "$env:TEMP\lighthouse-dhirendra-mobile-after.json" -Raw | ConvertFrom-Json
[pscustomobject]@{
  Performance = [math]::Round($j.categories.performance.score * 100)
  FCP = $j.audits.'first-contentful-paint'.displayValue
  LCP = $j.audits.'largest-contentful-paint'.displayValue
  TBT = $j.audits.'total-blocking-time'.displayValue
  CLS = $j.audits.'cumulative-layout-shift'.displayValue
  SpeedIndex = $j.audits.'speed-index'.displayValue
} | Format-List
```

Compare against the baseline: Performance `64`, FCP `2.1 s`, LCP `10.7 s`,
TBT `330 ms`, CLS `0.001`, Speed Index `3.7 s`. Report the measured result
without claiming field Core Web Vitals until Search Console has sufficient real
user data.

---

### Task 9: Establish the publishing and backlink operating cadence

**Files:**
- Create: `docs/seo/field-note-and-backlink-cadence.md`

**Interfaces:**
- Consumes: canonical site topics and active social profiles.
- Produces: a reusable evidence-led publishing and ethical backlink workflow.

- [ ] **Step 1: Create the cadence document**

Create `docs/seo/field-note-and-backlink-cadence.md` with:

```markdown
# Field Note and Backlink Cadence

## Publishing rhythm

Publish one evidence-led field note every two weeks.

Each note must include:

1. Problem and operating context.
2. Method or system boundary.
3. Evidence: code, test, measurement, capture, or cited source.
4. Result and what changed.
5. Limitations and next hardening step.
6. Links to the corresponding case study and relevant primary sources.

## Distribution

- Add the note to the portfolio field-notes index and sitemap.
- Share a concise evidence-led summary on LinkedIn.
- Link relevant repositories or documentation from GitHub.
- Use one canonical portfolio URL with tracking-free links.

## Legitimate backlink targets

- Project documentation and repository READMEs.
- Relevant professional or open-source communities.
- Collaborator and educational-affiliation profile pages.
- Curated technical directories with editorial review.
- Guest technical articles where the contribution is substantive.

## Guardrails

- Do not buy links.
- Do not automate unsolicited outreach.
- Do not use private-blog networks or irrelevant directories.
- Do not claim endorsements, deployments, or results without evidence.

## Monthly review

- Search Console indexed pages and queries.
- Sitemap status and crawl errors.
- Field Core Web Vitals when sufficient data exists.
- New referring domains and link relevance.
- Published-note consistency and internal-link coverage.
```

- [ ] **Step 2: Validate the cadence document**

Run:

```powershell
rg -n "evidence|Limitations|Do not buy links|Monthly review" docs/seo/field-note-and-backlink-cadence.md
```

Expected: all four operating principles are present.

- [ ] **Step 3: Commit the operating cadence**

```powershell
git add -- docs/seo/field-note-and-backlink-cadence.md
git commit -m "docs: define evidence-led publishing cadence"
```
