import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-border">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h4 className="text-base font-bold text-text-primary">{title}</h4>
          <button onClick={onCancel} className="p-1 text-secondary hover:bg-background rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-danger/10' : 'bg-warning/10'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-danger' : 'text-warning'}`} />
          </div>
          <p className="text-sm text-secondary leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-border hover:bg-background text-text-primary text-sm font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm ${
              danger
                ? 'bg-danger hover:bg-danger/90'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
