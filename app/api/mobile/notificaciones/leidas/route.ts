import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearLocalCache } from "@/lib/local-cache";
import { readMobileToken } from "@/lib/mobile-token";

export async function POST(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  await db.notification.updateMany({ where: { userId: uid, readAt: null }, data: { readAt: new Date() } });
  clearLocalCache();
  return NextResponse.json({ ok: true, unread: 0 });
}
