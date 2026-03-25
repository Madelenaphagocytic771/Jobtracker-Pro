'use client';
import { create } from 'zustand';
import type { Job, JobStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface JobStore {
  jobs: Job[];
  loading: boolean;
  selectedJobId: string | null;
  drawerOpen: boolean;
  searchQuery: string;

  loadJobs: () => Promise<void>;
  addJob: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  moveJob: (id: string, status: JobStatus) => Promise<void>;
  selectJob: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  exportData: () => string;
  importData: (json: string) => Promise<void>;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  loading: false,
  selectedJobId: null,
  drawerOpen: false,
  searchQuery: '',

  loadJobs: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to load');
      const jobs: Job[] = await res.json();
      set({ jobs, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addJob: async (data) => {
    const now = new Date().toISOString();
    const job: Job = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error('Failed to add job');
    await get().loadJobs();
  },

  updateJob: async (id, data) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update job');
    await get().loadJobs();
  },

  deleteJob: async (id) => {
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id), selectedJobId: null, drawerOpen: false }));
  },

  moveJob: async (id, status) => {
    await get().updateJob(id, { status });
  },

  selectJob: (id) => set({ selectedJobId: id }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  exportData: () => JSON.stringify(get().jobs, null, 2),

  importData: async (json) => {
    const jobs: Job[] = JSON.parse(json);
    for (const job of jobs) {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
    }
    await get().loadJobs();
  },
}));
