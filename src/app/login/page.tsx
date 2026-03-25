'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Briefcase, Eye, EyeOff, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FEATURES = [
  { icon: <BarChart3 className="h-4 w-4" />, text: '数据看板 · 漏斗分析' },
  { icon: <TrendingUp className="h-4 w-4" />, text: '拖拽看板 · 进度追踪' },
  { icon: <Calendar className="h-4 w-4" />, text: '日历提醒 · 不漏面试' },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError('邮箱或密码错误'); return; }
    router.replace('/');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? '注册失败'); setLoading(false); return; }
    const signInRes = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) { setError('注册成功，请登录'); setTab('login'); return; }
    router.replace('/');
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">JobTracker Pro</span>
          </div>
          <h2 className="text-3xl font-bold leading-snug mb-4">掌控你的<br />每一次求职</h2>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">从投递到 Offer，全程可视化追踪，让求职不再焦虑。</p>
        </div>
        <div className="relative space-y-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">{f.icon}</div>
              <span className="text-primary-foreground/80">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold">JobTracker Pro</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">{tab === 'login' ? '欢迎回来' : '创建账号'}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {tab === 'login' ? '登录你的账号，继续追踪求职进度' : '注册后即可开始追踪你的求职旅程'}
            </p>
          </div>

          <div className="flex rounded-xl bg-muted p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">姓名</label>
                <Input placeholder="你的名字" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">邮箱</label>
              <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted-foreground font-medium">密码</label>
                {tab === 'login' && <Link href="/forgot-password" className="text-xs text-primary hover:underline">忘记密码？</Link>}
              </div>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder={tab === 'register' ? '至少6位' : '请输入密码'}
                  value={password} onChange={e => setPassword(e.target.value)} required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'} className="pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full h-10 text-sm font-semibold" disabled={loading}>
              {loading ? '处理中...' : tab === 'login' ? '登录' : '注册并进入'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">数据安全加密存储 · 多设备同步</p>
        </div>
      </div>
    </div>
  );
}
