import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

let toastId = 0;
let listeners = [];

export function notify(message, type = 'info') {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, message, type }));
  return id;
}

export function toast.success(message) { return notify(message, 'success'); }
export function toast.error(message) { return notify(message, 'error'); }
export function toast.info(message) { return notify(message, 'info'); }

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter(fn => fn !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-success" />,
    error: <AlertCircle className="w-4 h-4 text-danger" />,
    info: <Info className="w-4 h-4 text-primary" />,
  };

  const borders = {
    success: 'border-success/30',
    error: 'border-danger/30',
    info: 'border-primary/30',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 bg-white border ${borders[toast.type]} shadow-lg rounded-lg px-4 py-3 animate-in slide-in-from-right`}
        >
          {icons[toast.type]}
          <p className="text-sm text-text-primary font-medium flex-1">{toast.message}</p>
          <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-secondary hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
