import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { glossaryHint } from '@/data/glossary';
import { cn } from '@/lib/cn';

/**
 * Hover/focus tooltip.
 *
 * Rendered into a portal and positioned against the viewport, because almost
 * every place that needs one — a table header, a toolbar button, a badge in a
 * scrolling panel — sits inside something with `overflow: hidden`, and an
 * absolutely positioned bubble gets sliced in half there.
 *
 * It attaches its handlers to the child element rather than a wrapper span, so
 * `aria-describedby` lands on the thing that actually takes focus and the
 * tooltip is read out by a screen reader instead of only being seen.
 */
const EDGE = 8;

export function Tooltip({ label, children, placement = 'top', delay = 120, className }) {
  const [position, setPosition] = useState(null);
  const anchorRef = useRef(null);
  const bubbleRef = useRef(null);
  const timer = useRef(null);
  const id = useId();

  const place = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = placement === 'top' && rect.top > 56;
    setPosition({
      top: above ? rect.top - EDGE : rect.bottom + EDGE,
      left: rect.left + rect.width / 2,
      above,
    });
  }, [placement]);

  /* The bubble is sized by its content, so how far it can be centred on the
     anchor is only knowable once it exists. Measure, then pull it back inside
     the viewport — otherwise a tooltip near the right edge gets squeezed into
     a one-word-per-line column. */
  useLayoutEffect(() => {
    if (!position || !bubbleRef.current) return;
    const width = bubbleRef.current.offsetWidth;
    const half = width / 2;
    const clamped = Math.min(Math.max(position.left, half + EDGE), window.innerWidth - half - EDGE);
    if (Math.abs(clamped - position.left) > 0.5) {
      setPosition((current) => (current ? { ...current, left: clamped } : current));
    }
  }, [position]);

  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(place, delay);
  }, [place, delay]);

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setPosition(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!position) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') hide();
    };
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [position, hide]);

  if (!label) return children;

  const handlers = {
    ref: anchorRef,
    'aria-describedby': position ? id : undefined,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  };

  const anchor = isValidElement(children) ? (
    cloneElement(children, {
      ...handlers,
      onMouseEnter: (event) => {
        children.props.onMouseEnter?.(event);
        show();
      },
      onMouseLeave: (event) => {
        children.props.onMouseLeave?.(event);
        hide();
      },
      onFocus: (event) => {
        children.props.onFocus?.(event);
        show();
      },
      onBlur: (event) => {
        children.props.onBlur?.(event);
        hide();
      },
    })
  ) : (
    <span {...handlers} className="inline-flex">
      {children}
    </span>
  );

  return (
    <>
      {anchor}
      {position && typeof document !== 'undefined'
        ? createPortal(
            <span
              ref={bubbleRef}
              id={id}
              role="tooltip"
              style={{
                top: position.top,
                left: position.left,
                transform: `translate(-50%, ${position.above ? '-100%' : '0'})`,
              }}
              className={cn(
                'pointer-events-none fixed z-[60] w-max max-w-[16rem] rounded-cf bg-brand-dark',
                'px-2 py-1 text-[0.75rem] leading-4 text-white shadow-cf-pop',
                className,
              )}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}

/**
 * An abbreviation that explains itself.
 *
 * The portal is dense with trade jargon — MID, BIN, bps, CTR — and a merchant
 * three weeks into using it should not have to keep a glossary tab open.
 */
export function Abbr({ term, children, className }) {
  const definition = typeof term === 'string' ? term : null;
  return (
    <Tooltip label={definition}>
      <abbr
        title={undefined}
        tabIndex={0}
        className={cn(
          'cursor-help underline decoration-dotted decoration-from-font underline-offset-2',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          className,
        )}
      >
        {children}
      </abbr>
    </Tooltip>
  );
}

/* Acronyms worth explaining wherever they appear in prose. Deliberately a short,
   case-sensitive list: matching ordinary words would litter the page with dotted
   underlines and make the ones that matter invisible. */
const AUTO_TERMS = [
  'MIDs',
  'MID',
  'BINs',
  'BIN',
  'MCC',
  'CAID',
  'CTR',
  'ERT',
  'CDRN',
  'RDR',
  'IVR',
  'RMA',
  'ACH',
  '3DS',
  'A2A',
  'BNPL',
  'KPI',
  'MTD',
  'bps',
];

const AUTO_PATTERN = new RegExp(`\\b(${AUTO_TERMS.join('|')})\\b`, 'g');

/**
 * Wraps any acronym in a run of copy with its definition.
 *
 * Used by the shared page, card and chart headers, so a merchant meeting "bps"
 * or "MCC" for the first time gets an answer wherever it turns up rather than
 * only in the one table where somebody remembered to annotate it.
 */
export function Explain({ children }) {
  if (typeof children !== 'string') return children;

  const parts = children.split(AUTO_PATTERN);
  if (parts.length === 1) return children;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <Abbr key={`${part}-${index}`} term={glossaryHint(part)}>
        {part}
      </Abbr>
    ) : (
      part
    ),
  );
}

export default Tooltip;
