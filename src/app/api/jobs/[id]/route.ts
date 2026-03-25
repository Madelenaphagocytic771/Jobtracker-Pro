import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Job } from '@/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body: Partial<Job> = await req.json();

  const existing = await prisma.job.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.job.update({
    where: { id },
    data: {
      company: body.company ?? existing.company,
      role: body.role ?? existing.role,
      department: body.department ?? existing.department,
      status: body.status ?? existing.status,
      applyDate: body.applyDate ?? existing.applyDate,
      jdLink: body.jdLink ?? existing.jdLink,
      referrer: body.referrer ?? existing.referrer,
      channel: body.channel ?? existing.channel,
      reflections: body.reflections ?? existing.reflections,
      nextInterviewDate: body.nextInterviewDate ?? existing.nextInterviewDate,
      events: body.events !== undefined ? JSON.stringify(body.events) : existing.events,
      updatedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ...updated, events: JSON.parse(updated.events) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.job.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
