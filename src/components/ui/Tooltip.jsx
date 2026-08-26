import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
export function Tooltip({ label, children, placement = 'top', delay = 120, className }) {
  const [position, setPosition] = useState(null);
  const anchorRef = useRef(null);
  const timer = useRef(null);
  const id = useId();

  const place = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = placement === 'top' && rect.top > 56;
    setPosition({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(rect.left + rect.width / 2, 88), window.innerWidth - 88),
      above,
    });
  }, [placement]);

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
              id={id}
              role="tooltip"
              style={{
                top: position.top,
                left: position.left,
                transform: `translate(-50%, ${position.above ? '-100%' : '0'})`,
              }}
              className={cn(
                'pointer-events-none fixed z-[60] max-w-[16rem] rounded-cf bg-brand-dark px-2 py-1',
                'text-[0.75rem] leading-4 text-white shadow-cf-pop',
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

export default Tooltip;
