# CarFlip OS — Architecture & Setup

## 1. Overview

CarFlip OS is a deal-evaluation tool for private-party used car buyers who
flip cars or run a small lot. The core loop is:

1. Paste in a listing (manually — no scraping, ever) and enter the basics:
   year/make/model, mileage, asking price, title status, ZIP.
2. Build a repair checklist — either by hand or with AI-assisted triage from
   the listing text, OBD-II codes, and described symptoms — and get a
   low/expected/worst repair cost range.
3. See a suggested max bid and expected profit, colored good/marginal/bad,
   before you ever talk numbers with the seller.
4. Track the deal through lead → bought → repairing → listed → sold, with
   notes, receipts, and a task checklist along the way.

AI in this app is advisory only. Every AI response — triage suggestions and
chat replies alike — carries this disclaimer in the UI:

> This is an estimate only and not a certified mechanical or legal opinion.
> Always consult a professional mechanic and check title history before
> buying.

## 2. Architecture

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────┐
│  frontend            │ ─────────────────────────▶ │  backend              │
│  Next.js (App Router)│ ◀───────────────────────── │  Express + TypeScript │
│  TypeScript + Tailwind│                            │  Prisma ORM           │
└─────────────────────┘                             └──────────┬───────────┘
                                                                 │
                                                     ┌───────────▼───────────┐
                                                     │  Postgres              │
                                                     │  (local, or Supabase)  │
                                                     └────────────────────────┘
```

- **Frontend** (`/frontend`): Next.js App Router, plain Tailwind components
  (no generated component library, to keep the dependency surface small).
  Auth state lives in a React context backed by `localStorage` (JWT bearer
  token). All screens are mobile-first: single-column at 375px, expanding to
  multi-column grids on larger viewports. The project detail page adds a
  sticky bottom action bar on mobile showing the suggested max bid at a
  glance while you scroll.
- **Backend** (`/backend`): Express + TypeScript REST API. Auth is email +
  password with bcrypt hashing and JWT bearer tokens (no sessions/cookies).
  All business logic — repair totals, max-bid/profit math — lives in pure,
  unit-testable functions in `src/lib/calculations.ts`, kept separate from
  the Express routes and Prisma models.
- **Database**: Postgres via Prisma. The schema (`backend/prisma/schema.prisma`)
  works against a local Postgres instance for development and against
  Supabase Postgres unchanged — Supabase is just Postgres plus hosting, so no
  schema changes are needed to move from one to the other. Prisma Migrate
  manages schema changes either way.
- **File storage**: `backend/src/lib/storage.ts` is a minimal local-folder
  stand-in for S3-compatible object storage. It exposes exactly two
  functions (`saveFile`, `fileUrl`), so swapping in a real S3/R2/Supabase
  Storage client later is a one-file change — nothing else in the app knows
  or cares how storage works underneath.
- **AI**: `backend/src/lib/ai.ts` wraps the Anthropic Claude API for two
  advisory features — triage and chat (see §6). If `ANTHROPIC_API_KEY` isn't
  set, both endpoints return a clearly-labeled mock response instead of
  failing, so the rest of the app stays usable without an AI subscription.

## 3. Running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL to a local Postgres instance (or Supabase),
# and JWT_SECRET to a long random string (openssl rand -hex 32).
npm install
npx prisma migrate dev --name init
npm run dev
```

The API listens on `http://localhost:4000` by default. `GET /health` is a
no-auth liveness check.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app listens on `http://localhost:3000` and expects the API at
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

### Moving to Supabase

Supabase's Postgres connection string (Project Settings → Database →
Connection string → URI) drops straight into `DATABASE_URL` — no schema
changes needed. For file storage, swap `backend/src/lib/storage.ts` for
Supabase Storage's client SDK when you're ready to deploy; the local-folder
version is dev-only.

## 4. Environment variables

### `backend/.env`

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (local or Supabase). |
| `JWT_SECRET` | Signs auth tokens. Generate with `openssl rand -hex 32`. |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`). |
| `PORT` | API port (default `4000`). |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins. |
| `ANTHROPIC_API_KEY` | Optional. Enables live AI triage/chat via Claude. Unset = mock responses. |
| `ANTHROPIC_MODEL` | Claude model id for AI calls (default `claude-sonnet-4-5`). |
| `UPLOAD_DIR` | Local folder used as the storage stub (default `./uploads`). |

### `frontend/.env.local`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. |

## 5. Data model

All entities below map 1:1 to `backend/prisma/schema.prisma`. Money fields
are `Decimal` in Postgres and are serialized to plain numbers over the API
(see `backend/src/routes/serializers.ts`).

- **User** — email/password auth, profile (name, home ZIP, flipper/dealer
  role), and per-user defaults (`defaultLaborRateMechanical`,
  `defaultLaborRateBody`, `defaultContingencyPct`, `defaultMarginPct`) used
  to pre-fill new deals.
- **Project** — one vehicle deal: status (`lead` → `bought` → `repairing` →
  `listed` → `sold` / `abandoned`), vehicle details, asking/purchase price,
  title status, ZIP, listing URL (reference only), listing notes, and the
  deal-economics fields (`expectedResalePrice`, `sellingCosts`,
  `targetProfitAmount`, `targetMarginPct`) that drive the max-bid
  calculation.
- **ProjectPhoto** — an uploaded photo with a `type`
  (exterior/engine/dash/tires/underside/other).
- **ObdReading** — a raw OBD-II code dump pasted in for a project; a project
  can have several over time as more scans come in.
- **RepairEstimate** — one repair-cost workspace for a project (a project can
  have more than one over time — e.g. a revision after an in-person
  inspection). Holds the rolled-up totals (`partsTotal`, `laborTotal`,
  `diagnosticsTotal`, `consumablesTotal`, `feesTotal`, `contingencyTotal`)
  and the low/expected/worst range plus `suggestedMaxBid`.
- **RepairLineItem** — one line on the checklist: category, title,
  description, severity (safety/required/cosmetic), parts cost, labor hours
  × rate, and a DIY-ok flag.
- **Receipt** — actual money spent on a project: amount, description, date,
  optional photo.
- **ChecklistItem** — a free-form task with a done flag and sort order.
- **AiRun** — a log of AI triage/chat calls (input/output summaries) for
  auditability; not shown directly in the UI.

### Calculation assumptions

These are deliberate, documented choices (in
`backend/src/lib/calculations.ts`) rather than hidden magic numbers:

- **Repair cost range**: `total_low` is the identified-work subtotal with no
  contingency buffer (best case — nothing beyond the checklist turns up).
  `total_expected` adds one contingency buffer
  (`contingency_pct` × subtotal). `total_worst` doubles that buffer. This is
  a heuristic sanity range, not a statistical model.
- **Max bid**: `total_expected_cost = (purchase_price ?? asking_price) +
  total_expected_repair + selling_costs`. The suggested max bid solves for
  either `target_profit_amount` or `target_margin_pct` (margin = profit ÷
  expected resale price); if both are set, the **lower** (more conservative)
  resulting bid wins.
- **Deal label**: `good` if margin at asking price ≥ target margin,
  `marginal` if it's at least half the target, `bad` otherwise, `unknown`
  until an expected resale price is entered.

### A note on scope decisions

A couple of places where the spec's UI language and its data model didn't
line up 1:1 — resolved in favor of the data model, and called out here so
they're not a surprise:

- **"Notes" (free text) on a project** maps to the `Project.listingNotesText`
  field already in the schema, rather than a separate list-of-notes entity
  (none exists in the data model). The project page's Notes section edits
  this field directly.
- **"Dashboard" and "Projects"** in the nav are the same screen. Per the
  product scope, the dashboard *is* the project board (list + filter + sort
  by status/profit/date), so a separate "Projects" link would just duplicate
  it — the global nav has Dashboard, New Deal, and Settings.

## 6. API reference

All routes except `/health`, `/auth/signup`, and `/auth/login` require
`Authorization: Bearer <token>`.

```
POST   /auth/signup
POST   /auth/login
GET    /auth/me
PATCH  /auth/me                       # profile + defaults (Settings page)

GET    /projects                      # ?status=&sort=created_at|profit|asking_price&order=
POST   /projects
GET    /projects/:id                  # full detail: photos, obd, estimates, receipts, checklist
PATCH  /projects/:id
DELETE /projects/:id
POST   /projects/:id/obd

POST   /projects/:id/estimate         # create/start
GET    /projects/:id/estimate         # latest, recalculated on read
PATCH  /projects/:id/estimate         # diagnostics/consumables/fees/contingency%
POST   /estimates/:id/line-items
PATCH  /line-items/:id
DELETE /line-items/:id

POST   /projects/:id/receipts
PATCH  /receipts/:id
DELETE /receipts/:id

POST   /projects/:id/checklist
PATCH  /checklist/:id
DELETE /checklist/:id

POST   /projects/:id/photos           # multipart/form-data: photo, type
DELETE /photos/:id

POST   /projects/:id/ai/triage        # { symptoms? } -> risk level, OBD explanation, suggested line items
POST   /projects/:id/ai/chat          # { messages: [{role, content}] } -> advisory reply
```

Every mutation that touches a repair line item, an estimate's manual fields,
or a project's deal economics (asking/purchase price, resale price, selling
costs, target margin/profit) returns the freshly recalculated `estimate` and
`maxBid` in the same response, so the frontend never has to guess when to
refetch.

## 7. AI integration notes

- **Triage** (`POST /projects/:id/ai/triage`): pulls the project's listing
  notes and latest OBD reading, combines them with any freeform symptoms
  passed in, and asks Claude for a structured JSON response — risk level,
  a plain-language summary, an OBD explanation, and a list of suggested
  repair line items. The frontend can add all suggested items to the repair
  estimate with one tap.
- **Chat** (`POST /projects/:id/ai/chat`): a freeform advisory conversation
  scoped to the same project context (vehicle, listing notes, OBD codes).
- Both endpoints log a redacted input/output summary to `AiRun` for
  auditability, and both return unset unless `ANTHROPIC_API_KEY` is
  configured — without it, they return a clearly-labeled mock response so
  the surrounding app (line items, checklist, etc.) is still fully usable in
  a demo or CI environment with no AI subscription.
- The disclaimer text is returned by the API alongside every AI response
  (not hardcoded twice) and rendered by `components/ui/AiDisclaimer.tsx`
  under both the triage results panel and the chat thread.

## 8. Deployment

**Backend → Render.** `render.yaml` at the repo root is a Render Blueprint:
it provisions a free Postgres database (`carflip-os-db`) and the API as a
web service (`carflip-os-backend`) together, in one step.

1. In the Render dashboard: **New → Blueprint**, pick this repo. Render
   reads `render.yaml` and shows a plan for both resources.
2. It'll prompt for `ANTHROPIC_API_KEY` (marked `sync: false` — never
   committed) — paste it in, or leave blank and set it later under the
   service's **Environment** tab. Without it, AI endpoints fall back to the
   mock response (see §7); nothing else breaks.
3. `JWT_SECRET` is auto-generated by Render (`generateValue: true`).
   `DATABASE_URL` is wired automatically from the provisioned database
   (`fromDatabase`) — you never touch either by hand.
4. The start command runs `prisma migrate deploy` before booting the
   server, so the schema is applied automatically on first deploy and kept
   in sync on every deploy after.
5. **Known limitation**: no persistent disk is attached, so uploaded photos
   are lost on every redeploy/restart (Render's ephemeral filesystem). Fine
   for evaluating the deal-scoring flow; before this holds real user photos,
   either attach a Render persistent disk (a few dollars/month, still not
   real object storage) or swap `backend/src/lib/storage.ts` for S3/Supabase
   Storage — see the note in §2 on why that's a one-file change.

**Frontend → Vercel.** Import the repo, set **Root Directory** to
`frontend` (no `vercel.json` needed — Next.js is auto-detected), and set
`NEXT_PUBLIC_API_URL` to the Render service's public URL
(`https://carflip-os-backend.onrender.com` or whatever Render assigns).

**Last step, both directions**: once you know the real Vercel URL, update
`CORS_ORIGIN` on the Render service to that exact origin (not a wildcard —
the API is called with an `Authorization` header, and the CORS middleware
sets `credentials: true`, which browsers reject when paired with a
wildcard origin). Render redeploys automatically on env var changes.
