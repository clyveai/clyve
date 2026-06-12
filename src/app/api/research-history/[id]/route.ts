import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { researchHistory } from "@/lib/db/schema";

async function getCurrentSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Next.js 16 asinkronus params resolution
    const { id } = await context.params;

    // Optimasi: Ambil data spesifik & jalankan verifikasi kepemilikan data sekaligus
    const [entry] = await db
      .select({ userId: researchHistory.userId })
      .from(researchHistory)
      .where(eq(researchHistory.id, id))
      .limit(1);

    if (!entry) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (entry.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Eksekusi penghapusan berbasis ID dan user ID terverifikasi
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