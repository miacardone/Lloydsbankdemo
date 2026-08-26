import { useEffect, useId, useRef, useState } from 'react';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CONDITION_OPERATORS } from '@/hooks/useTableState';
import { cn } from '@/lib/cn';

const CONTROL =
  'h-8 rounded-cf border border-lineStrong bg-surface px-2 text-[0.8125rem] text-ink ' +
  'placeholder:text-ink-subtle focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30';

const OPERATOR_INPUT = Object.fromEntries(
  CONDITION_OPERATORS.map((operator) => [operator.value, operator.input]),
);

let nextId = 0;
const makeId = () => {
  nextId += 1;
  return `cond-${nextId}`;
};

/**
 * Per-column filtering, alongside the free-text box rather than instead of it.
 *
 * Search answers "where does this string appear anywhere"; this answers "which
 * rows have an amount above 500 and an acquirer that isn't Adyen" — the question
 * an analyst actually arrives with. Conditions are ANDed, which is what people
 * expect from stacked filter rows.
 */
export function AdvancedSearch({ columns, state, label = 'table' }) {
  const { conditions, setConditions } = state;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const filterable = columns.filter((column) => column.filterable !== false);

  /* Fixed to the viewport, measured off the button: the table card clips its
     own overflow, and an absolutely positioned panel gets cut in half on a
     short table. */
  useEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setAnchor({ top: rect.bottom + 6, left: rect.left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  /* Click-away and Escape, so the panel behaves like every other popover. */
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (panelRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const accessorFor = (key) => {
    const column = columns.find((item) => item.key === key);
    return typeof column?.value === 'function' ? column.value : undefined;
  };

  const addCondition = () => {
    const first = filterable[0];
    if (!first) return;
    setConditions([
      ...conditions,
      {
        id: makeId(),
        key: first.key,
        operator: 'contains',
        value: '',
        get: accessorFor(first.key),
      },
    ]);
  };

  const updateCondition = (id, patch) => {
    setConditions(
      conditions.map((condition) =>
        condition.id === id
          ? {
              ...condition,
              ...patch,
              /* The accessor has to follow the column, not the old key. */
              get: patch.key ? accessorFor(patch.key) : condition.get,
            }
          : condition,
      ),
    );
  };

  const removeCondition = (id) =>
    setConditions(conditions.filter((condition) => condition.id !== id));

  const activeCount = conditions.length;

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant={activeCount ? 'subtle' : 'secondary'}
        size="sm"
        icon={SlidersHorizontal}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          /* Opening an empty panel seeds a first row so there is something to
             fill in — done here rather than inside the setOpen updater, which
             would be a setState during another component's render. */
          if (!open && conditions.length === 0) addCondition();
          setOpen(!open);
        }}
      >
        Advanced
        {activeCount ? (
          <span className="ml-0.5 rounded-full bg-brand px-1.5 text-[0.6875rem] font-bold text-brand-contrast">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {open && anchor ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={`Advanced search for ${label}`}
          style={{ top: anchor.top, left: anchor.left }}
          className="fixed z-50 w-[min(30rem,calc(100vw-2rem))] rounded-cf border border-lineStrong bg-surface p-3 shadow-cf-pop"
        >
          <p className="mb-2 text-cf-label uppercase text-ink-muted">Filter by column</p>

          {conditions.length === 0 ? (
            <p className="mb-2 text-[0.8125rem] text-ink-subtle">
              No conditions yet — add one to narrow the table by a single column.
            </p>
          ) : null}

          <ul className="space-y-2">
            {conditions.map((condition, index) => {
              const inputKind = OPERATOR_INPUT[condition.operator] ?? 'text';
              return (
                <li key={condition.id} className="flex items-center gap-1.5">
                  <span className="w-8 shrink-0 text-[0.6875rem] uppercase text-ink-subtle">
                    {index === 0 ? 'Where' : 'And'}
                  </span>
                  <select
                    aria-label="Column"
                    value={condition.key}
                    onChange={(event) => updateCondition(condition.id, { key: event.target.value })}
                    className={cn(CONTROL, 'min-w-0 flex-1')}
                  >
                    {filterable.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.header}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Condition"
                    value={condition.operator}
                    onChange={(event) =>
                      updateCondition(condition.id, { operator: event.target.value })
                    }
                    className={cn(CONTROL, 'w-[8.5rem] shrink-0')}
                  >
                    {CONDITION_OPERATORS.map((operator) => (
                      <option key={operator.value} value={operator.value}>
                        {operator.label}
                      </option>
                    ))}
                  </select>
                  {inputKind === 'none' ? (
                    <span className="w-[7rem] shrink-0" />
                  ) : (
                    <input
                      aria-label="Value"
                      type={inputKind === 'number' ? 'number' : 'text'}
                      value={condition.value}
                      placeholder="Value"
                      onChange={(event) =>
                        updateCondition(condition.id, { value: event.target.value })
                      }
                      className={cn(CONTROL, 'w-[7rem] shrink-0')}
                    />
                  )}
                  <button
                    type="button"
                    aria-label="Remove condition"
                    onClick={() => removeCondition(condition.id)}
                    className="shrink-0 rounded-cf p-1 text-ink-subtle transition hover:bg-surface-sunken hover:text-negative focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
            <Button variant="ghost" size="sm" icon={Plus} onClick={addCondition}>
              Add condition
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConditions([])}
              disabled={conditions.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdvancedSearch;
