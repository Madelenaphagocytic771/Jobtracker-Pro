'use client';
import { useEffect, useMemo, useState } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { AddJobDialog } from '@/components/AddJobDialog';
import { useHasMounted } from '@/hooks/useHasMounted';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Job, JobEvent } from '@/types';
import { cn } from '@/lib/utils';

interface CalEvent extends JobEvent { job: Job; }

const TYPE_COLOR: Record<string, string> = {
  interview:  'bg-purple-500 hover:bg-purple-600',
  assessment: 'bg-blue-500 hover:bg-blue-600',
  offer:      'bg-emerald-500 hover:bg-emerald-600',
};
const TYPE_LABEL: Record<string, string> = {
  interview: '面试', assessment: '笔试', offer: 'Offer',
};

export default function CalendarPage() {
  const { jobs, loadJobs, selectJob, setDrawerOpen } = useJobStore();
  const [current, setCurrent] = useState(new Date());
  const mounted = useHasMounted();

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const allEvents = useMemo((): CalEvent[] => {
    const fromEvents = jobs.flatMap(job =>
      job.events
        .filter(e => e.type === 'interview' || e.type === 'assessment' || e.type === 'offer')
        .map(e => ({ ...e, job }))
    );
    // Also include nextInterviewDate as a synthetic event if not already covered
    const fromNext: CalEvent[] = jobs
      .filter(job => job.nextInterviewDate)
      .map(job => ({
        id: `next_${job.id}`,
        type: 'interview' as const,
        date: job.nextInterviewDate!,
        note: '下次面试',
        job,
      }))
      .filter(ev => !fromEvents.some(e => e.job.id === ev.job.id && isSameDay(new Date(e.date), new Date(ev.date))));
    return [...fromEvents, ...fromNext];
  }, [jobs]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [current]);

  const eventsOnDay = (day: Date) =>
    allEvents.filter(e => isSameDay(new Date(e.date), day));

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">日历视图</h1>
          <AddJobDialog />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日历视图</h1>
        <AddJobDialog />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setCurrent(d => subMonths(d, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-[120px] text-center tabular-nums">
          {format(current, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrent(d => addMonths(d, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCurrent(new Date())}>今天</Button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {['一', '二', '三', '四', '五', '六', '日'].map(d => (
          <div key={d} className="py-1 text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-t rounded-xl overflow-hidden animate-fade-in">
        {days.map(day => {
          const dayEvents = eventsOnDay(day);
          const inMonth = isSameMonth(day, current);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[88px] border-r border-b p-1.5 flex flex-col gap-1 transition-colors',
                !inMonth && 'bg-muted/20',
                isToday(day) && 'bg-blue-50 dark:bg-blue-950/20'
              )}
            >
              <span className={cn(
                'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-start tabular-nums',
                isToday(day) && 'bg-primary text-primary-foreground',
                !inMonth && 'text-muted-foreground/50'
              )}>
                {format(day, 'd')}
              </span>
              {dayEvents.slice(0, 3).map(ev => (
                <button
                  key={ev.id}
                  onClick={() => { selectJob(ev.job.id); setDrawerOpen(true); }}
                  className={cn(
                    'text-left text-xs px-1.5 py-0.5 rounded text-white truncate w-full transition-colors',
                    TYPE_COLOR[ev.type] ?? 'bg-slate-500 hover:bg-slate-600'
                  )}
                  title={`${ev.job.company} ${ev.job.role} · ${TYPE_LABEL[ev.type] ?? ev.type}`}
                >
                  {ev.job.company} {TYPE_LABEL[ev.type] ?? ev.type}
                </button>
              ))}
              {dayEvents.length > 3 && (
                <span className="text-xs text-muted-foreground pl-1">+{dayEvents.length - 3} 更多</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        {[['bg-purple-500', '面试'], ['bg-blue-500', '笔试'], ['bg-emerald-500', 'Offer']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
      </div>

      <JobDetailDrawer />
    </div>
  );
}

