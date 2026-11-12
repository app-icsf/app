import { NextRequest, NextResponse } from "next/server";
import { getCredential } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const credential = await getCredential(uid);
  if (!credential) return NextResponse.json({ credential: null });
  return NextResponse.json({
    credential: {
      number: credential.number,
      title: credential.title,
      status: credential.status,
      name: credential.user.name,
      issuedAt: credential.issuedAt.toISOString(),
      expiresAt: credential.expiresAt?.toISOString() ?? null,
      signedByName: credential.signedByName,
      signedByRole: credential.signedByRole,
      verifyCode: credential.verifyCode,
      competencies: credential.competencies.map((item) => item.competency.name),
    },
  });
}
