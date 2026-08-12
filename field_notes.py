from copy import deepcopy
from datetime import datetime


CURATED_FIELD_NOTES = [
    {
        "id": "curated-flask-public-content-and-administration",
        "title": "How a Flask portfolio platform separates public content from administration",
        "slug": "flask-public-content-and-administration",
        "excerpt": "A field note on separating public pages, mutable content, contact input, and administration in a Flask portfolio application.",
        "content": """
<h2>What boundary matters first?</h2>
<p>A portfolio application is not only a collection of public pages. This Flask system also handles contact submissions, mutable project content, authenticated administration, database fallbacks, and more than one deployment entry point. The useful security question is therefore not whether the homepage renders. It is whether each kind of input and authority has a clear boundary.</p>
<h2>How is the boundary represented?</h2>
<p>Public project pages are served from a curated registry when the database does not provide projects. The application keeps administrative routes behind a session-based guard, validates contact input before saving it, and applies response headers to the public surface. The project registry also connects displayed claims to repository sources, tests, schemas, captures, or reports.</p>
<p>That separation makes the page easier to inspect. A visitor can read the public case study without receiving administrative authority, while an operator can change content through the admin workflow without changing the evidence contract used by the public renderer.</p>
<h2>What does this establish?</h2>
<p>It establishes an explicit application boundary and a testable content path. It does not establish that every deployment is production-ready or that every project is a production system. Those limits remain visible on the case-study pages, which is part of the design.</p>
""",
        "category": "Systems",
        "tags": ["Flask", "secure architecture", "portfolio engineering"],
        "status": "published",
        "featured": True,
        "views": 0,
        "reading_time": 4,
        "created_at": datetime(2026, 7, 28),
        "updated_at": datetime(2026, 7, 28),
        "published_at": datetime(2026, 7, 28),
        "source": "curated",
    },
    {
        "id": "curated-trustworthy-prototype-project-pages",
        "title": "What makes a prototype project page trustworthy?",
        "slug": "trustworthy-prototype-project-pages",
        "excerpt": "A practical evidence model for describing prototype systems without turning an implementation claim into a production claim.",
        "content": """
<h2>What should a project page prove?</h2>
<p>A prototype page should make its central question, scope, constraints, and evidence easy to find. A technology list is useful, but it cannot show whether the described behavior exists or whether the system crossed a boundary that the page does not mention.</p>
<h2>What evidence belongs on the page?</h2>
<p>The project registry used by this portfolio separates the system thesis from the problem, role, scope, constraints, architecture, trust boundaries, security decisions, implementation evidence, verified outcomes, and open hardening work. Each displayed claim is connected to a source such as a repository path, schema, test, capture, report, or terminal record.</p>
<p>This structure is intentionally conservative. A prototype can describe an approval-aware workflow, a research system can describe an ingestion and backtesting path, and an in-development platform can describe its controls without claiming customer scale, production status, or measured outcomes that the evidence does not support.</p>
<h2>Why does this help readers?</h2>
<p>Readers can distinguish intended behavior from observed behavior and identify what should be tested next. Search engines and answer systems also receive clearer entities, question-led explanations, and source boundaries instead of a page made only of broad marketing language.</p>
""",
        "category": "Security",
        "tags": ["evidence", "threat modeling", "case studies"],
        "status": "published",
        "featured": True,
        "views": 0,
        "reading_time": 4,
        "created_at": datetime(2026, 7, 27),
        "updated_at": datetime(2026, 7, 27),
        "published_at": datetime(2026, 7, 27),
        "source": "curated",
    },
]


def get_curated_field_notes():
    return deepcopy(CURATED_FIELD_NOTES)
