import { PrismaClient as PrismaClientAI } from "../../prisma-ai/generated/client/ai";
import { PrismaClient as PrismaClientFest } from "../../prisma-fest/generated/client/fest";

// Initialize separate Prisma clients for each database
export const dbAI = new PrismaClientAI();
export const dbFest = new PrismaClientFest();

// Function to get the correct Prisma client based on db name
export function getPrismaClient(dbName) {
  if (dbName === "ai") return dbAI;
  if (dbName === "fest") return dbFest;
  throw new Error(`Invalid database name: ${dbName}`);
}
