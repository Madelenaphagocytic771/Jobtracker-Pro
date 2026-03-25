import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Job } from '@/types';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const jobs: Job[] = rows.map((r: Record<string, unknown>) => ({
    ...r,
    department: (r.department as string | null) ?? undefined,
    jdLink: (r.jdLink as string | null) ?? undefined,
    referrer: (r.referrer as string | null) ?? undefined,
    channel: (r.channel as string | null) ?? undefined,
    nextInterviewDate: (r.nextInterviewDate as string | null) ?? undefined,
    status: r.status as Job['status'],
    events: JSON.parse(r.events as string),
  } as Job));

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: Job = await req.json();
  const row = await prisma.job.create({
    data: {
      id: body.id,
      userId: session.user.id,
      company: body.company,
      role: body.role,
      department: body.department ?? null,
      status: body.status,
      applyDate: body.applyDate,
      jdLink: body.jdLink ?? null,
      referrer: body.referrer ?? null,
      channel: body.channel ?? null,
      reflections: body.reflections ?? '',
      nextInterviewDate: body.nextInterviewDate ?? null,
      events: JSON.stringify(body.events ?? []),
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
    },
  });

  return NextResponse.json({ ...row, events: JSON.parse(row.events) }, { status: 201 });
}
