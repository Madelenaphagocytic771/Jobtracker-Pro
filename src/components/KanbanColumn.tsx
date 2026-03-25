'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Job, JobStatus } from '@/types';
import { STATUS_CONFIG } from '@/types';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';

const COLUMN_STYLE: Record<JobStatus, { dot: string; header: string; body: string; accent: string }> = {
  wishlist:     { dot: 'bg-slate-400',   header: 'border-slate-200   dark:border-slate-700',  body: 'bg-slate-50/60   dark:bg-slate-900/40',  accent: 'bg-slate-400/10' },
  applied:      { dot: 'bg-sky-500',     header: 'border-sky-200     dark:border-sky-900',    body: 'bg-sky-50/60     dark:bg-sky-950/30',    accent: 'bg-sky-500/10' },
  assessment:   { dot: 'bg-blue-500',    header: 'border-blue-200    dark:border-blue-900',   body: 'bg-blue-50/60    dark:bg-blue-950/30',   accent: 'bg-blue-500/10' },
  interviewing: { dot: 'bg-purple-500',  header: 'border-purple-200  dark:border-purple-900', body: 'bg-purple-50/60  dark:bg-purple-950/30', accent: 'bg-purple-500/10' },
  hr_cross:     { dot: 'bg-amber-500',   header: 'border-amber-200   dark:border-amber-900',  body: 'bg-amber-50/60   dark:bg-amber-950/30',  accent: 'bg-amber-500/10' },
  offered:      { dot: 'bg-emerald-500', header: 'border-emerald-200 dark:border-emerald-900',body: 'bg-emerald-50/60 dark:bg-emerald-950/30',accent: 'bg-emerald-500/10' },
  rejected:     { dot: 'bg-red-400',     header: 'border-red-200     dark:border-red-900',    body: 'bg-red-50/40     dark:bg-red-950/20',    accent: 'bg-red-400/10' },
};

interface Props {
  status: JobStatus;
  jobs: Job[];
}

export function KanbanColumn({ status, jobs }: Props) {
  const config = STATUS_CONFIG[status];
  const style = COLUMN_STYLE[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={cn(
      'flex-shrink-0 w-64 rounded-xl flex flex-col border transition-all duration-150 overflow-hidden',
      style.body,
      isOver ? 'ring-2 ring-primary/60 shadow-lg scale-[1.01]' : 'shadow-sm hover:shadow-md'
    )}>
      {/* Colored top accent bar */}
      <div className={cn('h-0.5 w-full', style.accent.replace('/10', '/60'))} />
      <div className={cn('px-3 py-2.5 border-b flex items-center justify-between', style.header)}>
        <span className="font-semibold text-sm flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', style.dot)} />
          {config.label}
        </span>
        <span className={cn(
          'text-xs font-mono tabular-nums rounded-full px-2 py-0.5',
          jobs.length > 0 ? cn(style.accent, 'text-foreground font-semibold') : 'bg-muted text-muted-foreground'
        )}>
          {jobs.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 flex flex-col gap-2 min-h-[120px]">
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.length === 0 && (
            <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-border/40 min-h-[80px]">
              <p className="text-xs text-muted-foreground/40">拖到此处</p>
            </div>
          )}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
