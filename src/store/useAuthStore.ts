'use client';
import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // initials
  createdAt: string;
}

const STORAGE_KEY = 'jt_current_user';
const USERS_KEY = 'jt_users';

function loadUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
}

function saveUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
}

interface AuthStore {
  currentUser: UserProfile | null;
  users: UserProfile[];
  hydrated: boolean;

  hydrate: () => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  register: (name: string) => UserProfile;
  deleteUser: (id: string) => void;
  switchUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  users: [],
  hydrated: false,

  hydrate: () => {
    const currentUser = loadCurrentUser();
    const users = loadUsers();
    set({ currentUser, users, hydrated: true });
  },

  login: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ currentUser: user });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ currentUser: null });
  },

  register: (name) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const user: UserProfile = {
      id,
      name: name.trim(),
      avatar: name.trim().slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    const users = [...get().users, user];
    saveUsers(users);
    set({ users });
    return user;
  },

  deleteUser: (id) => {
    const users = get().users.filter(u => u.id !== id);
    saveUsers(users);
    // also remove user's job data
    localStorage.removeItem(`jt_jobs_${id}`);
    if (get().currentUser?.id === id) {
      localStorage.removeItem(STORAGE_KEY);
      set({ users, currentUser: null });
    } else {
      set({ users });
    }
  },

  switchUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ currentUser: user });
    // reload page to re-init DB with new user scope
    window.location.reload();
  },
}));
