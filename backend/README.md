# Waypoint ML/LLM Service

The ML/recommendation/LLM half of the learning-path app. This service does
**not** handle signup, login, or passwords — that's the Java backend's job.
This service only verifies the JWT Java issues, then owns everything after
that: learner profiling, path generation, explanations, progress, and
feedback-driven adaptation.

## Architecture

```
Frontend  →  Java backend (auth, issues JWT)
                    │
                    ▼  (JWT passed through)
          This service (FastAPI, verifies JWT, never issues one)
                    │
       ┌────────────┼─────────────┐
       ▼            ▼             ▼
  PostgreSQL   Anthropic API   Rule-based
  (profiles,   (chat NLU,      recommender
   paths,       explanations,   (prerequisite-
   progress,    grounded Q&A)   aware ordering)
   feedback)
```

Two things must match exactly on both sides for auth to work — see
**Integration checklist** below.

## Setup

### 1. Start Postgres

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with the credentials already in
`.env.example`. If you'd rather use a hosted instance (Supabase, Neon,
Render), just point `DATABASE_URL` at that instead — no code changes needed.

### 2. Install dependencies

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Then fill in:
- `JWT_SECRET` — must be the **exact** secret the Java service signs with
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com

### 4. Run

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs. Tables are
created automatically on startup — no separate migration step for this
prototype.

## Integration checklist (confirm with the Java side)

1. **JWT claim name for user id.** `app/security.py` checks `userId`,
   `user_id`, then `sub`, in that order. If Java puts the id somewhere
   else, add that key to `USER_ID_CLAIMS` in `app/security.py`.
2. **Secret encoding.** If Java signs with
   `Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))`, set
   `JWT_SECRET_IS_BASE64=true` in `.env` — otherwise verification will
   fail against a correct secret because the raw bytes won't match.
3. **Algorithm.** Defaults to `HS256`. Change `JWT_ALGORITHM` if Java
   uses something else (e.g. RS256 with a public/private key pair —
   ask before assuming HS256 if you're not sure which one your friend used).
4. **CORS.** `app/main.py` currently allows all origins for development.
   Lock `allow_origins` down to your actual frontend/Java origins before
   deploying anywhere public.

The quickest way to confirm 1–3: have Java print a decoded token's claims
once, or generate one manually and hit `/profile` with it — a 401 means
one of the three is mismatched.

## API summary

| Route | Method | Purpose |
|---|---|---|
| `/profile` | GET | Current learner profile (auto-created empty on first call) |
| `/chat/message` | POST | Send free text; LLM extracts profile fields, returns guide reply |
| `/chat/history` | GET | Full chat log for the learner |
| `/recommendations/generate` | POST | Build a new active path from the current profile |
| `/recommendations/path` | GET | Fetch the active path with per-course progress status |
| `/recommendations/explain/{course_id}` | POST | Grounded LLM answer to a question about one course |
| `/progress/update` | POST | Mark a course `not_started` / `in_progress` / `completed` |
| `/progress/dashboard` | GET | Percent complete, hours remaining, skill radar data, next 3 actions |
| `/feedback` | POST | Submit `too_easy` / `just_right` / `too_hard`; regenerates the remaining path |

All routes except `/health` require `Authorization: Bearer <jwt>`.

## Where the ML/LLM actually happens

- **`app/recommender.py`** — deterministic core. Topological sort over a
  course/prerequisite DAG, difficulty filtering by experience level,
  skill-gap scoring for the dashboard. This stays rule-based on purpose:
  prerequisite ordering should be reliable, not something an LLM might
  get subtly wrong.
- **`app/llm.py`** — the Claude API layer, three calls:
  - `extract_profile()` — turns one free-text message into structured
    fields (domain, level, interests, hours) via forced tool use, instead
    of a rigid multi-step form.
  - `generate_explanation()` — natural-language "why this course",
    grounded in real profile + course fields (available but not wired
    into `/recommendations/generate` by default — the rule-based reason
    is used there for speed/cost; swap it in if you want every
    recommendation LLM-phrased).
  - `answer_question()` — grounded Q&A behind `/recommendations/explain`,
    given real context pulled from Postgres, not model memory.

**If you get a labeled dataset of learner-course interactions**, the
natural next step is a trained collaborative-filtering or embedding-
similarity model that replaces `generate_path()` in `recommender.py`,
without touching any route — that function's return shape is the
contract the rest of the service depends on.

## Testing without a live Anthropic key

`app/llm.py` functions can be monkeypatched in tests:

```python
from unittest.mock import patch
with patch("app.routes.chat.extract_profile", return_value={...}):
    ...
```

This is how the route logic itself was verified during development —
useful if you want to test the DB/routing layer before your API key is
set up.
