import { cn } from '@/lib/cn';

/**
 * Every page opens the same way: what this is, then what you can do about it.
 * The rule beneath is the divider that separates the header from the work.
 */
export function PageHeader({ title, description, actions, children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 pb-2">
        <div className="min-w-0">
          <h1 className="font-display text-[1.75rem] leading-tight text-ink">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-cf-body text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="h-[2px] w-full bg-brand" />
      {children ? <div className="pt-3">{children}</div> : null}
    </div>
  );
}

export default PageHeader;
