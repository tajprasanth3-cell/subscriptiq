import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import clsx from 'clsx';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start justify-between gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200',
              isSuccess && 'bg-white border-emerald-200 text-slate-800',
              isWarning && 'bg-white border-amber-200 text-slate-800',
              isError && 'bg-white border-rose-200 text-slate-800',
              !isSuccess && !isWarning && !isError && 'bg-white border-indigo-200 text-slate-800'
            )}
          >
            <div className="flex items-start gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
              {isError && <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && (
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <p className="text-xs font-semibold leading-relaxed text-slate-800">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

