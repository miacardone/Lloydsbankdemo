import { useId } from 'react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-cf border border-lineStrong bg-surface px-3 text-cf-body text-ink ' +
  'placeholder:text-ink-subtle transition ' +
  'focus:border-brand focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-brand/30 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle';

export function Label({ children, htmlFor, required, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-cf-label uppercase text-ink-muted', className)}
    >
      {children}
      {required ? <span className="ml-1 text-negative">*</span> : null}
    </label>
  );
}

export function Input({ label, hint, error, className, id, ...rest }) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={inputId} required={rest.required}>
          {label}
        </Label>
      ) : null}
      <input
        id={inputId}
        className={cn(CONTROL, 'h-9', error && 'border-negative focus:outline-negative/30')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={hint || error ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {hint || error ? (
        <p
          id={`${inputId}-hint`}
          className={cn('text-[0.75rem]', error ? 'text-negative' : 'text-ink-subtle')}
        >
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ label, options = [], hint, className, id, children, ...rest }) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={selectId} required={rest.required}>
          {label}
        </Label>
      ) : null}
      <select id={selectId} className={cn(CONTROL, 'h-9 pr-8')} {...rest}>
        {children ??
          options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const text = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
      </select>
      {hint ? <p className="text-[0.75rem] text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

export function Textarea({ label, className, id, rows = 4, ...rest }) {
  const generated = useId();
  const areaId = id ?? generated;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? <Label htmlFor={areaId}>{label}</Label> : null}
      <textarea id={areaId} rows={rows} className={cn(CONTROL, 'py-2')} {...rest} />
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, id, disabled = false, srLabel }) {
  const generated = useId();
  const toggleId = id ?? generated;
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        aria-label={!label ? srLabel : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          disabled && 'cursor-not-allowed opacity-50',
          checked ? 'bg-brand' : 'bg-lineStrong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-[1.125rem]' : 'left-0.5',
          )}
        />
      </button>
      {label ? (
        <label htmlFor={toggleId} className="cursor-pointer text-cf-body text-ink">
          {label}
          {description ? (
            <span className="block text-[0.75rem] text-ink-subtle">{description}</span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}
