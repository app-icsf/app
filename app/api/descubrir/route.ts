import { NextRequest, NextResponse } from "next/server";
import { getDiscoverPage } from "@/lib/data";
import { requirePermission } from "@/lib/session";

export async function GET(req: NextRequest) {
  const me = await requirePermission("directory.read");
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");
  const page = await getDiscoverPage(me.id, q, Number.isFinite(offset) ? offset : 0);
  return NextResponse.json(page);
}
