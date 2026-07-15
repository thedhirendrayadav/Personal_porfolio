# Field Notes Archive Design

## Goal

Make the writing area feel like one managed editorial archive instead of three loosely related pages. The update covers the main archive, category results, and search results while preserving the existing Flask routes and database-backed content.

## Scope

- Update `templates/blog/index.html`, `templates/blog/category.html`, and `templates/blog/search.html`.
- Add shared archive-navigation and result-header styles to `static/css/editorial-portfolio.css`.
- Add focused public-page coverage for the visible archive structure.
- Do not alter article data, categories, routes, search behavior, or post detail pages.

## Information Architecture

The primary navigation remains `03/WRITING`. Writing pages use these local labels:

| View | Hero label | Navigation or results label | Listing label |
| --- | --- | --- | --- |
| Main archive | `FIELD NOTES` | `ARCHIVE NAVIGATION` | `LATEST NOTES` |
| Category | `FIELD NOTES / TOPIC` | `TOPIC RESULTS` | `FILED NOTES` |
| Search | `FIELD NOTES / SEARCH` | `SEARCH RESULTS` | `MATCHING NOTES` |

The main archive begins with an archive navigator. It contains a search form headed `Search the archive` and a topic directory headed `Browse by topic`. When categories exist, the directory lists the real category names and links. When no categories exist, it states that topics will appear as notes are filed.

Category and search pages use a shared result header: a readable page title, a real result count, and a return link to the main archive. Search preserves the submitted query and only shows the matching count when a query exists.

## Layout

At desktop widths, the archive navigator is a two-column editorial grid with search and topics as equal, bordered panels. The panels are dense enough to place the next writing section within reach rather than leaving a large empty band.

At smaller widths, the navigator becomes a single vertical stack. Search actions span the available width, topic links remain readable and wrap naturally, and results rows retain normal document order.

## Content Rules

- Headings and descriptions explain navigation and archive state; they do not claim unverified publication volume, readership, clients, or outcomes.
- Article titles, excerpts, categories, dates, reading times, and counts remain dynamically derived from existing models.
- Empty states remain explicit and useful, with a route back to the complete archive where appropriate.
- No new images, logos, metrics, or sample articles are introduced.

## Accessibility

- The search form keeps its associated label and uses the existing GET search route.
- Topic links stay inside a labeled navigation landmark.
- Result counts are plain text and do not depend on motion or color.
- The mobile layout preserves source order: search, topics, then article listings.

## Validation

1. Add a test that asserts the main archive exposes the archive navigator and its labeled topic directory.
2. Run the focused public-page test in RED before template changes, then run the full public-page suite after implementation.
3. Check touched files for diagnostics and whitespace errors.
4. Verify `/blog` in desktop and mobile browser viewports, plus category and search routes with populated test content.