import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkAccess, loadPermissions } from "@/lib/access";
import { signMobileToken } from "@/lib/mobile-token";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Escribe correo y contraseña." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }
  const access = await checkAccess(user.email);
  if (!access.ok) return NextResponse.json({ error: "Esta cuenta no tiene acceso." }, { status: 403 });
  const perms = await loadPermissions(user.id);
  if (!perms.includes("directory.read")) return NextResponse.json({ error: "Esta cuenta no puede entrar a la app." }, { status: 403 });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.json({
    token: signMobileToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  });
}
