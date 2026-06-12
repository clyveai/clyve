import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { researchHistory } from "@/lib/db/schema";

async function getCurrentSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Verify the entry belongs to the current user
    const entry = await db
      .select({ userId: researchHistory.userId })
      .from(researchHistory)
      .where(eq(researchHistory.id, id))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (entry[0].userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(researchHistory)
      .where(
        and(
          eq(researchHistory.id, id),
          eq(researchHistory.userId, session.user.id),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting research history entry:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
