import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onDismiss, duration = 2800 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const icon = type === 'success' ? <CheckCircle2 size={18} color="var(--success)" />
              : type === 'error'  ? <AlertCircle  size={18} color="var(--danger)" />
              :                     <Info          size={18} color="var(--accent)" />;

  return (
    <div className="toast">
      {icon}
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

// ── Toast manager hook ────────────────────────────────────────

interface ToastState { message: string; type: ToastType; id: number }

let toastId = 0;
let globalSetToast: React.Dispatch<React.SetStateAction<ToastState | null>> | null = null;

export function useToast() {
  const show = (message: string, type: ToastType = 'success') => {
    globalSetToast?.({ message, type, id: ++toastId });
  };
  return { show };
}

export function ToastProvider() {
  const [toast, setToast] = useState<ToastState | null>(null);
  globalSetToast = setToast;
  if (!toast) return null;
  return <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />;
}
