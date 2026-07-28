# Indexing and Authority Remediation Design

## Objective

Move `dhirendrayadav.site` from a technically indexable launch state to a
monitored, consistently discoverable portfolio without inventing credentials,
project outcomes, or third-party authority.

Success means:

- Google Search Console has a verified domain property for
  `dhirendrayadav.site`.
- `https://www.dhirendrayadav.site/sitemap.xml` is submitted successfully.
- Priority URLs can be inspected and requested for indexing.
- Sitemap modification dates reflect real content changes instead of the
  current request date.
- Trailing-slash variants permanently redirect to slashless canonical URLs.
- Public metadata remains unique, accurate, and appropriately sized.
- Published field notes and evidence-led project pages are discoverable through
  internal links and the sitemap.
- The deployed Railway service passes route, SEO, crawl, and performance
  verification.

## Scope

### Technical indexing

- Preserve `www.dhirendrayadav.site` as the canonical host.
- Preserve the apex-to-www permanent redirect.
- Add a permanent redirect from inner trailing-slash URLs to their slashless
  equivalents while keeping `/` unchanged.
- Generate sitemap entries from public routes, curated projects, and published
  posts.
- Associate each sitemap entry with a real modification date from a stable
  content source:
  - static routes use an explicit release date;
  - curated projects use their registry or source modification date;
  - blog posts use `updated_at` or `created_at`;
  - no entry uses the request date as a blanket fallback.
- Keep admin, API, debug, search, and error pages excluded from indexing.

### On-page and authority content

- Preserve the locally implemented About, FAQ, title, and description
  improvements where they are factual.
- Expand thin project summaries only with evidence already present in the
  curated project registry, repository documentation, tests, or public
  deployment evidence.
- Do not invent employers, education details, certifications, dates, metrics,
  client names, production status, or outcomes.
- Publish or expose field notes only when their content source already exists
  and can be represented truthfully.
- Keep entity fields consistent across Person schema, visible content,
  `llms.txt`, `humans.txt`, LinkedIn, GitHub, and the canonical site where the
  connected accounts permit edits.

### Search Console

- Add a domain property for `dhirendrayadav.site` in the signed-in Google
  account.
- Use DNS verification so all protocols and subdomains are covered.
- Apply the exact Google verification record through the connected DNS surface
  when available.
- Verify ownership, submit `sitemap.xml`, and inspect the homepage plus the
  strongest case-study URLs.
- Request indexing only for canonical, indexable URLs.
- Do not claim all pages are indexed until Search Console reports that result.

### Performance

- Preserve the current accessibility and best-practice scores.
- Address mobile LCP and total blocking time only where the audit identifies a
  concrete local cause.
- Avoid visual redesign or unrelated refactoring.

## Implementation Boundaries

- Flask remains the application framework.
- Railway remains the deployment target.
- Existing database and uploaded content are preserved.
- Existing uncommitted user files and unrelated changes are not overwritten,
  deleted, staged, or committed.
- Search Console and DNS mutations use exact values returned by the relevant
  services; no verification token is guessed.
- External submissions are verified from their resulting UI state.

## Data Flow

1. Content sources provide stable public routes and modification timestamps.
2. Flask produces canonical HTML, redirects, robots directives, and the XML
   sitemap.
3. Railway serves the verified build on the canonical www host.
4. Apex and trailing-slash variants permanently redirect to canonical URLs.
5. Search Console verifies the root domain through DNS and fetches the sitemap.
6. URL Inspection reports Google's page-level crawl and index status.

## Error Handling

- Missing optional database content does not break the sitemap; static and
  curated routes remain available.
- Invalid or missing post dates fall back to a stable application release date,
  not the current request date.
- DNS verification remains pending if the exact record cannot be applied; the
  site is not redeployed merely to simulate verification.
- Failed indexing requests are reported with their visible Search Console
  reason and are not repeatedly resubmitted.

## Test Strategy

Follow red-green-refactor for each behavior change:

1. Add failing tests for trailing-slash canonical redirects.
2. Add failing tests proving sitemap dates are stable and content-specific.
3. Add failing tests proving published posts appear and non-public content does
   not appear in the sitemap.
4. Add failing metadata/content assertions for audited weak pages.
5. Implement the minimum production changes required for each test.
6. Run the full regression suite in a writable pytest temporary directory.
7. Run local crawl checks across every sitemap URL.
8. Deploy to Railway and repeat live crawl, redirect, schema, and header checks.
9. Rerun mobile Lighthouse and record the measured scores.
10. Verify Search Console property, sitemap, and URL Inspection states in the
    browser.

## Completion Criteria

The remediation is complete only when:

- all relevant automated tests pass in a fresh run;
- all sitemap URLs return the intended live status;
- redirects resolve to the canonical www URLs without loops;
- sitemap dates are stable across repeated requests;
- production metadata and JSON-LD parse successfully;
- Railway reports the deployment online;
- Search Console property verification and sitemap submission are visibly
  confirmed, or the exact external blocker is documented;
- no claim of full indexing is made without Search Console evidence.
