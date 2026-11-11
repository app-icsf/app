import { NextRequest, NextResponse } from "next/server";
import { getHomeFeed } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

function abs(origin: string, url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url, origin).toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const feed = await getHomeFeed(uid);
  const origin = req.nextUrl.origin;
  const { me, birthdayToday, newMember, publication, threads, event, myRsvp, suggestion, unreadNotifications, agenda, academy, memberCount, credential, unlockCount, goingCount } = feed;
  return NextResponse.json({
    me: {
      name: me.user.name,
      title: me.title,
      tier: me.tier?.name ?? null,
      slug: me.slug,
      avatarUrl: abs(origin, me.avatarUrl),
      city: me.city,
      country: me.country,
    },
    unreadNotifications,
    memberCount,
    goingCount,
    unlockCount,
    credential: credential ? { number: credential.number, title: credential.title, status: credential.status } : null,
    birthdayToday: birthdayToday
      ? { name: birthdayToday.user.name, slug: birthdayToday.slug, avatarUrl: abs(origin, birthdayToday.avatarUrl) }
      : null,
    newMember: newMember
      ? {
          name: newMember.name,
          slug: newMember.profile?.slug ?? null,
          city: newMember.profile?.city ?? null,
          avatarUrl: abs(origin, newMember.profile?.avatarUrl),
        }
      : null,
    publication: publication ? { title: publication.title, body: publication.body, authorName: publication.author.name } : null,
    threads: threads.map((thread) => ({
      id: thread.id,
      body: thread.body,
      repliesCount: thread._count.replies,
      authorName: thread.author.name,
      authorSlug: thread.author.profile?.slug ?? null,
      createdAt: thread.createdAt.toISOString(),
    })),
    event: event
      ? {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startsAt: event.startsAt.toISOString(),
          category: event.category?.name ?? null,
          rsvpCount: event.rsvps.length,
          myRsvp: !!myRsvp,
        }
      : null,
    agenda: agenda.map((item) => ({
      id: item.id,
      title: item.title,
      startsAt: item.startsAt.toISOString(),
      location: item.location,
      category: item.category?.name ?? null,
    })),
    academy: academy.enrollment
      ? {
          programTitle: academy.enrollment.program.title,
          progressPct: academy.progressPct,
          nextModuleTitle: academy.nextModule?.title ?? null,
        }
      : null,
    suggestion: suggestion
      ? {
          slug: suggestion.slug,
          name: suggestion.user.name,
          tier: suggestion.tier?.name ?? null,
          city: suggestion.city,
          country: suggestion.country,
          avatarUrl: abs(origin, suggestion.avatarUrl),
          topics: suggestion.topics.map((t) => t.topic.name),
        }
      : null,
  });
}
