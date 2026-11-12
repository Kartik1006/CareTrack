import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
let openDialogs = 0;
let priorBodyOverflow = '';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  icon,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openDialogs++ === 0) { priorBodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]') ?? []).filter(el => el.getAttribute('aria-hidden') !== 'true');
    focusables()[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;
      if (e.key === 'Escape') {
        e.stopImmediatePropagation(); e.preventDefault(); closeRef.current();
      }
      if (e.key === 'Tab') {
        const elements = focusables(); const first = elements[0]; const last = elements[elements.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      if (--openDialogs === 0) document.body.style.overflow = priorBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          ref={dialogRef}
          className={`relative flex flex-col max-h-[calc(100dvh-32px)] overflow-hidden rounded-2xl bg-white text-left shadow-2xl w-full ${maxWidthStyles[maxWidth]} border border-slate-200`}
          role="dialog" aria-modal="true" aria-label={title}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-4 bg-slate-50/60">
            <div className="flex items-center gap-3">
              {icon && <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">{icon}</div>}
              <div>
                <h3 className="text-base font-semibold leading-6 text-slate-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
              </div>
            </div>
            <button
              aria-label="Close dialog" type="button"
              onClick={onClose}
              className="rounded-lg p-2 shrink-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-5 min-h-0 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

