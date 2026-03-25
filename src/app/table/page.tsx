'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { STATUS_CONFIG, STATUS_ORDER } from '@/types';
import type { Job, JobStatus } from '@/types';
import { AddJobDialog } from '@/components/AddJobDialog';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { TableSkeleton } from '@/components/Skeleton';
import { useHasMounted } from '@/hooks/useHasMounted';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'company' | 'role' | 'status' | 'applyDate' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const STATUS_BADGE: Record<string, string> = {
  wishlist:     'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  applied:      'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  assessment:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  interviewing: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  hr_cross:     'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  offered:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected:     'bg-red-500/10 text-red-600 dark:text-red-400',
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

export default function TablePage() {
  const { jobs, loadJobs, selectJob, setDrawerOpen, loading } = useJobStore();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const mounted = useHasMounted();

  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('table-search')?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs
      .filter(j => statusFilter === 'all' || j.status === statusFilter)
      .filter(j =>
        !q ||
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.department ?? '').toLowerCase().includes(q) ||
        (j.channel ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let av = a[sortKey] as string;
        let bv = b[sortKey] as string;
        if (sortKey === 'status') { av = STATUS_ORDER.indexOf(a.status).toString(); bv = STATUS_ORDER.indexOf(b.status).toString(); }
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [jobs, query, sortKey, sortDir, statusFilter]);

  const Th = useCallback(({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">{label}<SortIcon active={sortKey === k} dir={sortDir} /></span>
    </th>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [sortKey, sortDir]);

  if (!mounted || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">投递列表</h1>
          <AddJobDialog />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">投递列表</h1>
          <p className="text-sm text-muted-foreground mt-0.5">共 {filtered.length} / {jobs.length} 条</p>
        </div>
        <AddJobDialog />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="table-search"
            className="pl-8 pr-8"
            placeholder="搜索公司、岗位… (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="absolute right-2.5 top-2.5" onClick={() => setQuery('')}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>全部</Button>
          {STATUS_ORDER.map(s => (
            <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>
              {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
            </Button>
          ))}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">还没有投递记录</h2>
          <p className="text-muted-foreground mb-6">去寻找心仪的岗位，开始你的求职之旅吧！</p>
          <AddJobDialog />
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 sticky top-0">
              <tr>
                <Th label="公司" k="company" />
                <Th label="岗位" k="role" />
                <Th label="状态" k="status" />
                <Th label="投递日期" k="applyDate" />
                <Th label="最近更新" k="updatedAt" />
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">渠道</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">没有匹配的记录</td></tr>
              )}
              {filtered.map((job, i) => (
                <tr
                  key={job.id}
                  className={cn(
                    'border-b last:border-0 cursor-pointer transition-colors',
                    i % 2 === 0 ? 'bg-background hover:bg-muted/40' : 'bg-muted/10 hover:bg-muted/40'
                  )}
                  onClick={() => { selectJob(job.id); setDrawerOpen(true); }}
                >
                  <td className="px-3 py-2.5 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]" title={job.company}>{job.company}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-sm truncate max-w-[160px]" title={job.role}>{job.role}</div>
                    {job.department && <div className="text-xs text-muted-foreground">{job.department}</div>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[job.status])}>
                      {STATUS_CONFIG[job.status].emoji} {STATUS_CONFIG[job.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                    {format(new Date(job.applyDate), 'yyyy/M/d', { locale: zhCN })}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                    {format(new Date(job.updatedAt), 'M/d HH:mm', { locale: zhCN })}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{job.channel ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <JobDetailDrawer />
    </div>
  );
}
