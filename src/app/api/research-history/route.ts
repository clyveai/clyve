import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { researchHistory } from "@/lib/db/schema";

async function getCurrentSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await db
      .select({
        id: researchHistory.id,
        title: researchHistory.title,
        query: researchHistory.query,
        createdAt: researchHistory.createdAt,
      })
      .from(researchHistory)
      .where(eq(researchHistory.userId, session.user.id))
      .orderBy(desc(researchHistory.createdAt))
      .limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching research history:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { query: string; title?: string };

    if (!body.query) {
      return NextResponse.json({ message: "Query is required" }, { status: 400 });
    }

    const title = body.title || body.query.substring(0, 100);

    const newEntry = await db
      .insert(researchHistory)
      .values({
        userId: session.user.id,
        query: body.query,
        title: title,
      })
      .returning({
        id: researchHistory.id,
        title: researchHistory.title,
        query: researchHistory.query,
        createdAt: researchHistory.createdAt,
      });

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error("Error creating research history entry:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
