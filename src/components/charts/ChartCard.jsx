import { cn } from '@/lib/cn';

/**
 * Wrapper that gives every chart the same header, height and framing.
 * `note` is for the one sentence that explains what the reader should take away.
 */
export function ChartCard({ title, actions, note, height = 240, children, className }) {
  return (
    <section
      className={cn(
        'relative flex flex-col overflow-hidden rounded-cf border border-line bg-surface pt-[3px] shadow-cf',
        'before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand',
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h3 className="text-cf-body font-bold text-ink">{title}</h3>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div className="px-1 pb-2" style={{ height }}>
        {children}
      </div>
      {note ? (
        <p className="border-t border-line px-4 py-2 text-[0.75rem] text-ink-subtle">{note}</p>
      ) : null}
    </section>
  );
}

export default ChartCard;
