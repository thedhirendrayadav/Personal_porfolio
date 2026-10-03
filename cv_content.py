"""
Curated default CV content.

This is the single source of truth for the CV when the database has no saved
copy yet (fresh deployments, first boot before the admin saves an edit). The
/admin/cv editor reads and writes this same shape, and both the public /cv
page and the PDF download render from it.
"""
from copy import deepcopy


def default_cv_content():
    """Return the curated CV document. Always a fresh deep copy."""
    return deepcopy(_DEFAULT_CV)


_DEFAULT_CV = {
    "basics": {
        "name": "Dhirendra Yadav",
        "kicker": "Security fieldwork / Curriculum vitae",
        "role": "Software Developer | Cybersecurity | AI/ML Systems | Secure Automation",
        "tagline": "Open to collaboration and opportunities in cybersecurity engineering, AI/ML systems, and product engineering.",
        "email": "thedhirendrayadav@gmail.com",
        "phone": "+977 9845080167",
        "location": "Bhaktapur, Nepal",
        "site": "https://www.dhirendrayadav.site",
        "site_label": "dhirendrayadav.site",
        "linkedin": "https://www.linkedin.com/in/dhirendra-yadav-3b1387425",
        "linkedin_label": "linkedin.com/in/dhirendra-yadav-3b1387425",
        "github": "https://github.com/thedhirendrayadav",
        "github_label": "github.com/thedhirendrayadav",
        "summary": "Software Developer at Asha Tech (AashaTech Pvt. Ltd.) and BSc IT graduate based in Nepal. I build security-first platforms, intelligent automation, and practical AI systems across Python, web applications, APIs, data workflows, and deployment infrastructure. My approach connects threat awareness, useful product behavior, and evidence-led verification.",
        "availability": "Based in Bhaktapur, Nepal. Available for thoughtful collaboration and opportunities involving cybersecurity engineering, AI/ML systems, secure automation, and full-stack product engineering.",
        "evidence_note": "Portfolio projects are intentionally labeled as prototype, research system, or in development. The case studies separate implementation evidence from individual-role evidence and do not claim unsupported production metrics.",
        "footer_note": "This CV is maintained from the public portfolio and current professional profile.",
        "updated_label": "August 2026",
    },
    "skill_groups": [
        {"name": "Security", "entries": "Threat analysis, vulnerability assessment, network visibility, incident response, security automation"},
        {"name": "AI / ML", "entries": "Python, data preparation, applied machine learning, RAG, model integration"},
        {"name": "Engineering", "entries": "Flask, Django, REST APIs, JavaScript, HTML/CSS, SQL"},
        {"name": "Infrastructure", "entries": "Railway, Vercel, MySQL, Supabase, GitHub, environment configuration"},
        {"name": "Tools", "entries": "Nmap, Wireshark, Metasploit, Burp Suite, Git, Linux"},
    ],
    "principles": [
        {"title": "Understand the threat.", "detail": "Start with assets, users, incentives, and failure modes."},
        {"title": "Make the system legible.", "detail": "Clear boundaries and documentation reduce risk."},
        {"title": "Prove the outcome.", "detail": "Verify behavior with tests, evidence, and operating signals."},
    ],
    "experience": [
        {
            "title": "Software Developer (AI/ML & Python Specialist)",
            "org": "Asha Tech / AashaTech Pvt. Ltd. — Kathmandu, Nepal",
            "period": "Jan 2025 — Present",
            "bullets": [
                "Develop AI/ML-powered systems using Python, TensorFlow, and production web technologies.",
                "Build practical workflows across computer vision, natural-language processing, predictive analysis, and secure automation.",
                "Contribute to API, data, testing, and deployment practices that make delivery reliable and maintainable.",
            ],
        },
        {
            "title": "Frontend Manager & Administrator",
            "org": "ISMT College — Kathmandu, Nepal",
            "period": "Jan 2025 — May 2025",
            "bullets": [
                "Managed frontend delivery and coordinated web-application work.",
                "Supported college management systems and digital infrastructure.",
                "Improved responsive interfaces, usability, and website performance.",
            ],
        },
        {
            "title": "Freelance Full-Stack Developer",
            "org": "Self-employed",
            "period": "Mar 2024 — Sep 2025",
            "bullets": [
                "Delivered custom web applications, ERP systems, and AI-enabled operational tools.",
                "Worked across Django, Flask, React, Next.js, databases, and deployment workflows.",
                "Built practical systems for education, business operations, automation, and e-commerce.",
            ],
        },
        {
            "title": "Front Desk Officer",
            "org": "NepX Creation and Management Services — Kathmandu, Nepal",
            "period": "2021 — 2022",
            "bullets": [
                "Managed front-desk operations, student enquiries, and administrative coordination.",
                "Supported day-to-day communication across departments.",
            ],
        },
    ],
    "education": [
        {
            "degree": "BSc IT — University of Sunderland",
            "org": "ISMT College, Kathmandu",
            "period": "2022 — Present",
            "detail": "Foundations across programming, databases, networks, web systems, software delivery, cybersecurity, and intelligent systems.",
        },
    ],
    "projects": [
        {
            "title": "Secure Portfolio Platform",
            "status": "In development",
            "description": "Flask portfolio and content-management application with database fallbacks, contact protections, response headers, and public-page contract tests.",
            "tech": "Python / Flask / Jinja / MySQL / Supabase / Pytest",
        },
        {
            "title": "Multi-Channel AI Messaging Platform",
            "status": "Prototype",
            "description": "Messaging backend that separates channel adapters, authorization, conversation state, and asynchronous processing behind Redis-backed queues.",
            "tech": "TypeScript / Fastify / PostgreSQL / Prisma / Redis / BullMQ",
        },
        {
            "title": "NEPSE Market Intelligence",
            "status": "Research system",
            "description": "Research workflow connecting price ingestion, technical indicators, news sentiment, ensemble prediction, backtesting, an API, and a dashboard.",
            "tech": "Python / Pandas / XGBoost / TensorFlow / FastAPI / Streamlit",
        },
        {
            "title": "RunPod Media Orchestrator",
            "status": "Prototype",
            "description": "GPU workflow for operator-confirmed provisioning, prompt transfer, remote execution, output retrieval, and resource teardown.",
            "tech": "Python / RunPod GraphQL / Paramiko / SFTP / SCP",
        },
        {
            "title": "ERP and Staff Operations Concepts",
            "status": "Prototype",
            "description": "Role-aware operational concepts covering inventory, purchasing, reporting, staff profiles, leave, attendance context, and manager workflows.",
            "tech": "Flask / PostgreSQL / RBAC / Audit logging / Workflow design",
        },
    ],
    "toolkit": [
        {"name": "Languages", "entries": "Python, JavaScript, TypeScript, SQL, HTML/CSS"},
        {"name": "Application", "entries": "Flask, Django, FastAPI, REST APIs, Jinja, React, Next.js"},
        {"name": "Data and infrastructure", "entries": "MySQL, PostgreSQL, Supabase, Redis, Railway, Vercel, GitHub"},
        {"name": "Security and verification", "entries": "Threat modeling, vulnerability assessment, Nmap, Wireshark, Burp Suite, Metasploit, pytest, accessibility checks"},
    ],
}
