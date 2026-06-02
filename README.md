# Bizce sizce

Civic polling web app for North Cyprus. Bilingual (Turkish + English), mobile-first.
Domain: bizcesizce.com

## Stack
- **Next.js** (App Router) — the website and screens
- **Supabase** (Postgres + Auth) — database, Google sign-in, trust rules
- **Vercel** — hosting and the bizcesizce.com domain

## Project layout (so far — Phase 1)
```
supabase/migrations/0001_initial_schema.sql   The whole database + trust rules
lib/constants.ts                              Fixed region/age/category lists
lib/supabase/client.ts                        Browser connection to Supabase
.env.example                                  Template for the secret settings
```

## The trust rules (enforced in the database, not just the app)
- One vote per person per topic — a unique constraint; votes are final, no edits/deletes.
- Regions and age bands can only be values from the fixed lists.
- Only one "daily question" can exist at a time.
- Individual votes are never readable; the app only ever sees aggregate totals
  (via the `topic_results` function). Identities/regions of voters stay private.

## Status
Phase 1 (skeleton & data) complete. Next: Phase 2 — Google sign-in + first-run setup.
