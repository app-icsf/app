import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) return new NextResponse("Not found", { status: 404 });
  const dt = event.startsAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ICSF//Eventos//ES",
    "BEGIN:VEVENT",
    `UID:${event.id}@icsf`,
    `DTSTAMP:${dt}`,
    `DTSTART:${dt}`,
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    event.location ? `LOCATION:${event.location}` : "",
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
