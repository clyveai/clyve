import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { db } from "@/infrastructure/database/db";
import { user } from "@/infrastructure/database/db/schema";

async function getCurrentSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });
}

export async function DELETE() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db.delete(user).where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}

export const runtime = "nodejs";
