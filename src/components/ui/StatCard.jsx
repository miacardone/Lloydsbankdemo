import { Link } from 'react-router-dom';
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * The KPI tile. `direction` says which way is good — a falling dispute rate is
 * a win, a falling win rate is not — so the colour never lies about the number.
 */
export function StatCard({
  label,
  value,
  caption,
  delta,
  direction = 'up-is-good',
  icon: Icon,
  to,
  className,
}) {
  const hasDelta = typeof delta === 'number' && delta !== 0;
  const rising = delta > 0;
  const good = direction === 'up-is-good' ? rising : !rising;
  const TrendIcon = rising ? TrendingUp : TrendingDown;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-cf-label uppercase text-ink-subtle">{label}</p>
          <p className="mt-1.5 font-display text-[2rem] leading-none text-ink">{value}</p>
          {caption ? <p className="mt-1.5 text-[0.75rem] text-ink-subtle">{caption}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lightest text-brand">
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {hasDelta ? (
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-[0.75rem] font-semibold',
            good ? 'text-positive' : 'text-negative',
          )}
        >
          <TrendIcon size={14} aria-hidden="true" />
          {Math.abs(delta)}%<span className="font-normal text-ink-subtle">vs last month</span>
        </p>
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
