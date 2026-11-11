import { NextRequest, NextResponse } from "next/server";
import { getMapPresence, getMyProfile } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const [cities, me] = await Promise.all([getMapPresence(), getMyProfile(uid)]);
  return NextResponse.json({
    cities,
    missingCity: !me.city,
    me: { city: me.city, country: me.country, region: me.region },
  });
}
