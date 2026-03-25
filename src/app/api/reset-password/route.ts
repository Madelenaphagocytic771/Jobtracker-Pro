import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.used || new Date() > reset.expiresAt) {
    return NextResponse.json({ error: '链接已失效或已使用，请重新申请' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: hashed },
  });

  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  });

  return NextResponse.json({ ok: true });
}
