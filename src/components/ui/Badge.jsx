import { cn } from '@/lib/cn';

const TONES = {
  neutral: 'bg-surface-sunken text-ink-muted ring-line',
  brand: 'bg-brand-lightest text-brand ring-brand-light/60',
  positive: 'bg-positive/10 text-positive ring-positive/25',
  negative: 'bg-negative/10 text-negative ring-negative/25',
  caution: 'bg-accent-soft text-[#8a5600] ring-accent/40',
  info: 'bg-brand-lightest text-brand-dark ring-brand-light/60',
};

export function Badge({ tone = 'neutral', children, className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5',
        'text-[0.6875rem] font-bold uppercase tracking-[0.04em] ring-1 ring-inset',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** Traffic-light dot for risk ratings. */
export function RiskDot({ level = 'low', className }) {
  const color = level === 'high' ? 'bg-negative' : level === 'medium' ? 'bg-accent' : 'bg-positive';
  const label = level === 'high' ? 'High risk' : level === 'medium' ? 'Medium risk' : 'Low risk';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Badge;
