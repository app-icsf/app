import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const [items, unread] = await Promise.all([getNotifications(uid), getUnreadNotificationCount(uid)]);
  return NextResponse.json({
    unread,
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      link: item.link,
      read: !!item.readAt,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
