import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: '请填写邮箱和姓名' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email, name },
  });

  if (!user) {
    return NextResponse.json({ error: '邮箱或姓名不匹配，请检查后重试' }, { status: 404 });
  }

  // Invalidate previous tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  return NextResponse.json({ ok: true, token });
}
