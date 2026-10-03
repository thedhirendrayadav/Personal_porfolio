# Full SEO, GEO, and AEO Remediation Design

## Status

Approved scope: full technical and content fixes.

This design supersedes the July 2026 indexing-authority design where that
document assumes Railway and `www` are canonical. The live site now runs on
Render and redirects `www.dhirendrayadav.site` to `dhirendrayadav.site`.

## Objective

Give the portfolio one consistent, crawlable identity across its deployed
pages, structured data, feeds, and Google Search Console, then improve how
each important page explains its subject to search and answer systems.

## 10/10 Quality Target

Target a 10/10 reassessment for SEO, GEO, and AEO by closing every
site-controllable issue from the full audit. A score of 10 is earned only when
the corresponding evidence below is verified; it is not a copy or marketing
claim.

- **SEO:** all public sitemap URLs use HTTPS apex canonicals and return 200
  directly; generated endpoints agree on the origin; sitemap XML is valid and
  accepted by Search Console; `lastmod` is accurate or omitted; all audited
  pages have distinct, accurate titles and descriptions, one clear H1, useful
  internal routes, complete social metadata, descriptive image text, and
  truthful structured data.
- **GEO:** the named-person entity, city/country location, expertise, contact
  route, biography, and sameAs profiles are consistent and verifiable; project
  claims link to first-hand evidence; no unsupported credentials, service
  areas, precise location, or third-party authority are added. If independent
  corroboration is not available, report it as an external limit instead of
  fabricating it or inflating the score.
- **AEO:** priority pages answer their key questions directly and visibly;
  answers are concise, factual, and supported by page evidence; headings and
  lists make information easy to extract; FAQ markup matches visible FAQ
  content; no rich-result or answer-citation outcome is promised.

Reassess against these same criteria after deployment. If a Google-side delay
or missing externally verifiable fact prevents a 10, report the evidence and
the remaining limit plainly rather than assigning a cosmetic 10.

Success means:

- The apex HTTPS host is the single canonical origin because Render currently
  serves it as the final host.
- All indexable pages, sitemap entries, social URLs, RSS links, and machine
  readable site maps agree on the apex origin.
- The verified Google Search Console domain property has the apex sitemap
  submitted and its visible processing status recorded; the former `www`
  sitemap is documented as stale. Any Google-side processing delay is
  reported honestly.
- Sitemap `lastmod` values are emitted only where a truthful content date is
  available.
- Titles and descriptions accurately distinguish the 23 public pages and are
  written to be clear and useful when displayed, without artificial
  keyword-stuffing or hard truncation.
- Public entity data describes Dhirendra Yadav consistently at city/country
  precision and uses schema types that match the visible personal portfolio.
- The FAQ and case studies make concise, sourceable answers easy to find;
  FAQ structured data matches visible answers and is not treated as a promise
  of a Google rich result.
- Public pages remain factual about project status, evidence, and limitations.

## Current Evidence

- The production sitemap lists 23 routes. Each resolves to HTTP 200 after the
  `www` to apex redirect.
- The 23 sitemap `loc` values and the pages' self-referencing canonical tags
  currently use `www`, even though `www` redirects to the apex.
- Google Search Console already contains the verified domain property
  `dhirendrayadav.site`; DNS ownership is auto verified.
- The property's submitted sitemap is the `www` URL and has status
  “Couldn't fetch”, last read on 9 August 2026, with 21 discovered pages.
- All 23 pages have a unique title, one H1, a meta description, and Open Graph
  title, description, and image fields. All 42 crawled images have alt text.
- Five titles are longer than 60 characters; twelve are shorter than 50.
  Five descriptions exceed 160 characters and eight are shorter than 120.
  These counts guide editorial review rather than define ranking rules.
- Static sitemap dates are 27–28 July 2026. Dynamic project and article dates
  are used where available.
- Sitewide JSON-LD currently describes Person, PostalAddress,
  ProfessionalService, WebSite, and WebPage. Content pages add BlogPosting,
  CreativeWork, or FAQPage markup.
- The site's human readable and machine readable location currently includes
  precise coordinates in addition to Bhaktapur, Nepal. City/country location
  is sufficient for this personal portfolio; precise coordinates are not
  required for search visibility.

## Chosen Approach

Use one focused remediation across the Flask source, curated content, the
Render service configuration, and the existing Search Console property.
Keep Render's existing apex redirect and HTTPS behavior. Correct the source
default and deployed `SITE_URL` value so all absolute URL producers agree.
Then update only weak or ambiguous page copy and schema fields; preserve the
current design, page structure, routing, project evidence model, database,
and existing DNS verification.

This is preferred over leaving the site unchanged or applying only a one-time
Search Console submission: either alternative would leave the site sending
conflicting canonical signals.

## Design Details

### Canonical host and discoverability endpoints

- Set the Flask `SITE_URL` fallback and Render environment value to
  `https://dhirendrayadav.site`.
- Keep the current permanent `www` to apex redirect in Render. Do not add
  another competing redirect in Flask.
- Confirm the HTML canonical and `og:url`, JSON-LD entity URLs, sitemap `loc`,
  robots sitemap declaration, RSS URLs, `llms.txt`, and `humans.txt` use the
  apex host.
- Ensure the sitemap includes only indexable, self-canonical apex URLs. Keep
  admin, API, debug, and search endpoints out of it.
- Continue to build the sitemap from static public routes, curated project
  pages, and published articles. Retain its graceful behavior if optional
  database content is unavailable.
- Omit `lastmod` when a trustworthy update date is unavailable. Preserve
  database article dates and project dates when those sources supply them;
  maintain explicit dates only for static routes whose content is actually
  revised. Do not use the request date or a shared stale fallback.

### Titles and descriptions

- Review the home, about, skills, work, lab, contact, blog, FAQ, and CV
  metadata as one set so each title and description describes a distinct page.
- Improve the long work, lab, blog, and CV titles/descriptions first; retain
  already clear metadata when a length count alone does not make it worse.
- For project and article templates, use optional per-record SEO title and
  description values when available. Fall back to the visible title and
  existing description/excerpt for database-backed content. Do not require a
  Supabase schema migration.
- Keep metadata accurate, readable, and distinctive. Do not keyword-stuff,
  claim certifications or outcomes without evidence, or cut strings at a
  fixed character boundary.
- Keep the primary H1 and page topic aligned with the metadata. Preserve
  descriptive image alt text and complete social-card fields.

### GEO and person/entity representation

- Keep the public location as Bhaktapur, Nepal and preserve consistent
  GitHub/LinkedIn identity references.
- Remove the exact latitude/longitude values from decorative homepage copy and
  geographic meta tags; a personal portfolio does not need to expose a more
  precise location than its stated city.
- Keep sitewide Person, WebSite, and WebPage JSON-LD. Retain
  BlogPosting, CreativeWork, and FAQPage types on matching page templates.
- Remove `ProfessionalService` markup unless the visible site and verified
  business details establish a distinct professional-service entity. Do not
  turn a personal portfolio into a fictitious LocalBusiness record.
- Keep all structured data consistent with visible text. Do not add a street
  address, phone, ratings, service outcomes, or other facts absent from the
  site.

### AEO and answer content

- Improve the FAQ with clear, concise answers on work focus, location,
  collaboration, and project status. Ensure every marked-up question and
  answer appears on the page with equivalent wording.
- Keep answer-first language where the existing content already has
  question-led sections. Add only evidence-supported clarifications to the
  relevant work and project pages; do not generate duplicate generic FAQs on
  every page.
- Treat the `llms.txt` file as a supplementary content index. The canonical
  HTML pages remain the authoritative source.
- Do not promise rankings, answer-engine citations, or FAQ rich-result
  visibility.

### Google Search Console

- Reuse the existing verified domain property. Do not add duplicate
  properties or change DNS verification records.
- After the apex deployment is live, submit
  `https://dhirendrayadav.site/sitemap.xml` in the domain property's Sitemaps
  report.
- Inspect the homepage, an about/work page, one case study, and one article.
  Request indexing for those canonical public URLs if the UI offers the
  action; do not repeat failed requests in a loop.
- Capture the visible sitemap processing result and report any Google-side
  delay or blocker precisely. Sitemap submission is a discovery signal, not
  proof that pages are indexed.

## Files and Services in Scope

- `app.py`: canonical origin fallback, sitemap URL/date generation, robots,
  RSS, and machine-readable site endpoints.
- `templates/base.html`: entity schema and geo metadata.
- `templates/index.html`, page templates, `templates/faq.html`,
  `templates/project_detail.html`, and `templates/blog/post.html`: page-level
  metadata and answer copy where audit evidence shows a concrete need.
- `content/projects.json`, `field_notes.py`: optional factual metadata copy
  for curated case studies and articles, only if template fallbacks alone
  cannot provide distinct useful snippets.
- Render `personal-portfolio` environment: set `SITE_URL` to the apex origin.
- Existing Google Search Console domain property: sitemap submission and
  selected URL inspection after deployment.

## Out of Scope

- New DNS records, a new Search Console property, or a domain-provider change.
- Database migrations or edits to Supabase records.
- A redesign, new pages, fabricated credentials/results, new analytics
  collection, or unverified external backlink claims.
- Deleting the historical `www` sitemap entry from Search Console. Submit and
  verify the canonical apex sitemap; leave the old row as historical evidence
  unless Google provides a clear removal path that is needed to resolve a
  concrete processing issue.
- Guarantees about ranking, indexing timing, Core Web Vitals field data, or
  answer-engine citations.

## Verification

After approval of this spec and its implementation plan:

1. Inspect generated HTML and endpoint output for apex-only absolute URLs.
2. Fetch every sitemap entry and confirm it is canonical and returns HTTP 200
   without a further redirect.
3. Parse the XML sitemap and representative JSON-LD documents; compare FAQ
   markup with its visible answers.
4. Crawl all 23 public sitemap URLs for title/description uniqueness, one H1,
   indexing directives, and social metadata.
5. Confirm the Render deployment is healthy and both apex and `www` HTTPS
   behavior match the selected canonical host.
6. Confirm Search Console accepts the apex sitemap and record the observed
   status and discovered page count. Do not report indexing unless Search
   Console visibly confirms it.

No automated tests will be added or run unless requested; verification will
use the live route and metadata checks listed above.

