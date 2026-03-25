'use client';
import { useJobStore } from '@/store/useJobStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_ORDER, STATUS_CONFIG } from '@/types';
import type { Job, JobStatus, JobEvent } from '@/types';
import { X, Trash2, Plus, ExternalLink, CheckCircle, Clock, FileText, Award, XCircle, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { toast } from '@/components/Toast';

const EVENT_ICON: Record<JobEvent['type'], React.ReactNode> = {
  applied:    <CheckCircle className="h-3.5 w-3.5" />,
  assessment: <FileText    className="h-3.5 w-3.5" />,
  interview:  <Clock       className="h-3.5 w-3.5" />,
  offer:      <Award       className="h-3.5 w-3.5" />,
  rejection:  <XCircle     className="h-3.5 w-3.5" />,
  other:      <HelpCircle  className="h-3.5 w-3.5" />,
};

const EVENT_COLOR: Record<JobEvent['type'], string> = {
  applied:    'bg-sky-500 text-white',
  assessment: 'bg-blue-500 text-white',
  interview:  'bg-purple-500 text-white',
  offer:      'bg-emerald-500 text-white',
  rejection:  'bg-red-500 text-white',
  other:      'bg-slate-400 text-white',
};

// Convert UTC ISO string to local datetime-local input value
function toLocalInput(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function JobDetailDrawer() {
  const { jobs, selectedJobId, drawerOpen, setDrawerOpen, selectJob, updateJob, deleteJob } = useJobStore();
  const job = jobs.find(j => j.id === selectedJobId);

  const [editMode, setEditMode] = useState(false);
  const [mdPreview, setMdPreview] = useState(true);
  const [form, setForm] = useState<Partial<Job>>({});

  useEffect(() => {
    if (job) setForm(job);
    setEditMode(false);
    setMdPreview(true);
  }, [job?.id]);

  if (!drawerOpen || !job) return null;

  async function handleSave() {
    if (!job) return;
    await updateJob(job.id, form);
    setEditMode(false);
    toast.success('已保存');
  }

  async function handleDelete() {
    if (!job || !confirm(`确认删除「${job.company} - ${job.role}」？`)) return;
    await deleteJob(job.id);
    toast.info('已删除');
  }

  function addEvent() {
    const events: JobEvent[] = [
      ...(form.events ?? job!.events),
      { id: uuidv4(), type: 'other', date: new Date().toISOString(), note: '' }
    ];
    setForm(f => ({ ...f, events }));
  }

  function updateEvent(idx: number, patch: Partial<JobEvent>) {
    const events = [...(form.events ?? job!.events)];
    events[idx] = { ...events[idx], ...patch };
    setForm(f => ({ ...f, events }));
  }

  function removeEvent(idx: number) {
    const events = [...(form.events ?? job!.events)].filter((_, i) => i !== idx);
    setForm(f => ({ ...f, events }));
  }

  const currentJob = editMode ? { ...job, ...form } : job;
  const displayEvents = (editMode ? form.events : job.events) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) { setDrawerOpen(false); selectJob(null); } }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDrawerOpen(false); selectJob(null); }} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-2xl h-full bg-background border-l shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold leading-tight">{job.company}</p>
              <p className="text-xs text-muted-foreground">{job.role}{job.department ? ` · ${job.department}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {editMode ? (
              <>
                <Button size="sm" onClick={handleSave}>保存</Button>
                <Button size="sm" variant="outline" onClick={() => { setForm(job); setEditMode(false); }}>取消</Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>编辑</Button>
            )}
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setDrawerOpen(false); selectJob(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-widest">基础信息</h3>
            {editMode ? (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs mb-1 block text-muted-foreground">公司</label><Input value={form.company ?? ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div><label className="text-xs mb-1 block text-muted-foreground">岗位</label><Input value={form.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
                <div><label className="text-xs mb-1 block text-muted-foreground">部门</label><Input value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
                <div>
                  <label className="text-xs mb-1 block text-muted-foreground">状态</label>
                  <Select value={form.status ?? job.status} onValueChange={v => setForm(f => ({ ...f, status: v as JobStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs mb-1 block text-muted-foreground">投递渠道</label><Input value={form.channel ?? ''} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} /></div>
                <div><label className="text-xs mb-1 block text-muted-foreground">内推人</label><Input value={form.referrer ?? ''} onChange={e => setForm(f => ({ ...f, referrer: e.target.value }))} /></div>
                <div className="col-span-2"><label className="text-xs mb-1 block text-muted-foreground">JD 链接</label><Input value={form.jdLink ?? ''} onChange={e => setForm(f => ({ ...f, jdLink: e.target.value }))} /></div>
                <div><label className="text-xs mb-1 block text-muted-foreground">下次面试时间</label><Input type="datetime-local" value={toLocalInput(form.nextInterviewDate)} onChange={e => setForm(f => ({ ...f, nextInterviewDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} /></div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div><dt className="text-xs text-muted-foreground mb-0.5">状态</dt><dd className="font-medium">{STATUS_CONFIG[job.status].emoji} {STATUS_CONFIG[job.status].label}</dd></div>
                <div><dt className="text-xs text-muted-foreground mb-0.5">投递日期</dt><dd className="tabular-nums">{format(new Date(job.applyDate), 'yyyy/M/d', { locale: zhCN })}</dd></div>
                {job.department && <div><dt className="text-xs text-muted-foreground mb-0.5">部门</dt><dd>{job.department}</dd></div>}
                {job.channel && <div><dt className="text-xs text-muted-foreground mb-0.5">渠道</dt><dd>{job.channel}</dd></div>}
                {job.referrer && <div><dt className="text-xs text-muted-foreground mb-0.5">内推人</dt><dd>{job.referrer}</dd></div>}
                {job.nextInterviewDate && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground mb-0.5">下次面试</dt>
                    <dd className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                      {format(new Date(job.nextInterviewDate), 'M月d日 HH:mm', { locale: zhCN })}
                    </dd>
                  </div>
                )}
                {job.jdLink && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground mb-0.5">JD</dt>
                    <dd><a href={job.jdLink} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 text-xs hover:underline"><ExternalLink className="h-3 w-3" />查看 JD</a></dd>
                  </div>
                )}
              </dl>
            )}
          </section>

          {/* Timeline */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">流转时间轴</h3>
              {editMode && <Button size="sm" variant="outline" onClick={addEvent}><Plus className="h-3 w-3 mr-1" />添加事件</Button>}
            </div>
            {displayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">暂无事件记录</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {displayEvents.map((ev, i) => (
                    <div key={ev.id} className="relative pl-9">
                      <div className={cn(
                        'absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center',
                        EVENT_COLOR[ev.type]
                      )}>
                        {EVENT_ICON[ev.type]}
                      </div>
                      {editMode ? (
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1.5">
                            <div className="flex gap-2">
                              <Select value={ev.type} onValueChange={v => updateEvent(i, { type: v as JobEvent['type'] })}>
                                <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="applied">投递</SelectItem>
                                  <SelectItem value="assessment">笔试</SelectItem>
                                  <SelectItem value="interview">面试</SelectItem>
                                  <SelectItem value="offer">Offer</SelectItem>
                                  <SelectItem value="rejection">拒绝</SelectItem>
                                  <SelectItem value="other">其他</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="datetime-local" className="h-7 text-xs flex-1" value={toLocalInput(ev.date)} onChange={e => updateEvent(i, { date: new Date(e.target.value).toISOString() })} />
                            </div>
                            <Input className="h-7 text-xs" placeholder="备注" value={ev.note} onChange={e => updateEvent(i, { note: e.target.value })} />
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => removeEvent(i)}><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <div className={cn(i === 0 && 'font-medium')}>
                          <p className="text-xs text-muted-foreground tabular-nums">{format(new Date(ev.date), 'yyyy/M/d HH:mm', { locale: zhCN })}</p>
                          <p className="text-sm">{ev.note || ev.type}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Reflections */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">面试复盘</h3>
              {editMode && (
                <Button size="sm" variant="ghost" onClick={() => setMdPreview(!mdPreview)}>
                  {mdPreview ? '切换编辑' : '切换预览'}
                </Button>
              )}
            </div>
            {editMode && !mdPreview ? (
              <Textarea
                className="font-mono text-sm min-h-[240px] resize-y"
                placeholder="## 面试复盘&#10;&#10;### 被问到的问题&#10;1. ...&#10;&#10;### 反思与改进&#10;- ..."
                value={form.reflections ?? ''}
                onChange={e => setForm(f => ({ ...f, reflections: e.target.value }))}
              />
            ) : (
              <div className="prose prose-sm max-w-none text-foreground">
                {currentJob.reflections ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentJob.reflections}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground text-sm italic">暂无复盘记录。点击「编辑」开始记录面试笔记...</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
