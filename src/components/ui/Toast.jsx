import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Transient confirmations.
 *
 * Half the controls in a portal do something the screen cannot show — an
 * invitation goes out, a reset email is sent, an endpoint starts receiving
 * events. Without a confirmation those read as broken buttons, which is the
 * single most common complaint about this kind of tool.
 */
const ToastContext = createContext({ notify: () => {} });

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(
    (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );

  const notify = useCallback(
    (message, { tone = 'positive', duration = 4000 } = {}) => {
      nextId += 1;
      const id = nextId;
      setToasts((current) => [...current, { id, message, tone }]);
      if (duration) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              aria-live="polite"
              aria-atomic="false"
              className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
            >
              {toasts.map((toast) => {
                const Icon = toast.tone === 'info' ? Info : Check;
                return (
                  <div
                    key={toast.id}
                    role="status"
                    className={cn(
                      'pointer-events-auto flex animate-cf-fade-up items-start gap-2 rounded-cf border bg-surface p-3 shadow-cf-pop',
                      'motion-reduce:animate-none',
                      toast.tone === 'info' ? 'border-line' : 'border-positive/40',
                    )}
                  >
                    <Icon
                      size={15}
                      aria-hidden="true"
                      className={cn(
                        'mt-px shrink-0',
                        toast.tone === 'info' ? 'text-ink-muted' : 'text-positive',
                      )}
                    />
                    <p className="min-w-0 flex-1 text-cf-body text-ink">{toast.message}</p>
                    <button
                      type="button"
                      onClick={() => dismiss(toast.id)}
                      aria-label="Dismiss"
                      className="shrink-0 rounded-cf p-0.5 text-ink-subtle transition hover:bg-surface-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
