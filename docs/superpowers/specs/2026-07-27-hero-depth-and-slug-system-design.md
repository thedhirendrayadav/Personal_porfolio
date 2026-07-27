# Hero Depth and Slug System Design

## Objective

Refine the homepage hero into a cleaner technical portrait composition, add restrained 3D depth to the name treatment, restyle the intro statement as a field brief, and make project/blog slugs maintainable without breaking existing links.

## Visual Contract

- Produce a transparent-background portrait PNG from the supplied photograph. Preserve the subject and remove the original room/city background.
- Replace the current dot-grid overlay on the portrait with a restrained scanline/edge treatment and a subtle technical shadow plate behind the cutout.
- Add depth to the outline name using CSS pseudo-layers with small cyan and accent offsets, `perspective`, and a non-animated fallback for reduced motion.
- Style the intro paragraph as a `MISSION BRIEF` panel with mono metadata, an accent rail, and a readable editorial measure.
- Keep the existing theme, accent cycling, font cycling, responsive crop, and accessible alt text.

## Slug Contract

- Add one shared `slugify_text` helper for titles and labels.
- Server-side admin creation uses generated slugs when a slug is empty; browser-side generation remains a convenience only.
- Curated project slugs remain stable canonical identifiers. Title-derived aliases resolve to the canonical `/work/<slug>` URL with a permanent redirect.
- Blog posts use the same server-side generation rule for empty slugs.
- Existing project and blog URLs continue to resolve; no numeric project URL is removed.

## Acceptance Criteria

1. The portrait asset has transparency and loads in the hero without the old dot grid.
2. The name has visible depth while remaining readable in light/dark themes and reduced motion.
3. The mission brief uses the existing mono/accent language and does not overflow mobile.
4. Empty admin slugs are generated from titles, and title-derived project aliases redirect to canonical slugs.
5. Existing routes, tests, and project/blog content remain functional.
