import { cn } from '@/lib/cn';

/** Horizontal tabs with an underline in the brand colour. */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex gap-1 border-b border-line', className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative -mb-px border-b-2 px-3 py-2 text-cf-body font-semibold transition',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              active
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="ml-1.5 text-[0.75rem] font-normal text-ink-subtle">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
