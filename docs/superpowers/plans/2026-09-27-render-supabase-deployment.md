# Render and Supabase Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Flask portfolio deploy as one Render web service backed by Supabase and integrate the changes into the GitHub repository.

**Architecture:** Render runs `app:app` through Gunicorn and checks `/healthz`. Runtime configuration selects Supabase and reads its server-side key and admin credentials from Render environment variables. A SQL file provisions the app tables with browser access revoked.

**Tech Stack:** Python, Flask, Gunicorn, Render Blueprints, Supabase Postgres.

## Global Constraints

- Keep the existing Flask app as one service; do not split frontend and backend.
- Do not add or run automated tests in this change.
- Do not put Supabase secret keys, admin passwords, or Flask signing secrets in the repository.
- Do not trigger a live deployment.
- Keep local MySQL support unless it conflicts with the Render/Supabase path.
- Stage only intended source, deployment, schema, and documentation changes; preserve unrelated local files.

---

### Task 1: Configure the Render runtime

**Files:** `render.yaml`, `requirements.txt`, `Procfile`, `app.py`, `config.py`

- [x] Declare a single Render web service, Gunicorn start command, health check, and required environment variables.
- [x] Add `/healthz`, trust one Render proxy, enable HTTPS cookies, and reject missing production settings.
- [x] Remove insecure built-in admin, signing, and MySQL password defaults.

### Task 2: Configure Supabase backend access

**Files:** `config.py`, `database_manager.py`, `.env.example`, `supabase/schema.sql`

- [x] Prefer `SUPABASE_SECRET_KEY`, then legacy service-role variable names.
- [x] Use the `apikey` header for current Supabase keys and keep legacy JWT compatibility.
- [x] Create all tables used by the app with RLS enabled and grants limited to `service_role`.
- [x] Provide a credential-free local environment template.

### Task 3: Remove Vercel wiring and refresh deployment documentation

**Files:** `api/index.py`, `api/health.py`, `api/test.py`, `api/requirements.txt`, `vercel_database_manager.py`, `rest_database_manager.py`, `database.py`, `models/project_model.py`, `models/blog_model.py`, `models/contact_model.py`, `content/projects.json`, `README.md`

- [x] Remove Vercel-only entry points and database selection.
- [x] Update the public project record so its sources and deployment claims match Render.
- [x] Document the Supabase schema and Render Blueprint setup.

### Task 4: Integrate the change with GitHub

**Files:** `.env.example`, `Procfile`, `README.md`, `api/health.py`, `api/index.py`, `api/requirements.txt`, `api/test.py`, `app.py`, `config.py`, `content/projects.json`, `database.py`, `database_manager.py`, `docs/superpowers/plans/2026-09-27-render-supabase-deployment.md`, `docs/superpowers/specs/2026-09-27-render-supabase-deployment-design.md`, `models/blog_model.py`, `models/contact_model.py`, `models/project_model.py`, `render.yaml`, `requirements.txt`, `rest_database_manager.py`, `supabase/schema.sql`, `vercel_database_manager.py`

- [x] Review the staged diff, ensuring `.env`, `design-reference/`, `output/`, and unrelated workspace deletions stay out.
- [ ] Commit and push the deployment changes to the feature branch.
- [ ] Do not merge into `main` or deploy production until the user reviews the resulting change.
