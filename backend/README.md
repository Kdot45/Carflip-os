# CarFlip OS — backend

Express + TypeScript + Prisma API. See [`../docs/README.md`](../docs/README.md)
for architecture, the full API reference, and environment variables.

```bash
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev             # http://localhost:4000
```
