# Render and Supabase Deployment Design

## Goal

Prepare this Flask portfolio for one Render web service backed by Supabase and remove Vercel-specific runtime setup.

## Architecture

Render runs the existing Flask app as a Python web service with Gunicorn. Flask continues serving templates, static assets, and app routes. Render injects the Supabase URL and a server-side secret key, while a checked-in SQL schema creates the tables the app uses. GitHub remains the source repository and Render's linked branch can deploy commits automatically.

## Components

- `render.yaml` defines the web service, health endpoint, Gunicorn command, Supabase database selection, and required environment variables.
- `requirements.txt` includes Gunicorn.
- Flask reads credentials from environment variables and has no usable default admin or production signing credentials.
- Supabase configuration prefers a backend secret key and retains legacy variable names.
- `supabase/schema.sql` creates the app tables with RLS enabled and access restricted to the server-side service role.
- README instructions describe GitHub-to-Render setup, required variables, and the one-time Supabase SQL setup.
- Vercel entry points and manager selection are removed. Local MySQL support remains available.

## Operational behavior

Render checks `/healthz`. The app trusts the Render proxy headers for HTTPS-aware URL and security behavior, and enables secure cookies on Render. If required Render settings are absent, startup fails with a clear configuration error.

## Out of scope

- Creating or changing Render/Supabase accounts, projects, credentials, custom domains, or GitHub app permissions.
- Triggering a live production deployment.
- Rewriting the data layer or changing the portfolio UI.

## Acceptance

- A Render Blueprint defines a single Flask web service using Gunicorn and `/healthz`.
- Supabase credentials are required on Render and stay server-side.
- The SQL setup covers tables used by the app and grants no direct browser access.
- Vercel runtime entry points and deployment instructions are removed.
- README explains how to connect this GitHub repo to Render and configure Supabase.
