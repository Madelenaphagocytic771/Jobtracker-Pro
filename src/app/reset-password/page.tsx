'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('无效的重置链接');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('两次密码不一致'); return; }
    setError(''); setLoading(true);
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? '重置失败'); return; }
    setDone(true);
    setTimeout(() => router.replace('/login'), 2000);
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-5">
      {done ? (
        <div className="text-center py-4 space-y-3">
          <div className="text-4xl">✅</div>
          <p className="font-semibold">密码重置成功</p>
          <p className="text-sm text-muted-foreground">正在跳转到登录页...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">新密码</label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                placeholder="至少6位"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">确认新密码</label>
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="再次输入密码"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? '重置中...' : '确认重置密码'}
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />返回登录
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">重置密码</h1>
          <p className="text-muted-foreground text-sm mt-1">设置你的新密码</p>
        </div>
        <Suspense fallback={<div className="rounded-2xl border bg-card p-5 text-center text-sm text-muted-foreground">加载中...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
