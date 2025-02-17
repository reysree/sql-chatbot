import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { dbName, query, values } = await req.json();

    if (!dbName || !query) {
      return NextResponse.json(
        { error: "Invalid database or query" },
        { status: 400 }
      );
    }

    // Get the correct Prisma client
    const prisma = getPrismaClient(dbName);

    // Execute query with Prisma
    const result = await prisma.$queryRawUnsafe(query, ...(values || []));

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
