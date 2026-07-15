# Editorial Portfolio Redesign Specification

## Objective

Redesign Dhirendra Yadav's public portfolio as a modern, editorial, one-page-led experience inspired by the interaction principles of mauriciojuba.com while remaining an original design. The result should communicate cybersecurity, AI/ML, and systems engineering expertise within the first viewport, make projects the primary evidence, and retain all existing Flask routes, dynamic project/blog data, contact behavior, and admin functionality.

## Reference Analysis

The reference site was crawled at 1440x900 and 390x844 with section-level captures for Intro, Work, Articles, Lab, About, and Contact. Its transferable system is:

- A near-black canvas (`#0e0e0e`) with warm off-white text and one icy accent.
- A fixed 56px editorial header with 10px uppercase, widely tracked section labels.
- Oversized solid/outline typography used as section landmarks.
- A treated portrait filling the hero instead of decorative cards or illustrations.
- Work presented as case studies with image, discipline/year metadata, concise outcomes, and quantified proof.
- Writing and experiments presented as dense bordered rows.
- About presented as portrait plus timeline/competency evidence.
- Contact presented as oversized actionable links.
- A slim telemetry/status strip with scroll progress, active section, accent, and local time.
- Motion based on masked reveals, active-section tracking, and restrained hover transitions.

The reference also showed WebGL/ResizeObserver allocation errors. This redesign must not reproduce that implementation. Halftone imagery will use pre-existing raster assets plus CSS blending/filtering, with no WebGL dependency.

## Original Visual Direction

### Identity

The hero leads with:

- `DHIRENDRA` in a light/outline display treatment.
- `YADAV.` in a heavy cyan display treatment.
- Role line: `CYBERSECURITY · AI/ML · SYSTEMS ENGINEERING`.
- Supporting statement focused on secure automation, enterprise platforms, and practical AI.
- Compact proof points: location, availability, and project count.
- Existing `static/images/profile.png` as a large monochrome/duotone portrait with a CSS halftone overlay.

The portfolio must not use the reference's logo, wording, awards badge, color-switch mechanism, or exact layout coordinates.

### Palette

- Canvas: `#0b0c0c`
- Raised surface: `#111313`
- Primary text: `#f1eee8`
- Secondary text: `#a9aaa7`
- Grid/border: `rgba(241, 238, 232, 0.16)`
- Primary accent: `#9df9f3`
- Security signal accent: `#ff5c4d`
- Success: `#75e6a4`

A light theme may invert canvas/text while retaining both accents. The dark theme is the default and primary art direction.

### Typography

- Display/body: `Rubik Variable` or bundled/fallback `Rubik, Arial, sans-serif`.
- Metadata: `IBM Plex Mono`, monospace fallback.
- Display headlines use fluid `clamp()` sizing, never direct viewport-width font sizing.
- Metadata uses 10-12px uppercase with 0.12-0.18em positive tracking.
- Body copy stays 16-20px with 1.55-1.7 line height.

### Layout

- Maximum content width: 1440px with 24-40px desktop gutters and 16px mobile gutters.
- Fixed header: 64px desktop, 56px mobile.
- Sections have numbered rails (`01`, `02`, etc.), dotted rules, and one oversized landmark title.
- Cards are reserved for individual project items and articles. Sections remain unframed.
- Border radius is 0-8px, except project media containers may use 12px.
- Mobile collapses to a single column and uses a full-screen numbered menu.

## Information Architecture

### Shared Public Shell

The public base template provides:

- Skip link.
- Fixed wordmark and numbered navigation.
- Mobile menu with accessible expanded state.
- Global scroll progress/status strip.
- Shared footer with email, GitHub, LinkedIn, availability, and copyright.
- SEO blocks already used by templates.
- One consolidated public stylesheet and one consolidated public script.

Admin templates and printable CV remain untouched.

### Homepage

The homepage is the immersive portfolio narrative:

1. **Intro**: identity, role, statement, portrait, proof points, CTA.
2. **Selected Work**: up to four dynamic featured projects, with tasteful static fallback projects when the database is empty.
3. **Expertise**: security engineering, AI/ML, full-stack systems, and automation presented as capability rows rather than icon cards.
4. **Proof / Credentials**: concise education, certificates, and practical evidence using existing images.
5. **Writing**: latest blog entries where available, with a useful empty state.
6. **About Preview**: short biography and links to the detailed About/Skills routes.
7. **Contact Close**: oversized email and social links.

### Portfolio Page

- Uses dynamic `projects` and their existing fields.
- Retains hard-coded fallback projects only when database content is absent.
- Projects appear as editorial case studies with title, type/status, summary, technology labels, media, and live/source actions.
- Category filtering is progressive enhancement; all work remains accessible without JavaScript.

### About Page

- Large `ABOUT / DHIRENDRA` landmark title.
- Treated profile image.
- Biography, location, education, work/project timeline, and key principles.
- Existing certificate/gallery assets appear in a compact evidence strip.

### Skills Page

- Removes solar-system/Three.js presentation.
- Uses competency matrices grouped into Security, AI/ML, Engineering, Infrastructure, and Tools.
- Each row includes confidence/context rather than decorative progress percentages.
- Includes a short methodology section explaining how the skills are applied.

### Blog

- Blog index, category, and search use the same editorial row system.
- Post pages retain trusted `post.content | safe` behavior and provide readable long-form typography.
- Existing route names from `app.py` are used; nonexistent Blueprint endpoint names are removed.
- Empty states are designed rather than leaving large blank regions.

### Contact Page

- Retains field names, CSRF hidden input, POST endpoint, rate-limit/error behavior, and JSON contract.
- Uses a two-column editorial layout: oversized contact channels plus a restrained form.
- Status messaging uses `role="status"`/`aria-live` and supports loading, success, validation, and server-error states.

### 404 Page

- Uses the shared shell only once.
- Large `404 / OFF GRID` headline and clear Home/Work actions.

## Interaction Model

- Header active-section state updates via IntersectionObserver.
- Scroll progress updates using `requestAnimationFrame` and CSS custom properties.
- Hero and section headings reveal through CSS transforms; no GSAP is required.
- Project media gains a restrained scale/contrast transition on hover.
- Links expose clear focus-visible states.
- Theme preference and reduced-motion preference are respected.
- No custom cursor, autoplay background video, Three.js, WebGL, orbital animations, or decorative glow systems.

## Accessibility

- WCAG AA text contrast.
- Semantic landmarks and heading order.
- Keyboard-operable menu and filters.
- Visible focus states.
- `prefers-reduced-motion` disables reveals and smooth scrolling.
- Images include meaningful alt text or are marked decorative.
- Touch targets are at least 44px.
- Content remains usable with JavaScript disabled.

## Responsive Requirements

Test at minimum:

- 1440x900 desktop.
- 1024x768 tablet landscape.
- 390x844 mobile.
- 360x800 narrow mobile.

No horizontal overflow is allowed. Oversized titles may crop intentionally within their own overflow-hidden section header, but body content and controls must remain fully visible.

## Technical Boundary

Modify public presentation only:

- `templates/base.html`
- `templates/index.html`
- `templates/about.html`
- `templates/skills.html`
- `templates/portfolio.html`
- `templates/contact.html`
- `templates/blog/index.html`
- `templates/blog/post.html`
- `templates/blog/category.html`
- `templates/blog/search.html`
- `templates/404.html`
- `static/css/editorial-portfolio.css` (new)
- `static/js/editorial-portfolio.js` (new)

Remove public references to obsolete global CSS/JS from `base.html`; leave old files in place to avoid unrelated deletion risk. Keep `templates/admin/**`, models, database managers, routes, and `templates/cv_print_optimized.html` unchanged.

## Validation

- Flask template rendering smoke tests for all public routes.
- Contact form DOM contract test for required IDs/names and CSRF field.
- Browser checks at all required viewports.
- Screenshot review of Home, Portfolio, About, Skills, Blog, Contact, and 404.
- Confirm no browser console errors, missing local assets, overlap, or horizontal overflow.
- Verify dynamic empty states when projects/posts are unavailable.

## Deployment

After local validation:

1. Commit the redesign.
2. Push `main` to `thedhirendrayadav/Personal_porfolio`.
3. Deploy to the existing Railway `personal-portfolio` project and `web` service.
4. Confirm deployment status `SUCCESS` and HTTP 200 from the public domain.
