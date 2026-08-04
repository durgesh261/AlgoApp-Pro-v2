import React from 'react';
import { useToastStore, ToastType } from '../../store/useToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-[#00C896] shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />;
    case 'danger':
      return <AlertOctagon className="w-4 h-4 text-[#F6465D] shrink-0" />;
    case 'info':
    default:
      return <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />;
  }
};

const getToastBorder = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-[#00C896]/40 bg-[#00C896]/10';
    case 'warning':
      return 'border-[#F59E0B]/40 bg-[#F59E0B]/10';
    case 'danger':
      return 'border-[#F6465D]/40 bg-[#F6465D]/10';
    case 'info':
    default:
      return 'border-[#3B82F6]/40 bg-[#3B82F6]/10';
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start justify-between p-3 rounded-lg border backdrop-blur-md shadow-2xl font-mono text-xs ${getToastBorder(
              toast.type
            )}`}
          >
            <div className="flex items-start space-x-2.5">
              {getToastIcon(toast.type)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#F8FAFC]">{toast.title}</span>
                  <span className="text-[10px] text-[#94A3B8]">{toast.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
