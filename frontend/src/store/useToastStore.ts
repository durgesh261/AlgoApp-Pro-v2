import { create } from 'zustand';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: string;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (title, message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toISOString().substring(11, 19),
    };
    set((state) => ({ toasts: [newToast, ...state.toasts].slice(0, 5) }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));
