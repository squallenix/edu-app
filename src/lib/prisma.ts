import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";


const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const mariadbAdapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: mariadbAdapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}