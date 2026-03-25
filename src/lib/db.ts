import Dexie, { type Table } from 'dexie';
import type { Job } from '@/types';

export class JobTrackerDB extends Dexie {
  jobs!: Table<Job>;

  constructor(userId: string) {
    super(`JobTrackerDB_${userId}`);
    this.version(1).stores({
      jobs: 'id, company, role, status, applyDate, updatedAt, nextInterviewDate',
    });
  }
}

// Default DB for unauthenticated / legacy use
export let db = new JobTrackerDB('default');

export function switchDB(userId: string) {
  db = new JobTrackerDB(userId);
}
