export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'assessment'
  | 'interviewing'
  | 'hr_cross'
  | 'offered'
  | 'rejected';

export interface JobEvent {
  id: string;
  type: 'applied' | 'assessment' | 'interview' | 'offer' | 'rejection' | 'other';
  date: string; // ISO string
  note: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  department?: string;
  status: JobStatus;
  applyDate: string; // ISO string
  jdLink?: string;
  referrer?: string;
  channel?: string;
  events: JobEvent[];
  reflections: string; // Markdown
  nextInterviewDate?: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<JobStatus, { label: string; emoji: string; color: string }> = {
  wishlist:     { label: '意向池',       emoji: '🌟', color: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' },
  applied:      { label: '已投递',       emoji: '📤', color: 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700' },
  assessment:   { label: '笔试/测评',    emoji: '📝', color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700' },
  interviewing: { label: '业务面试',     emoji: '🗣️', color: 'bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-700' },
  hr_cross:     { label: 'HR/交叉面',   emoji: '🤝', color: 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700' },
  offered:      { label: 'Offer',        emoji: '🏆', color: 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' },
  rejected:     { label: '归档/终止',    emoji: '❌', color: 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700' },
};

export const STATUS_ORDER: JobStatus[] = [
  'wishlist', 'applied', 'assessment', 'interviewing', 'hr_cross', 'offered', 'rejected'
];
