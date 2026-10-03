# Full SEO, GEO, and AEO Remediation Implementation Plan

> **For agentic workers:** Execute this plan inline in task order. Do not spawn subagents. No automated tests will be added or run unless requested. Use the live crawl and endpoint checks below for verification.

**Goal:** Align every public search signal to the apex domain, improve page-specific metadata and answer/entity clarity, and submit the canonical sitemap through the existing verified Google Search Console property.

**Architecture:** Flask continues to generate canonical metadata, JSON-LD, robots, sitemap, RSS, and text indexes from one apex `SITE_URL`. Curated page metadata stays in the repository and database-backed records use safe fallbacks; no Supabase migration is needed. Render remains the host, with `www` redirecting to apex; Search Console receives the sitemap after the deployed output is verified.

**Tech Stack:** Python 3, Flask/Jinja, curated JSON/Python content, Render dashboard, Google Search Console, PowerShell/HTTP checks.

## Global Constraints

- Use `https://dhirendrayadav.site` as the sole canonical origin.
- Keep Render's existing permanent `www` to apex redirect and HTTPS behavior.
- Reuse the already DNS-verified Search Console domain property; do not add duplicate properties or change DNS verification.
- Do not invent credentials, clients, awards, metrics, addresses, phone numbers, service areas, project outcomes, or external authority.
- Keep the location at Bhaktapur, Nepal; remove the precise coordinates from visible copy and geo meta tags.
- Keep all schema consistent with visible content; do not represent the individual as an unverified business entity.
- Preserve Supabase content, tables, uploads, credentials, and all unrelated user files.
- Do not stage or commit `.freebuff/`, `design-reference/`, `output/`, or `reports/` as part of the site change.
- Do not add or run automated tests unless requested. Verify using the live-route checks in this plan.
- Do not claim indexing, ranking, rich results, or AI citations without direct evidence.

---

## File Map

- `app.py`: canonical origin fallback; canonical, robots, sitemap, RSS, `llms.txt`, and `humans.txt` output; truthful sitemap dates.
- `templates/base.html`: shared Person/WebSite/WebPage JSON-LD and geographic metadata.
- `templates/index.html`: homepage title/description and public location copy.
- `templates/work.html`, `templates/lab.html`, `templates/contact.html`, `templates/blog/index.html`, `templates/cv.html`: audited long or weak metadata.
- `templates/faq.html`: visible answer copy and FAQPage markup parity.
- `templates/project_detail.html`, `content/projects.json`: project-specific metadata and structured description fields for 12 curated case studies.
- `templates/blog/post.html`, `field_notes.py`: article metadata defaults and optional per-article SEO titles/descriptions for the two curated field notes.
- `templates/blog/category.html`: keep one-post archives out of indexing while fixing the malformed category hero header.
- `docs/superpowers/plans/2026-07-28-indexing-authority-remediation.md`: mark as superseded because it prescribes the now-wrong Railway and www architecture.
- Render `personal-portfolio` service settings: set `SITE_URL` to the apex origin only; preserve all other environment variables.
- Google Search Console: submit apex sitemap and inspect selected canonical pages in the existing verified domain property.

---

### Task 1: Align the Canonical Origin

**Files:**
- Modify: `app.py`
- Modify: `docs/superpowers/plans/2026-07-28-indexing-authority-remediation.md`

**Interfaces:**
- `SITE_URL` remains the shared origin used by the existing context processor and public discovery endpoints.
- Render's `SITE_URL` value must match the source default: `https://dhirendrayadav.site`.

- [ ] **Step 1: Correct the local fallback**

In `app.py`, change the existing assignment to:

```python
SITE_URL = os.environ.get('SITE_URL', 'https://dhirendrayadav.site').rstrip('/')
```

Keep the context processor and endpoint templates using this one constant; do not add separately hard-coded host strings.

- [ ] **Step 2: Mark the July plan as superseded**

Add this note immediately below the title in `docs/superpowers/plans/2026-07-28-indexing-authority-remediation.md`:

```markdown
> **Superseded:** This historical plan assumes Railway and `www` are canonical. The active deployment uses Render and `https://dhirendrayadav.site`; use `docs/superpowers/specs/2026-10-03-full-seo-geo-aeo-design.md` and `docs/superpowers/plans/2026-10-03-full-seo-geo-aeo.md` instead.
```

- [ ] **Step 3: Commit the canonical-origin source change**

Run:

```powershell
git add -- app.py docs/superpowers/plans/2026-07-28-indexing-authority-remediation.md
git commit -m "fix: use apex domain for search URLs"
```

Expected: only these two files appear in the commit.

### Task 2: Emit Truthful Sitemap Dates and Canonical URLs

**Files:**
- Modify: `app.py`

**Interfaces:**
- `normalize_sitemap_date(value, fallback=None) -> str | None` returns an ISO date only when the input contains a valid date.
- `sitemap_xml()` continues to return valid XML and to include static, curated project, and published-post URLs when optional database content is available.

- [ ] **Step 1: Remove the stale shared date**

In `sitemap_xml()`, remove the `release_date = '2026-07-28'` shared fallback and the static `route_dates` map containing July dates. Build the existing nine core route entries with `lastmod=None`. Preserve priorities and route ordering.

- [ ] **Step 2: Make date normalization nullable**

Change `normalize_sitemap_date` to use `fallback=None` and return `fallback` when parsing fails. Do not call `datetime.date.today()` to fill missing values.

- [ ] **Step 3: Keep genuine project and article dates**

For project entries, pass `project.get('updated_at')` with no dated fallback. For post entries, pass `post.get('updated_at') or post.get('created_at')` with no dated fallback. Keep existing exception handling so database outages do not remove core routes.

- [ ] **Step 4: Serialize optional `lastmod` and escape XML text**

Import `xml.sax.saxutils.escape` if it is not already available. When serializing each entry, always emit escaped `<loc>` text, emit `<lastmod>` only when its normalized value is non-null, and retain the existing change-frequency and priority fields. Every `<loc>` must be built from `SITE_URL` and its path.

- [ ] **Step 5: Commit the sitemap source change**

Run:

```powershell
git add -- app.py
git commit -m "fix: publish canonical sitemap with truthful dates"
```

Expected: `app.py` contains no hard-coded `www.dhirendrayadav.site` URL and no July 2026 blanket sitemap date.

### Task 3: Refine Shared Entity and Location Signals

**Files:**
- Modify: `templates/base.html`
- Modify: `templates/index.html`

**Interfaces:**
- Shared JSON-LD references continue to use `site_url`, `canonical_url`, and `default_og_image` from Flask's SEO context.
- Visible homepage location and structured data both state Bhaktapur, Nepal.

- [ ] **Step 1: Remove coordinate metadata**

Delete the `geo.position` and `ICBM` meta tags from `templates/base.html`. Keep `geo.region` and `geo.placename` only if they continue to reflect the city/country claim accurately.

- [ ] **Step 2: Remove the decorative exact coordinates**

In `templates/index.html`, replace the visible coordinate string in the hero field-log line with the existing public locality wording, `BHAKTAPUR, NEPAL`, and preserve the field-log year/label styling.

- [ ] **Step 3: Remove unsupported service-entity markup**

In the JSON-LD graph in `templates/base.html`, remove the `ProfessionalService` node and its reference. Keep `Person`, `WebSite`, and `WebPage`; retain `Person.address` at Bhaktapur/Nepal and the existing verified GitHub/LinkedIn `sameAs` URLs. Do not add LocalBusiness, telephone, street-address, rating, or unverified service-area data.

- [ ] **Step 4: Commit the entity/location change**

Run:

```powershell
git add -- templates/base.html templates/index.html
git commit -m "seo: clarify person entity and public location"
```

### Task 4: Improve Page Metadata and AEO Content

**Files:**
- Modify: `templates/index.html`
- Modify: `templates/about.html`
- Modify: `templates/work.html`
- Modify: `templates/lab.html`
- Modify: `templates/contact.html`
- Modify: `templates/blog/index.html`
- Modify: `templates/cv.html`
- Modify: `templates/faq.html`
- Modify: `templates/project_detail.html`
- Modify: `content/projects.json`
- Modify: `templates/blog/post.html`
- Modify: `templates/blog/category.html`
- Modify: `field_notes.py`

**Interfaces:**
- Jinja title and description blocks remain the source for the document title, shared Open Graph fields, and WebPage JSON-LD.
- Project records may supply optional `seo_title` and `seo_description`; if absent, use the existing project title and description.
- Post dictionaries may supply optional `seo_title` and `seo_description`; if absent, use the visible post title and excerpt.
- No Supabase schema or record update is required.

- [ ] **Step 1: Refine static-page titles and descriptions**

Keep the home, about, skills, and FAQ title wording where it is already clear. Shorten and clarify the audited weak titles with these title lines:

```text
work: Cybersecurity & AI Case Studies — Dhirendra Yadav
lab: Cybersecurity Research Lab — Dhirendra Yadav
contact: Contact Dhirendra Yadav — Cybersecurity & AI
blog index: Cybersecurity & AI Engineering Notes — Dhirendra Yadav
CV: Dhirendra Yadav — Cybersecurity & AI CV
```

Rewrite their descriptions and the homepage description as one-sentence, page-specific summaries that fit without truncation, mention only visible expertise/location/content, and do not repeat keyword lists. Keep unique titles and descriptions across all audited routes.

Use these exact title/description pairs for the 23 current sitemap routes. For the first nine pages, set the Jinja title and description blocks. For project and article routes, store the values in the optional `seo_title` and `seo_description` fields described below.

| Route | Title | Description |
|---|---|---|
| `/` | `Cybersecurity & AI Engineer in Nepal — Dhirendra Yadav` | `Dhirendra Yadav is a cybersecurity and AI engineer in Bhaktapur, Nepal, building secure automation, Python applications, and practical AI systems.` |
| `/about` | `About Dhirendra Yadav — Cybersecurity & AI Engineer` | `Learn about Dhirendra Yadav, a Bhaktapur-based BSc IT graduate working across cybersecurity, AI/ML, Python, secure automation, and full-stack engineering.` |
| `/skills` | `Cybersecurity, AI/ML & Python Skills — Dhirendra Yadav` | `Explore Dhirendra Yadav's applied skills in defensive cybersecurity, AI/ML, Python, Flask, Django, REST APIs, cloud deployment, and secure systems engineering.` |
| `/work` | `Cybersecurity & AI Case Studies — Dhirendra Yadav` | `Browse Dhirendra Yadav's cybersecurity, AI/ML, Python automation, ERP, and systems engineering case studies, with status and evidence clearly stated.` |
| `/lab` | `Cybersecurity Research Lab — Dhirendra Yadav` | `Explore Dhirendra Yadav's research in threat modeling, detection workflows, grounded AI, and deployment observability, with clear methods and evidence targets.` |
| `/contact` | `Contact Dhirendra Yadav — Cybersecurity & AI` | `Contact Dhirendra Yadav in Bhaktapur, Nepal about cybersecurity, secure web applications, Python automation, AI/ML workflows, or systems engineering.` |
| `/blog` | `Cybersecurity & AI Engineering Notes — Dhirendra Yadav` | `Read Dhirendra Yadav's field notes on cybersecurity, threat modeling, AI/ML, Python automation, secure architecture, and systems engineering.` |
| `/faq` | `Cybersecurity & AI Engineering FAQ — Dhirendra Yadav` | `Get direct answers about Dhirendra Yadav's cybersecurity, AI/ML, Python automation, engineering process, project evidence, location, and availability.` |
| `/cv` | `Dhirendra Yadav — Cybersecurity & AI CV` | `View Dhirendra Yadav's CV, including cybersecurity, AI/ML systems, secure automation, selected projects, education, and technical skills.` |
| `/work/multi-channel-ai-messaging` | `AI Messaging Platform Case Study — Dhirendra Yadav` | `Case study: a prototype messaging backend that routes channel adapters and Redis-backed queues for asynchronous processing, with scope and evidence shown.` |
| `/work/nepse-market-intelligence` | `NEPSE Market Intelligence Case Study — Dhirendra Yadav` | `Research system for price ingestion, technical indicators, news sentiment, ensemble forecasts, backtesting, API, and dashboard; review its limits.` |
| `/work/secure-portfolio-platform` | `Secure Portfolio Platform Case Study — Dhirendra Yadav` | `A Flask portfolio and content platform with database fallbacks, protected contact input, response headers, and evidence-backed public pages.` |
| `/work/runpod-media-orchestrator` | `RunPod Media Orchestrator Case Study — Dhirendra Yadav` | `Prototype orchestration for GPU provisioning, prompt transfer, media jobs, result retrieval, and teardown; inspect workflow boundaries and evidence.` |
| `/work/hotmail-automation` | `Hotmail Automation Prototype — Dhirendra Yadav` | `Prototype workflow concept for inbox triage, reusable message templates, and operator-approved follow-up. Review intended scope and evidence limits.` |
| `/work/erp-system` | `ERP System Prototype — Dhirendra Yadav` | `Prototype ERP concept for inventory, purchasing, sales, and operational reporting, with scope, status, and evidence boundaries documented.` |
| `/work/school-management` | `School Management Prototype — Dhirendra Yadav` | `Prototype school management concept for student records, classes, attendance, communication, and progress views, with status and limits documented.` |
| `/work/restaurant-management` | `Restaurant Management Prototype — Dhirendra Yadav` | `Prototype restaurant operations concept for menus, tables, orders, kitchen flow, stock, and daily reporting, with project scope and status.` |
| `/work/attendance-management` | `Attendance Management Prototype — Dhirendra Yadav` | `Prototype attendance workflow for check-in records, approvals, schedule context, and role-aware reporting, with evidence and status boundaries.` |
| `/work/accounting-software` | `Accounting Software Prototype — Dhirendra Yadav` | `Prototype accounting concept covering the chart of accounts, journal entries, reconciliation, and review states; see its scope and status.` |
| `/work/billing-software` | `Billing Software Prototype — Dhirendra Yadav` | `Prototype billing concept for customer accounts, invoices, line items, payment status, and operator review, with scope and status boundaries.` |
| `/work/staff-management-system` | `Staff Management System Prototype — Dhirendra Yadav` | `Prototype staff operations concept for profiles, roles, leave, attendance context, and manager workflows; inspect its evidence and boundaries.` |
| `/blog/flask-public-content-and-administration` | `Flask Public Content and Admin Security — Dhirendra Yadav` | `A Flask portfolio separates public pages, editable content, contact input and admin access. This field note explains the boundaries and evidence.` |
| `/blog/trustworthy-prototype-project-pages` | `Trustworthy Prototype Project Pages — Dhirendra Yadav` | `Learn how a prototype project page connects claims to source evidence, describes constraints, and avoids implying production readiness.` |

- [ ] **Step 2: Add optional metadata fallbacks to content templates**

In `templates/project_detail.html`, use `project.get('seo_title') or project.get('title', '') ~ ' case study — Dhirendra Yadav'` for the title and `project.get('seo_description') or project.get('description', '')` for the description. Use the same resolved description in the CreativeWork JSON-LD. Preserve the visible project title, evidence boundaries, technologies, and `CreativeWork` type.

In `templates/blog/post.html`, use `post.get('seo_title') or post.get('title', '') ~ ' — Dhirendra Yadav'` for the title and `post.get('seo_description') or post.get('excerpt') or 'A field note by Dhirendra Yadav.'` for the description. Use that resolved title/description in the BlogPosting JSON-LD. Preserve the existing visible post title, article author, and date.

Remove page-level `og_title` and `og_description` overrides in the About, Work, Lab, Contact, FAQ, project, and article templates so Open Graph uses the same resolved title and description as the document. Convert project/article image overrides into the base template's `og_image` block; emit exactly one `og:image`, use an absolute URL, retain the default profile image when no content image exists, and preserve the content image when one does.

- [ ] **Step 3: Add factual metadata to curated case studies and field notes**

Add optional `seo_title` and `seo_description` values to each of the 12 records in `content/projects.json` and each of the 2 curated entries in `field_notes.py`. Keep the copy distinct, explicit that prototype/research/in-development work has its recorded status, and grounded in fields already displayed by each page. Do not change visible article headlines or project claims solely to fit snippet length.

- [ ] **Step 4: Keep thin category archives crawlable but out of the index**

In `templates/blog/category.html`, add `{% block robots %}noindex, follow, noarchive{% endblock %}` before the content. Do not disallow `/blog/category/` in `robots.txt`, because Google must be able to crawl the route to observe `noindex`. Fix the malformed opening `<header>` tag to `<header class="page-hero editorial-grid category-hero" data-section="00 — CATEGORY">` and place the eyebrow paragraph and `DOC DY-BLOG / CATEGORY ARCHIVE` span as normal children inside the opening tag. Keep the two categories out of the sitemap until each has distinct editorial content beyond its one-post list.

- [ ] **Step 5: Tighten the FAQ answers and keep schema in parity**

In `templates/faq.html`, refine the existing answer copy for work focus, Bhaktapur/Nepal, how to start a project conversation, and project status. Add the visible question `How are project claims checked?` with this answer: `Each case study connects its claims to available source files, schemas, tests, captures, reports, or terminal records. It separates observed evidence from constraints and work that remains.` Add the same question and answer to FAQPage JSON-LD. Keep the JSON-LD questions and answers equivalent to visible FAQ content.

- [ ] **Step 6: Commit the metadata and AEO content**

Run:

```powershell
git add -- templates/index.html templates/about.html templates/work.html templates/lab.html templates/contact.html templates/blog/index.html templates/blog/category.html templates/cv.html templates/faq.html templates/project_detail.html content/projects.json templates/blog/post.html field_notes.py
git commit -m "seo: improve page metadata and direct answers"
```

Expected: all 23 live sitemap pages still have distinct titles/descriptions; content does not claim unsupported credentials or production results.

### Task 5: Configure Render and Deploy the Search-Clean Build

**Files/services:**
- Render dashboard service `personal-portfolio` (`srv-db0fik7avr4c73ffqrhg`)
- Git remote branch `codex/render-supabase-deployment`

- [ ] **Step 1: Review the exact Render variable**

Open the Render environment page for `personal-portfolio`. Change only `SITE_URL` to `https://dhirendrayadav.site`. Preserve Supabase credentials, secrets, and every unrelated environment value.

- [ ] **Step 2: Push the approved branch**

Run:

```powershell
git status --short
git push origin codex/render-supabase-deployment
```

Before pushing, confirm the staged/committed work contains only the design/plan and SEO changes; leave `.freebuff/`, `design-reference/`, `output/`, and `reports/` untouched and unpushed.

- [ ] **Step 3: Set the Render origin and deploy**

Set `SITE_URL` to the exact apex value in Render, then allow the connected branch deployment to finish. Confirm the service reports Live/Healthy before continuing. If Render requires a manual deploy, deploy the current branch commit only.

### Task 6: Submit the Canonical Sitemap in Search Console

**Service:** existing verified Google Search Console domain property `dhirendrayadav.site`.

- [ ] **Step 1: Confirm the apex sitemap response**

Open `https://dhirendrayadav.site/sitemap.xml` and confirm it returns XML whose `<loc>` elements all use the apex domain. Do not submit until this check passes.

- [ ] **Step 2: Submit the apex sitemap**

In Search Console's existing domain property, submit `https://dhirendrayadav.site/sitemap.xml`. Do not add a new property or verification record.

- [ ] **Step 3: Inspect representative URLs**

Use URL Inspection on the apex homepage, `/work`, `/faq`, one case study, and one article. Request indexing for these canonical URLs if the action is available. Record actual status and any processing delay; do not repeat a denied request.

### Task 7: Re-Crawl, Re-Score, and Report

**Files:**
- Update: `reports/seo-audit-dhirendrayadav-site-2026-10-03.docx`
- Update: `reports/seo-audit-dhirendrayadav-site-2026-10-03.pdf`

- [ ] **Step 1: Check host behavior and crawl directives**

Fetch the apex and www homepages plus `robots.txt`, `sitemap.xml`, `feed.xml`, and `llms.txt`. Expected: apex returns 200, www permanently redirects to apex, sitemap locs use apex, and every absolute URL in discovery endpoints uses apex.

- [ ] **Step 2: Crawl sitemap and linked category pages**

For every `<loc>`, request the exact URL and inspect response status, final URL, canonical, title, description, H1 count, robots meta, Open Graph fields, JSON-LD parseability, and image alt coverage. Also request `/blog/category/security` and `/blog/category/systems`. Expected: all 23 sitemap URLs directly return 200 with matching self-canonical apex URLs; both category pages return 200, carry `noindex, follow`, use apex canonicals, and remain crawlable; neither category URL appears in the sitemap.

- [ ] **Step 3: Verify factual answer/entity parity**

Compare the visible FAQ questions/answers with FAQPage JSON-LD, check the sameAs links and city/country location, and confirm no precise coordinates or ProfessionalService node remain. Check article/project schema against visible content.

- [ ] **Step 4: Record the Search Console result and honest scores**

Capture the apex sitemap status and discovered-page count visible in Search Console. Re-score SEO, GEO, and AEO against the `10/10 Quality Target` section of `docs/superpowers/specs/2026-10-03-full-seo-geo-aeo-design.md`. Assign 10/10 only where all criteria are verified; state any external Google or evidence limitation rather than inflating the score.

- [ ] **Step 5: Refresh the audit report artifacts**

Update both report files with the post-deploy crawl and Search Console evidence. Render the PDF and inspect its pages visually. If a DOCX visual renderer is unavailable, verify that DOCX opens and its headings/tables contain the same post-deploy findings; state that limitation.

- [ ] **Step 6: Review commit contents**

Run `git status --short` and `git log -n 6 --oneline`. Confirm all source commits are on the intended branch and only SEO scope files were pushed. Do not include the local report artifacts in the code push unless the user asks for reports to be versioned.

---

## Final Acceptance Checklist

- [ ] Render uses apex `SITE_URL`; service is Live/Healthy.
- [ ] Apex pages directly return 200, `www` redirects once to apex, and canonicals match.
- [ ] Sitemap contains valid XML, apex URLs only, and accurate or omitted `lastmod` values.
- [ ] robots, RSS, llms, humans, OG and JSON-LD use consistent apex URLs.
- [ ] All 23 sitemap URLs have distinct accurate metadata, one H1, and no accidental `noindex`; both one-post category archives are crawlable, canonical, and `noindex, follow`.
- [ ] Person identity and locality are consistent; exact coordinates and unsupported service markup are removed.
- [ ] FAQ schema mirrors visible answers; case study/article schema matches visible content.
- [ ] The apex sitemap's Search Console state is visibly recorded; indexing is claimed only if explicitly shown.
- [ ] Final 10/10 scores are assigned only if the spec's evidence criteria are satisfied.
- [ ] Unrelated untracked user files and local report artifacts remain outside the source commits.
