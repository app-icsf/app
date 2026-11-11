import { createHmac, timingSafeEqual } from "crypto";

const MONTH = 30 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("Falta AUTH_SECRET");
  return value;
}

export function signMobileToken(uid: string) {
  const body = Buffer.from(JSON.stringify({ uid, exp: Date.now() + MONTH })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readMobileToken(header: string | null) {
  if (!header?.startsWith("Bearer ")) return null;
  const [body, sig] = header.slice(7).split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid?: string; exp?: number };
    if (!payload.uid || !payload.exp || payload.exp < Date.now()) return null;
    return payload.uid;
  } catch {
    return null;
  }
}
