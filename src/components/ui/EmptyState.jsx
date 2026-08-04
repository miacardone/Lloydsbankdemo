import { cn } from '@/lib/cn';
import { Button } from './Button';

/** An empty screen is an invitation to act, so it always offers the next step. */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {Icon ? (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-lightest text-brand">
          <Icon size={20} aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-cf-body-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-cf-body text-ink-muted">{description}</p>
      ) : null}
      {actionLabel ? (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
