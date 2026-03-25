'use client';
import { useState } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_ORDER, STATUS_CONFIG } from '@/types';
import type { JobStatus } from '@/types';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AddJobDialog() {
  const { addJob } = useJobStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company: '',
    role: '',
    department: '',
    status: 'applied' as JobStatus,
    applyDate: new Date().toISOString().split('T')[0],
    jdLink: '',
    referrer: '',
    channel: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company || !form.role) return;
    await addJob({
      ...form,
      applyDate: new Date(form.applyDate).toISOString(),
      events: [{ id: uuidv4(), type: 'applied', date: new Date(form.applyDate).toISOString(), note: '投递' }],
      reflections: '',
    });
    setOpen(false);
    setForm({ company: '', role: '', department: '', status: 'applied', applyDate: new Date().toISOString().split('T')[0], jdLink: '', referrer: '', channel: '' });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" />新增投递</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新增求职记录</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">公司 *</label>
              <Input placeholder="字节跳动" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">岗位 *</label>
              <Input placeholder="AI 产品经理" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">部门</label>
              <Input placeholder="大模型部门" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">当前状态</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as JobStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map(s => (
                    <SelectItem key={s} value={s}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">投递日期</label>
              <Input type="date" value={form.applyDate} onChange={e => setForm(f => ({ ...f, applyDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">投递渠道</label>
              <Input placeholder="官网/内推/Boss" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">内推人</label>
            <Input placeholder="内推人姓名" value={form.referrer} onChange={e => setForm(f => ({ ...f, referrer: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">JD 链接</label>
            <Input placeholder="https://..." value={form.jdLink} onChange={e => setForm(f => ({ ...f, jdLink: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit">添加</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
