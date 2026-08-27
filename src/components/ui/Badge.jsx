import { Tooltip } from './Tooltip';
import { glossaryHint } from '@/data/glossary';
import { cn } from '@/lib/cn';

const TONES = {
  neutral: 'bg-surface-sunken text-ink-muted ring-line',
  brand: 'bg-brand-lightest text-brand ring-brand-light/60',
  positive: 'bg-positive/10 text-positive ring-positive/25',
  negative: 'bg-negative/10 text-negative ring-negative/25',
  caution: 'bg-accent-soft text-[#8a5600] ring-accent/40',
  info: 'bg-brand-lightest text-brand-dark ring-brand-light/60',
};

/**
 * A badge is usually one or two words of jargon standing in for a paragraph —
 * "Pre-arbitration", "RDR", "1st Cycle". `hint` spells it out on hover; when it
 * is omitted the badge text is looked up in the glossary, so most of them
 * explain themselves without the caller doing anything.
 */
/* Badges are often an icon plus a word. Pull the words out so the glossary
   lookup still fires — otherwise exactly the badges that need explaining (the
   ones terse enough to need an icon) are the ones that miss out. */
function textOf(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('').trim();
  return '';
}

export function Badge({ tone = 'neutral', children, className, dot = false, hint }) {
  const label = hint ?? glossaryHint(textOf(children));

  const badge = (
    <span
      tabIndex={label ? 0 : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5',
        'text-[0.6875rem] font-bold uppercase tracking-[0.04em] ring-1 ring-inset',
        label &&
          'cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );

  return label ? <Tooltip label={label}>{badge}</Tooltip> : badge;
}

/** Traffic-light dot for risk ratings. */
export function RiskDot({ level = 'low', className, hint }) {
  const color = level === 'high' ? 'bg-negative' : level === 'medium' ? 'bg-accent' : 'bg-positive';
  const label = level === 'high' ? 'High risk' : level === 'medium' ? 'Medium risk' : 'Low risk';

  return (
    <Tooltip label={hint ?? label}>
      <span tabIndex={0} className={cn('inline-flex cursor-help items-center gap-2', className)}>
        <span className={cn('h-2.5 w-2.5 rounded-full', color)} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    </Tooltip>
  );
}

export default Badge;
