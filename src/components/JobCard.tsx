'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '@/types';
import { STATUS_CONFIG } from '@/types';
import { useJobStore } from '@/store/useJobStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarClock } from 'lucide-react';

interface Props {
  job: Job;
  isDragging?: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  wishlist:     'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  applied:      'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  assessment:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  interviewing: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  hr_cross:     'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  offered:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rejected:     'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function JobCard({ job, isDragging }: Props) {
  const { selectJob, setDrawerOpen } = useJobStore();
  const {
    attributes, listeners, setNodeRef, transform, transition,
    isDragging: isSortDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 180ms cubic-bezier(0.32,0.72,0,1)',
  };

  if (isSortDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 h-[76px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => { selectJob(job.id); setDrawerOpen(true); }}
      className={cn(
        'bg-card rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-3 cursor-pointer select-none group',
        isDragging && 'rotate-2 shadow-xl scale-105 ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          {job.company.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{job.company}</p>
          <p className="text-xs text-muted-foreground truncate">{job.role}</p>
        </div>
      </div>
      {job.nextInterviewDate && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <CalendarClock className="h-3 w-3" />
          <span className="tabular-nums">{format(new Date(job.nextInterviewDate), 'M/d HH:mm', { locale: zhCN })}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">
          {format(new Date(job.updatedAt), 'M/d 更新', { locale: zhCN })}
        </span>
        <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', STATUS_BADGE[job.status])}>
          {STATUS_CONFIG[job.status].emoji}
        </span>
      </div>
    </div>
  );
}
