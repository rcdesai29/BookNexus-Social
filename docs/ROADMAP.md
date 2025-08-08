# BookNexus-Social Roadmap

A phased plan blending a social Goodreads-style experience with a library-grade, verifiable reading ledger.

## Product direction

- Core: Social graph, feeds, reviews, and lists backed by an append-only, auditable reading ledger for verifiability.
- Public UX: Guest browsing for discovery; accounts unlock interaction and personalization.

## Architectural guardrails

- API first with OpenAPI, generated clients.
- Append-only events for reading activity; corrections via compensating events.
- Cache and queues via Redis when scale requires.
- Secure by default: JWT, role-gated admin/moderation, rate limits.

## Should we use Redis? Yes (phased)

- Why: Low-latency caching, WebSocket pub/sub, rate limiting, and feed fan-out.
- Initial uses:
  - Request-level cache for hot book details and lists.
  - Rate limiting counters (per IP/user).
  - WebSocket session registry and lightweight pub/sub.
- Later uses:
  - Denormalized feed caches and fan-out on write.
  - Background jobs (queues) for email and enrichment.
- Stack: Spring Data Redis + Redis (cloud managed preferred). Keep Redis optional in dev; fail open with in-memory fallbacks.

## Email delivery (beyond MailDev)

- Dev: Keep MailDev for local.
- Prod: Integrate a provider (SendGrid, SES, Mailgun). Add DKIM/SPF/DMARC guidance.
- Flows: Account activation, password reset, notification digests, loan reminders.
- API: Abstract EmailService behind provider adapter; keep templates server-side with localization.

## Guest browsing (unauthenticated UX)

- Public pages: Home, book list/detail, profile (limited), reviews (read-only), global feed (curated), search.
- Auth-gated actions: Follow, review/rate, comment, react, add to shelves, borrow/lend.
- Backend: Permit anonymous GET on public endpoints; keep POST/PUT/DELETE gated.
- Frontend: Ensure ProtectedRoute.tsx only guards mutation routes; show CTA to sign up.

## External book data (to prevent duplicates/fakes)

- Sources: Google Books API, Open Library, ISBNdb (optional paid).
- Strategy:
  - Prefer ingestion via search-and-select from providers.
  - Canonical key: ISBN-13 when present; fall back to provider ID.
  - DB: Unique index on isbn13 (nullable unique) + soft merge tool.
  - Enrichment: Covers, authors, subjects, descriptions; cache responses.
  - User-added books allowed but flagged for moderation and later merge.

## Feature list by phase

### Phase 0 — Stabilize foundations (1 sprint)

- Split current reviews into rating + review; add edit history.
- Book metadata enhancements: genres/tags, richer filters.
- Public/guest access for read-only pages and APIs.
- Production email provider wiring (env-switchable from MailDev).

### Phase 1 — Social core (2 sprints)

- Profiles: avatar, bio, social links, privacy.
- Follow system + follower/following lists.
- Feed (read model): started/finished/rated/reviewed.
- Comments and reactions on reviews and feed items.

### Phase 2 — Real-time + Redis baseline (1 sprint)

- WebSockets (STOMP) with JWT auth, per-user queues and /topic/feed.
- Persisted notifications + mark read; WS for instant delivery.
- Introduce Redis: rate limiting, WS session registry, small hot caches.

### Phase 3 — Verifiable reading ledger (2 sprints)

- Append-only reading_transaction events: ADDED_TO_SHELF, STARTED, PROGRESS_UPDATED, FINISHED, RATED, REVIEWED.
- Validated state transitions; compensating events for corrections.
- Verification artifacts: receipt/upload/ISBN proof; propagate verified badges.

### Phase 4 — Discovery and ingestion (1–2 sprints)

- External book search/import (Google/Open Library) with de-duplication.
- Shelves/collections (public/private) and shelf picker UX.
- Search: full-text for books and users (DB FTS to start).

### Phase 5 — Borrow/lend between users (1–2 sprints)

- Loan requests -> approve -> handover -> return; due reminders.
- Transactions emitted for each state; optional security settings (followers-only).

### Phase 6 — Trust, safety, and reputation (1 sprint)

- Reports and moderation queue; auto-thresholds to hide pending.
- Reputation score from verified actions and helpful votes; rate limit lifts.
- Privacy controls: private account, block/mute lists.

### Phase 7 — Scale and polish (ongoing)

- Redis feed fan-out on write; keyset pagination.
- Observability: tracing, metrics, audit log views.
- Performance passes, accessibility, and mobile polish.

## API and data model highlights

- New tables: profile, follow, activity, notification, reading_transaction, verification, shelf, shelf_item, comment, reaction, loan.
- Public GETs: /books, /books/{id}, /profiles/{username}, /reviews, /feed/global.
- WebSockets: /user/queue/notifications (private), /topic/feed (broadcast).
- Books: Unique constraint on isbn13; admin merge for dupes.

## Implementation notes

- Keep OpenAPI spec updated and auto-generate TS clients on CI.
- Use migrations for schema changes; include backfills for splits (rating vs review).
- Start Redis optional; feature-flag feed cache/fan-out before enabling in prod.
- Email provider is environment-driven; keep sandbox keys for staging.

## Suggested near-term plan (3 sprints)

- Sprint 1: Guest browsing + public API permissions, rating/review split, genres/tags, production email.
- Sprint 2: Profiles, follow, feed (read), comments/reactions, WebSockets + notifications.
- Sprint 3: Reading ledger MVP (start/finish/progress) + verified badges, basic external book import with de-dup.
