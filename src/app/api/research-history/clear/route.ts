import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { researchHistory } from "@/lib/db/schema";

async function getCurrentSession() {
    const requestHeaders = await headers();
    return auth.api.getSession({ headers: requestHeaders });
}

export async function POST() {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db
            .delete(researchHistory)
            .where(eq(researchHistory.userId, session.user.id));

        return NextResponse.json({
            success: true,
            deleted: result.length,
        });
    } catch (error) {
        console.error("Error clearing research history:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export const runtime = "nodejs";
