import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Drag-to-reorder over a list of stable keys.
 *
 * Pointer events rather than the HTML5 drag-and-drop API. HTML5 DnD brings a
 * ghost image nobody asked for, needs a dataTransfer payload to start at all in
 * Firefox, and does nothing on touch — pointer events behave the same on mouse,
 * pen and touch, and a 5px threshold keeps a plain click on a sort button a
 * click rather than a one-pixel drag.
 *
 * `locked` keys never move and nothing can be dropped onto them — the routing
 * default route has to stay at the bottom because every payment needs a terminal
 * rule, and that constraint belongs here rather than in each caller.
 */
export function useReorder(keys, { locked = [], axis = 'vertical', onChange } = {}) {
  const source = keys.join(' ');
  const lockedKey = locked.join(' ');
  const lockedSet = useMemo(() => new Set(locked), [lockedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [state, setState] = useState({ source, order: keys });
  const [dragKey, setDragKey] = useState(null);
  const [target, setTarget] = useState(null); // { key, side }

  /* Reconciled during render rather than synced in an effect. Keys that are
     still here keep the order the user put them in; new ones slot in where the
     caller placed them, removed ones drop out. Resetting to `keys` wholesale
     would be simpler, but then adding a routing rule would silently undo a
     ladder someone had just spent a minute arranging. */
  const order = useMemo(() => {
    if (state.source === source) return state.order;

    const incoming = new Set(keys);
    const kept = state.order.filter((key) => incoming.has(key));
    const known = new Set(kept);

    const next = [...kept];
    keys.forEach((key, index) => {
      if (known.has(key)) return;
      /* Place a new key at its own index, so an insert lands where the caller
         put it rather than always at the end. */
      next.splice(Math.min(index, next.length), 0, key);
    });
    return next;
  }, [source, state.source, state.order, keys]); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = useRef(null); // { key, x, y, moved }
  const dragged = useRef(false); // swallow the click that ends a drag
  const orderRef = useRef(order);
  orderRef.current = order;

  const commit = useCallback(
    (next) => {
      setState({ source, order: next });
      onChange?.(next);
    },
    [source, onChange],
  );

  /** Move `key` to sit before/after `anchor`, leaving locked positions untouched. */
  const moveTo = useCallback(
    (key, anchor, side = 'before') => {
      const current = orderRef.current;
      if (key === anchor || lockedSet.has(key) || lockedSet.has(anchor)) return;

      const movable = current.filter((item) => !lockedSet.has(item));
      if (!movable.includes(key) || !movable.includes(anchor)) return;

      const without = movable.filter((item) => item !== key);
      const base = without.indexOf(anchor);
      without.splice(side === 'after' ? base + 1 : base, 0, key);

      /* Rebuild against the original shape so locked keys keep their slots. */
      let cursor = 0;
      const next = current.map((item) => (lockedSet.has(item) ? item : without[cursor++]));
      if (next.join(' ') !== current.join(' ')) commit(next);
    },
    [lockedSet, commit],
  );

  /** Keyboard equivalent: nudge a key one slot in either direction. */
  const moveBy = useCallback(
    (key, delta) => {
      if (lockedSet.has(key)) return;
      const movable = orderRef.current.filter((item) => !lockedSet.has(item));
      const from = movable.indexOf(key);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= movable.length) return;
      moveTo(key, movable[to], delta > 0 ? 'after' : 'before');
    },
    [lockedSet, moveTo],
  );

  /* What is under the pointer, and which half of it. */
  const resolveTarget = useCallback(
    (event) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const host = element?.closest('[data-reorder-key]');
      const key = host?.getAttribute('data-reorder-key');
      if (!key || lockedSet.has(key)) return null;

      const box = host.getBoundingClientRect();
      const side =
        axis === 'horizontal'
          ? event.clientX > box.left + box.width / 2
            ? 'after'
            : 'before'
          : event.clientY > box.top + box.height / 2
            ? 'after'
            : 'before';
      return { key, side };
    },
    [axis, lockedSet],
  );

  useEffect(() => {
    const onMove = (event) => {
      const start = pending.current;
      if (!start) return;

      if (!start.moved) {
        const travelled = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (travelled < 5) return;
        start.moved = true;
        dragged.current = true;
        setDragKey(start.key);
      }

      /* Stops the browser turning the drag into a text selection. */
      event.preventDefault();
      const next = resolveTarget(event);
      setTarget((current) =>
        next && current?.key === next.key && current.side === next.side ? current : next,
      );
    };

    const onUp = (event) => {
      const start = pending.current;
      pending.current = null;
      if (!start?.moved) return;

      const drop = resolveTarget(event);
      if (drop && drop.key !== start.key) moveTo(start.key, drop.key, drop.side);
      setDragKey(null);
      setTarget(null);
      /* Released on the next tick so the click that follows can be swallowed. */
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
    };

    const onCancel = () => {
      pending.current = null;
      setDragKey(null);
      setTarget(null);
    };

    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
    };
  }, [moveTo, resolveTarget]);

  /** Marks an element as a reorderable slot — put this on the row or header. */
  const slotProps = useCallback(
    (key) => ({
      'data-reorder-key': key,
      /* A drag that ends on a sort button must not also sort it. */
      onClickCapture: (event) => {
        if (!dragged.current) return;
        event.preventDefault();
        event.stopPropagation();
      },
    }),
    [],
  );

  /** Starts a drag — put this on the grip, or on the whole slot for tables. */
  const handleProps = useCallback(
    (key) => {
      if (lockedSet.has(key)) return {};
      return {
        style: { touchAction: 'none' },
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          pending.current = { key, x: event.clientX, y: event.clientY, moved: false };
        },
      };
    },
    [lockedSet],
  );

  const isReordered = order.join(' ') !== source;

  return {
    order,
    dragKey,
    target,
    slotProps,
    handleProps,
    moveBy,
    reset: () => commit(keys),
    isReordered,
  };
}

export default useReorder;
