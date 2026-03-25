'use client';
import { useRef, useState } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, Trash2, KeyRound, Eye, EyeOff, Shield, Database, Info } from 'lucide-react';
import { toast } from '@/components/Toast';
import { cn } from '@/lib/utils';

function Section({ icon, title, description, danger, children }: {
  icon: React.ReactNode; title: string; description?: string;
  danger?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'rounded-2xl border p-6 space-y-4 transition-shadow hover:shadow-sm',
      danger ? 'border-destructive/30 bg-destructive/5' : 'bg-card'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          danger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
        )}>
          {icon}
        </div>
        <div>
          <h2 className={cn('font-semibold', danger && 'text-destructive')}>{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { exportData, importData, jobs, deleteJob } = useJobStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobtracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importData(text);
      toast.success(`成功导入 ${JSON.parse(text).length ?? '若干'} 条数据`);
    } catch {
      toast.error('导入失败，请检查 JSON 格式');
    }
    e.target.value = '';
  }

  async function handleClearAll() {
    if (!confirm(`确认删除全部 ${jobs.length} 条记录？此操作不可恢复。`)) return;
    for (const job of jobs) await deleteJob(job.id);
    toast.info('已清空所有数据');
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('两次新密码不一致'); return; }
    if (newPw.length < 6) { toast.error('新密码至少6位'); return; }
    setPwLoading(true);
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) { toast.error(data.error ?? '修改失败'); return; }
    toast.success('密码已修改');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理账号安全与数据备份</p>
      </div>

      <Section icon={<KeyRound className="h-4 w-4" />} title="修改密码" description="建议定期更换密码以保障账号安全">
        <form onSubmit={handleChangePw} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">当前密码</label>
              <Input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">新密码（至少6位）</label>
                <Input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} required autoComplete="new-password" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">确认新密码</label>
                <Input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required autoComplete="new-password" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPw ? '隐藏密码' : '显示密码'}
            </button>
            <Button type="submit" size="sm" disabled={pwLoading}>{pwLoading ? '修改中...' : '确认修改'}</Button>
          </div>
        </form>
      </Section>

      <Section icon={<Database className="h-4 w-4" />} title="数据备份与迁移"
        description={`当前共 ${jobs.length} 条记录。导出 JSON 文件可用于备份或跨设备迁移。`}>
        <div className="flex gap-3">
          <Button onClick={handleExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />导出 JSON
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />从 JSON 导入
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </Section>

      <Section icon={<Shield className="h-4 w-4" />} title="关于" >
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between py-1 border-b border-border/50">
            <span>应用名称</span><span className="font-medium text-foreground">JobTracker Pro</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border/50">
            <span>数据存储</span><span className="font-medium text-foreground">服务端 SQLite</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>密码加密</span><span className="font-medium text-foreground">bcrypt</span>
          </div>
        </div>
      </Section>

      <Section icon={<Trash2 className="h-4 w-4" />} title="危险操作" description="删除全部数据，此操作不可恢复。建议先导出备份。" danger>
        <Button variant="destructive" onClick={handleClearAll} disabled={jobs.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />清空所有数据（{jobs.length} 条）
        </Button>
      </Section>
    </div>
  );
}
