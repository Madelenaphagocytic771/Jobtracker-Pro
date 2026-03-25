'use client';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify(toasts: Toast[]) {
  listeners.forEach(l => l([...toasts]));
}

export const toast = {
  success: (message: string) => add('success', message),
  error:   (message: string) => add('error',   message),
  info:    (message: string) => add('info',    message),
};

function add(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  notify(toasts);
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify(toasts);
  }, 3000);
}

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    listeners.push(setItems);
    return () => { listeners = listeners.filter(l => l !== setItems); };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify(toasts);
  }, []);

  if (!mounted) return null;

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    error:   <AlertCircle className="h-4 w-4 text-red-500" />,
    info:    <Info        className="h-4 w-4 text-blue-500" />,
  };

  return createPortal(
    <div id="toast-root">
      {items.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in',
            'bg-card/95 backdrop-blur-md text-card-foreground border-border'
          )}
        >
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
