'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? '验证失败'); return; }
    setResetToken(data.token);
    setStep('reset');
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setError('两次密码不一致'); return; }
    setError(''); setLoading(true);
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, password: newPw }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? '重置失败'); return; }
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">找回密码</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 'verify' ? '通过邮箱和姓名验证身份' : '设置新密码'}
          </p>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-5">
          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">注册邮箱</label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">注册时的姓名</label>
                <Input placeholder="你的姓名" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '验证中...' : '下一步'}
              </Button>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />返回登录
              </Link>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">新密码（至少6位）</label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} placeholder="新密码" value={newPw} onChange={e => setNewPw(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">确认新密码</label>
                <Input type={showPw ? 'text' : 'password'} placeholder="再次输入" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '重置中...' : '确认重置密码'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
