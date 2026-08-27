import { Link } from 'react-router-dom';
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Explain, Tooltip } from './Tooltip';
import { glossaryHint } from '@/data/glossary';
import { cn } from '@/lib/cn';

/**
 * The KPI tile. `direction` says which way is good — a falling dispute rate is
 * a win, a falling win rate is not — so the color never lies about the number.
 */
export function StatCard({
  label,
  value,
  caption,
  delta,
  direction = 'up-is-good',
  icon: Icon,
  to,
  hint,
  className,
}) {
  /* A tile label like "Effective rate" or "CTR" is jargon to anyone who has not
     read the schemes' fee documentation. Say what it means on hover. */
  const tip = hint ?? glossaryHint(label);
  const hasDelta = typeof delta === 'number' && delta !== 0;
  const rising = delta > 0;
  const good = direction === 'up-is-good' ? rising : !rising;
  const TrendIcon = rising ? TrendingUp : TrendingDown;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Tooltip label={tip}>
            <p
              className={cn(
                'text-cf-label uppercase text-ink-subtle',
                tip && 'w-fit cursor-help underline decoration-dotted underline-offset-2',
              )}
            >
              {label}
            </p>
          </Tooltip>
          <p className="mt-1.5 font-display text-[2rem] font-semibold leading-none text-ink">
            {value}
          </p>
          {caption ? (
            <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
              <Explain>{caption}</Explain>
            </p>
          ) : null}
        </div>
        {Icon ? (
          <Tooltip label={tip ?? label}>
            <span
              tabIndex={0}
              className="flex h-10 w-10 shrink-0 cursor-help items-center justify-center rounded-full bg-brand-lightest text-brand"
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </Tooltip>
        ) : null}
      </div>

      {hasDelta ? (
        <Tooltip
          label={`${rising ? 'Up' : 'Down'} ${Math.abs(delta)}% on the same period last month — ${
            good ? 'moving the right way' : 'moving the wrong way'
          } for this measure.`}
        >
          <p
            tabIndex={0}
            className={cn(
              'mt-3 inline-flex cursor-help items-center gap-1 text-[0.75rem] font-semibold',
              good ? 'text-positive' : 'text-negative',
            )}
          >
            <TrendIcon size={14} aria-hidden="true" />
            {Math.abs(delta)}%<span className="font-normal text-ink-subtle">vs last month</span>
          </p>
        </Tooltip>
      ) : null}

      {to ? (
        <span className="absolute bottom-3 right-3 text-ink-subtle transition group-hover:text-brand">
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    'group relative block rounded-cf border border-line bg-surface p-4 shadow-cf transition',
    'before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand',
    to &&
      'hover:border-brand-light hover:shadow-cf-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

export default StatCard;
