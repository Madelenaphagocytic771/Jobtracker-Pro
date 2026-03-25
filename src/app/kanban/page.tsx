'use client';
import { useEffect, useState, useMemo } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { AddJobDialog } from '@/components/AddJobDialog';
import { KanbanSkeleton } from '@/components/Skeleton';
import { toast } from '@/components/Toast';
import {
  DndContext, DragEndEvent, PointerSensor,
  useSensor, useSensors, DragOverlay, DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from '@/components/KanbanColumn';
import { JobCard } from '@/components/JobCard';
import { STATUS_ORDER, STATUS_CONFIG } from '@/types';
import type { Job, JobStatus } from '@/types';
import { useHasMounted } from '@/hooks/useHasMounted';
import { cn } from '@/lib/utils';

const ROW1: JobStatus[] = ['wishlist', 'applied', 'assessment', 'interviewing'];
const ROW2: JobStatus[] = ['hr_cross', 'offered', 'rejected'];

const FILTER_OPTIONS: { label: string; value: JobStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'interviewing' },
  { label: 'Offer', value: 'offered' },
  { label: '已归档', value: 'rejected' },
];

export default function KanbanPage() {
  const { jobs, loadJobs, moveJob, loading } = useJobStore();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [highlight, setHighlight] = useState<JobStatus | 'all'>('all');
  const mounted = useHasMounted();

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveJob(jobs.find((j) => j.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;
    const targetStatus = over.id as JobStatus;
    const job = jobs.find((j) => j.id === active.id);
    if (job && STATUS_ORDER.includes(targetStatus) && job.status !== targetStatus) {
      moveJob(job.id, targetStatus);
      toast.success(`已移至「${STATUS_CONFIG[targetStatus].label}」`);
    }
  }

  const visibleJobs = useMemo(() =>
    highlight === 'all' ? jobs : jobs.filter(j => j.status === highlight),
    [jobs, highlight]
  );

  const summaryStats = useMemo(() => ({
    active: jobs.filter(j => !['rejected', 'offered'].includes(j.status)).length,
    interviewing: jobs.filter(j => ['interviewing', 'hr_cross'].includes(j.status)).length,
    offered: jobs.filter(j => j.status === 'offered').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  }), [jobs]);

  if (!mounted || loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">投递看板</h1>
          <AddJobDialog />
        </div>
        <KanbanSkeleton />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">投递看板</h1>
          <AddJobDialog />
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">还没有投递记录</h2>
          <p className="text-muted-foreground mb-6">去寻找心仪的岗位，开始你的求职之旅吧！</p>
          <AddJobDialog />
        </div>
        <JobDetailDrawer />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">投递看板</h1>
          <p className="text-sm text-muted-foreground mt-0.5">共 {jobs.length} 条记录</p>
        </div>
        <AddJobDialog />
      </div>

      {/* Quick filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setHighlight(opt.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all border',
              highlight === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            )}
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span className="ml-1.5 tabular-nums">
                {jobs.filter(j => j.status === opt.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban — two rows in styled area */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-area space-y-3 animate-fade-in">
          {/* Row 1: 4 columns */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {ROW1.map((status) => (
              <div key={status} className="flex-shrink-0 w-64">
                <KanbanColumn
                  status={status}
                  jobs={visibleJobs.filter((j) => j.status === status)}
                />
              </div>
            ))}
          </div>
          {/* Row 2: 3 columns */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {ROW2.map((status) => (
              <div key={status} className="flex-shrink-0 w-64">
                <KanbanColumn
                  status={status}
                  jobs={visibleJobs.filter((j) => j.status === status)}
                />
              </div>
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.32,0.72,0,1)' }}>
          {activeJob ? <JobCard job={activeJob} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Summary stats bar */}
      <div className="rounded-xl border bg-card px-5 py-3 flex items-center gap-6 flex-wrap text-sm">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">摘要</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-muted-foreground">进行中</span>
          <span className="font-bold tabular-nums ml-1">{summaryStats.active}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">面试中</span>
          <span className="font-bold tabular-nums ml-1">{summaryStats.interviewing}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Offer</span>
          <span className="font-bold tabular-nums ml-1">{summaryStats.offered}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">已归档</span>
          <span className="font-bold tabular-nums ml-1">{summaryStats.rejected}</span>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          Offer 率 <strong className="text-foreground tabular-nums">
            {jobs.length > 0 ? ((summaryStats.offered / jobs.length) * 100).toFixed(1) : 0}%
          </strong>
        </div>
      </div>

      <JobDetailDrawer />
    </div>
  );
}

