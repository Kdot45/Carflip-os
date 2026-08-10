# CarFlip OS

CarFlip OS helps individual car flippers and small dealers evaluate private-party
deals, estimate repair costs, and protect their profit **before** they buy —
not after.

You bring the listing (paste the text, upload photos, type in the numbers).
CarFlip OS never scrapes Facebook Marketplace, Craigslist, OfferUp, or any
other site — there's no scraper and no unofficial API integration anywhere in
this codebase. Any AI assistance is advisory only: it never claims to be a
certified mechanical, legal, or financial opinion.

```
/frontend   Next.js (App Router) + TypeScript + Tailwind — the web app
/backend    Express + TypeScript + Prisma — the API
/docs       Architecture, setup, environment variables, data model
```

See [`docs/README.md`](./docs/README.md) for the full architecture writeup,
local setup instructions, environment variables, and data model reference.

## Quick start

```bash
# Backend
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

## License

Private project — no license granted for reuse.
