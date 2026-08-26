import { forwardRef } from 'react';
import { Tooltip } from './Tooltip';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary: 'bg-brand text-brand-contrast hover:bg-brand-dark focus-visible:outline-brand',
  secondary:
    'bg-surface text-ink border border-lineStrong hover:border-brand hover:text-brand focus-visible:outline-brand',
  subtle: 'bg-brand-lightest text-brand hover:bg-brand-light/40 focus-visible:outline-brand',
  accent: 'bg-accent text-ink hover:brightness-95 focus-visible:outline-accent',
  ghost: 'text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-brand',
  danger: 'bg-negative text-white hover:brightness-110 focus-visible:outline-negative',
};

const SIZES = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-9 px-4 text-cf-body',
  lg: 'h-11 px-6 text-cf-button',
};

export const Button = forwardRef(function Button(
  {
    as: Tag = 'button',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-cf font-semibold transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {Icon ? <Icon size={16} strokeWidth={2} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
});

/**
 * Square icon-only button — used in table row actions.
 *
 * An icon with no text has to say what it does on hover; `label` is both the
 * accessible name and the tooltip, so the two can never drift apart.
 */
export function IconButton({ icon: Icon, label, hint, className, ...rest }) {
  return (
    <Tooltip label={hint ?? label}>
      <button
        type="button"
        aria-label={label}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-cf text-ink-subtle transition',
          'hover:bg-brand-lightest hover:text-brand',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          className,
        )}
        {...rest}
      >
        <Icon size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

export default Button;
