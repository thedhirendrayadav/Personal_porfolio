# Search, Profile, and Mobile Performance Alignment

## Objective

Strengthen Dhirendra Yadav's search entity by aligning the portfolio, Google
Search Console, GitHub, and LinkedIn around the same verified identity and
evidence-backed positioning. Improve the portfolio's mobile loading performance
without changing its established visual direction.

## Canonical Identity

- Name: Dhirendra Yadav
- Primary website: `https://www.dhirendrayadav.site`
- Location: Bhaktapur, Nepal
- Professional positioning: Cybersecurity and Systems Engineer
- Supporting specialties: secure automation, AI/ML systems, and full-stack
  product engineering
- GitHub: `https://github.com/thedhirendrayadav`
- LinkedIn: `https://www.linkedin.com/in/dhirendra-yadav-3b1387425/`

Claims used on external profiles must be supported by the portfolio. Do not add
employer, certification, award, or experience claims that are absent from the
site's evidence.

## Google Search Console

Create and verify the `dhirendrayadav.site` domain property using Google's DNS
TXT record. Preserve the existing Railway verification TXT record and all
production routing records.

After verification:

1. Submit `https://www.dhirendrayadav.site/sitemap.xml`.
2. Confirm that Search Console accepts the sitemap.
3. Inspect the canonical homepage and request indexing only if the inspection
   surface reports that it is not indexed.

If Hostinger authentication or DNS propagation blocks verification, retain the
pending Search Console property and verification value without removing or
replacing other DNS records.

## GitHub Profile

Update the signed-in `thedhirendrayadav` profile:

- Display name: `Dhirendra Yadav`
- Bio: `Cybersecurity & Systems Engineer building secure automation, AI/ML systems, and practical digital products.`
- Location: `Bhaktapur, Nepal`
- Website: `https://www.dhirendrayadav.site`

Keep the profile concise and consistent with the portfolio. Do not imply
employment or seniority not supported by the website.

## LinkedIn Profile

Update the signed-in profile at
`https://www.linkedin.com/in/dhirendra-yadav-3b1387425/`.

- Headline:
  `Cybersecurity & Systems Engineer | Secure Automation | AI/ML Systems | Full-Stack Product Engineering`
- Website:
  `https://www.dhirendrayadav.site`
- Location: retain the current Nepal location unless LinkedIn offers the more
  specific supported location `Bhaktapur, Nepal`.
- About:

  `I am Dhirendra Yadav, a BSc IT graduate focused on cybersecurity, AI/ML, and full-stack systems. I build secure automation, intelligent tools, and practical digital products from Bhaktapur, Nepal.`

  `My work includes defensive automation, production web systems, AI integrations, and data-backed operational platforms. I document the reasoning, implementation, and verification behind selected projects at dhirendrayadav.site.`

  `I am open to collaboration and opportunities involving cybersecurity engineering, AI/ML systems, automation, and product engineering.`

Do not change education history, employment history, verification state, profile
photo, or open-to-work preferences as part of this scope.

## Portfolio Social Links

Replace the obsolete LinkedIn URL
`https://www.linkedin.com/in/dhirendra-yadav-3040b82b4` with the verified active
profile URL everywhere it appears, including:

- footer links;
- `Person.sameAs` structured data;
- any page-specific schema or metadata;
- tests that enforce the entity links.

Keep the existing GitHub link. Add descriptive accessible labels for GitHub and
LinkedIn links if the current visible label does not identify Dhirendra Yadav.
External links must use safe `rel` attributes.

## Mobile Performance

Baseline Lighthouse mobile result captured on 2026-07-28:

- Performance: 64
- First Contentful Paint: 2.1 seconds
- Largest Contentful Paint: 10.7 seconds
- Total Blocking Time: 330 milliseconds
- Cumulative Layout Shift: 0.001
- Speed Index: 3.7 seconds

The primary issue is image delivery. Lighthouse estimated approximately
8.6 MiB of avoidable image transfer and 420 milliseconds of render-blocking
delay.

Implementation should:

1. Convert oversized photographic assets to efficient WebP or AVIF variants.
2. Serve responsive image dimensions and explicit width/height attributes.
3. Ensure the homepage LCP image is discoverable in initial HTML, is not lazy
   loaded, and receives appropriate fetch priority.
4. Keep below-the-fold images lazy loaded.
5. Preserve visual quality and existing art direction.
6. Avoid introducing a client-side image framework or unnecessary JavaScript.
7. Re-run mobile Lighthouse and compare results with the baseline.

## Publishing and Backlinks

Publishing and backlink acquisition are ongoing editorial work, not a one-time
code change.

- Publish one evidence-led field note every two weeks.
- Each note should present a problem, method, evidence, result, and limitations.
- Link relevant notes to corresponding portfolio case studies.
- Share published work through the aligned LinkedIn and GitHub profiles.
- Pursue legitimate links from project documentation, relevant professional
  communities, collaborators, educational affiliations, and technical
  directories.
- Do not buy links, automate unsolicited outreach, or create misleading
  endorsements.

## Verification

Completion requires evidence for each implemented surface:

- Search Console shows the domain property as verified.
- The submitted sitemap shows an accepted or successful state.
- GitHub publicly displays the agreed name, bio, location, and website.
- LinkedIn publicly displays the agreed headline and About content.
- Every live portfolio GitHub and LinkedIn link resolves to the intended active
  profile.
- Portfolio structured data contains the same active social URLs.
- Automated site tests pass.
- The production deployment succeeds.
- A fresh mobile Lighthouse run records the post-change metrics.
