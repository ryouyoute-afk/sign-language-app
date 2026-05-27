# SignAI — project memory

Real-time ASL recognition app. Backend: FastAPI + MediaPipe (`backend/`). Frontend: React + Vite (`frontend/`). See `README.md` for setup.

## Supabase Data API — public schema grants (action required)

Supabase is changing the default so that tables in the `public` schema are **no longer auto-exposed** to the Data API. Any new `public` table must receive an explicit `GRANT` before it is reachable via PostgREST, GraphQL, or `supabase-js`.

Rollout dates:
- **2026-05-30** — new default for all new projects.
- **2026-10-30** — enforced on new tables across all existing projects.

If/when this project adds Supabase, every table-creation migration in `public` must include the grants for the API roles. RLS policies still govern row access on top of these grants.

```sql
-- After CREATE TABLE public.<table> ...
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.<table> TO anon, authenticated, service_role;
-- If the table uses a serial/identity sequence:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
```

Before 2026-10-30, use the dashboard **Security Advisor** to review which tables are currently exposed to the Data API. Full SQL and migration guidance are in the Supabase changelog post linked from their May 2026 announcement.
