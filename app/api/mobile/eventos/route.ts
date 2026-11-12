import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const tab = req.nextUrl.searchParams.get("tab") ?? "proximos";
  const { upcoming, categories, rsvpMap, myChapterId } = await getEvents(uid);
  let events = upcoming;
  if (tab === "cerca") events = events.filter((event) => event.chapterId && event.chapterId === myChapterId);
  if (tab === "mios") events = events.filter((event) => rsvpMap.has(event.id));
  return NextResponse.json({
    categories: categories.map((category) => ({ key: category.key, name: category.name })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      category: event.category?.name ?? null,
      going: event.rsvps.filter((rsvp) => rsvp.status === "GOING").length,
      myRsvp: rsvpMap.get(event.id) ?? null,
    })),
  });
}
