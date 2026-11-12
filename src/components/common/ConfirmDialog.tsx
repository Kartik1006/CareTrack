import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const icons = {
    danger: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    primary: <Info className="w-5 h-5 text-teal-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  };

  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm" icon={icons[variant]}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${confirmBtnStyles[variant]}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

