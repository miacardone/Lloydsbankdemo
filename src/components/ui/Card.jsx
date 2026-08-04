import { cn } from '@/lib/cn';

/**
 * The panel every screen is built from. The blue rule along the top edge is the
 * one consistent piece of chrome across the portal — it separates
 * panels without needing heavy borders.
 */
export function Card({ children, className, rule = true, padded = true, ...rest }) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-cf border border-line bg-surface shadow-cf',
        rule && 'before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand',
        rule && 'pt-[3px]',
        className,
      )}
      {...rest}
    >
      <div className={cn(padded && 'p-4')}>{children}</div>
    </section>
  );
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-cf-body-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-cf-body text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export default Card;
