import { PrismaClient } from "@prisma/client";

// Reuse a single client across hot reloads in dev so we don't exhaust
// Postgres connections.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
