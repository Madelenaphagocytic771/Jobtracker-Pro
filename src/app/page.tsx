'use client';
import { useEffect, useMemo } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { STATUS_CONFIG, STATUS_ORDER } from '@/types';
import type { JobStatus } from '@/types';
import { AddJobDialog } from '@/components/AddJobDialog';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { DashboardSkeleton } from '@/components/Skeleton';
import { useHasMounted } from '@/hooks/useHasMounted';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarClock, TrendingUp, Briefcase, Trophy, Users, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const FUNNEL_STATUSES: JobStatus[] = ['applied', 'assessment', 'interviewing', 'hr_cross', 'offered'];
const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#22c55e'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-xl text-sm">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-bold text-foreground tabular-nums">{p.value}</span> 条
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { jobs, loadJobs, selectJob, setDrawerOpen, loading } = useJobStore();
  const mounted = useHasMounted();

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const withInterview = jobs.filter(j => ['interviewing', 'hr_cross', 'offered'].includes(j.status)).length;
    const offered = jobs.filter(j => j.status === 'offered').length;
    const interviewRate = total > 0 ? ((withInterview / total) * 100).toFixed(1) : '0';
    const offerRate = total > 0 ? ((offered / total) * 100).toFixed(1) : '0';
    return { total, withInterview, offered, interviewRate, offerRate };
  }, [jobs]);

  const funnelData = useMemo(() =>
    FUNNEL_STATUSES.map((s, i) => ({
      name: STATUS_CONFIG[s].label,
      value: jobs.filter(j => j.status === s).length,
      color: FUNNEL_COLORS[i],
      status: s,
    })),
    [jobs]
  );

  const statusBarData = useMemo(() =>
    STATUS_ORDER.map(s => ({
      name: STATUS_CONFIG[s].label,
      count: jobs.filter(j => j.status === s).length,
      fill: s === 'offered' ? '#22c55e' : s === 'rejected' ? '#ef4444'
        : s === 'interviewing' ? '#a855f7' : s === 'hr_cross' ? '#f97316'
        : s === 'assessment' ? '#3b82f6' : s === 'applied' ? '#0ea5e9' : '#94a3b8',
    })),
    [jobs]
  );

  const upcomingEvents = useMemo(() => {
    const now = startOfDay(new Date());
    const cutoff = addDays(now, 7);
    return jobs
      .flatMap(j => j.events.map(e => ({ ...e, job: j })))
      .filter(e => {
        const d = new Date(e.date);
        return (e.type === 'interview' || e.type === 'assessment')
          && isAfter(d, now) && isBefore(d, cutoff);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [jobs]);

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">数据看板</h1>
          <AddJobDialog />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const metrics = [
    { label: '总投递数', value: stats.total, icon: <Briefcase className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: '进入面试', value: stats.withInterview, icon: <Users className="h-5 w-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: '面试率', value: stats.interviewRate + '%', icon: <TrendingUp className="h-5 w-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Offer 转化率', value: stats.offerRate + '%', icon: <Trophy className="h-5 w-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  const maxFunnel = Math.max(...funnelData.map(d => d.value), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">数据看板</h1>
          <p className="text-sm text-muted-foreground mt-0.5">追踪你的求职全链路数据</p>
        </div>
        <AddJobDialog />
      </div>

      {upcomingEvents.length > 0 && (
        <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/80 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 p-4">
          <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
            <CalendarClock className="h-4 w-4" />
            未来 7 天待办
            <span className="ml-auto text-xs font-normal bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full tabular-nums">
              {upcomingEvents.length} 项
            </span>
          </h2>
          <div className="space-y-1">
            {upcomingEvents.map(ev => (
              <button key={ev.id}
                onClick={() => { selectJob(ev.job.id); setDrawerOpen(true); }}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors group"
              >
                <span className="text-xs font-mono tabular-nums text-amber-600 dark:text-amber-400 w-20 flex-shrink-0">
                  {format(new Date(ev.date), 'M/d HH:mm', { locale: zhCN })}
                </span>
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{ev.job.company}</span>
                <span className="text-sm text-muted-foreground truncate flex-1">{ev.job.role}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                  ev.type === 'interview'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                )}>
                  {ev.type === 'interview' ? '面试' : '笔试'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={cn(
            'rounded-2xl border p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 bg-card',
            m.border
          )}>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', m.bg, m.color)}>
              {m.icon}
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="h-10 w-10 text-primary/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">还没有数据</h2>
          <p className="text-muted-foreground mb-6">添加你的第一条投递记录，开始追踪求职进度！</p>
          <AddJobDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">各阶段分布</h2>
            <p className="text-xs text-muted-foreground mb-4">各状态下的投递数量</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusBarData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={68} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {statusBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">求职进度阶梯</h2>
            <p className="text-xs text-muted-foreground mb-5">各关键阶段人数及转化率</p>
            <div className="space-y-2">
              {funnelData.map((d, i) => {
                const pct = maxFunnel > 0 ? (d.value / maxFunnel) * 100 : 0;
                const prev = funnelData[i - 1];
                const conv = prev && prev.value > 0
                  ? ((d.value / prev.value) * 100).toFixed(0) + '%'
                  : null;
                return (
                  <div key={d.status}>
                    {conv && (
                      <div className="flex items-center gap-1 pl-20 mb-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/50 tabular-nums">转化 {conv}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0 text-right">{d.name}</span>
                      <div className="flex-1 bg-muted/40 rounded-full h-7 overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center px-3 transition-all duration-700"
                          style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: d.color + 'cc' }}
                        >
                          {pct > 25 && (
                            <span className="text-white text-xs font-bold tabular-nums">{d.value}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold tabular-nums w-5 text-right">{d.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <JobDetailDrawer />
    </div>
  );
}
