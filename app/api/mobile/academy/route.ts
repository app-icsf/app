import { NextRequest, NextResponse } from "next/server";
import { getAcademyHome } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const academy = await getAcademyHome(uid);
  return NextResponse.json({
    progressPct: academy.progressPct,
    nextModuleTitle: academy.nextModule?.title ?? null,
    enrollment: academy.enrollment
      ? {
          programTitle: academy.enrollment.program.title,
          modules: academy.enrollment.program.modules.map((module) => ({
            title: module.title,
            done: academy.enrollment!.moduleProgress.some((progress) => progress.moduleId === module.id && progress.status === "DONE"),
          })),
        }
      : null,
    openPrograms: academy.openPrograms.map((program) => ({ id: program.id, title: program.title, modules: program._count.modules })),
  });
}
