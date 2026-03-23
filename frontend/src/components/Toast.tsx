import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  exiting?: boolean;
}

let toastId = 0;
let addToastFn: ((type: ToastItem['type'], message: string) => void) | null = null;

export function showToast(type: ToastItem['type'], message: string) {
  addToastFn?.(type, message);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const borderColor = (type: ToastItem['type']) => {
    switch (type) {
      case 'success': return 'border-l-[#10B981]';
      case 'error': return 'border-l-[#EF4444]';
      case 'info': return 'border-l-[#2563EB]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} bg-bg-surface border border-border ${borderColor(toast.type)} border-l-[3px] rounded-btn px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[380px]`}
        >
          <span className="text-sm text-text-primary flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-text-secondary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
