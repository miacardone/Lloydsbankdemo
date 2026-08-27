import { useCallback, useId, useRef, useState } from 'react';
import { Paperclip, Upload, X } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * A file input people can actually drop files onto.
 *
 * A dashed box captioned "drop a file here" that only responds to a click is
 * worse than a plain button — it tells the reader the gesture works and then
 * ignores it. This handles the drop, keeps the click, and holds on to the File
 * objects rather than only their names, so callers can do something with them.
 */
export function Dropzone({
  label = 'Attachments',
  hint,
  accept,
  multiple = true,
  files = [],
  onChange,
  emptyText = 'Drag files here, or choose them from your computer.',
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  const id = useId();

  const add = useCallback(
    (incoming) => {
      const list = Array.from(incoming ?? []);
      if (!list.length) return;
      const next = multiple ? [...files, ...list] : list.slice(0, 1);
      /* Same file dropped twice is a slip, not an instruction. */
      const seen = new Set();
      onChange?.(
        next.filter((file) => {
          const key = `${file.name}:${file.size}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      );
    },
    [files, multiple, onChange],
  );

  const remove = (target) => onChange?.(files.filter((file) => file !== target));

  return (
    <div>
      <p className="text-cf-label uppercase text-ink-muted" id={`${id}-label`}>
        {label}
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          add(event.dataTransfer?.files);
        }}
        className={cn(
          'mt-1.5 flex cursor-pointer flex-col items-center gap-1 rounded-cf border border-dashed p-5 text-center transition',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          over
            ? 'border-brand bg-brand-lightest/60'
            : 'border-lineStrong hover:border-brand hover:bg-surface-sunken',
        )}
      >
        <Upload size={18} className="text-ink-subtle" aria-hidden="true" />
        <p className="text-cf-body text-ink">{over ? 'Drop to attach' : emptyText}</p>
        {hint ? (
          <p id={`${id}-hint`} className="text-[0.75rem] text-ink-subtle">
            {hint}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          add(event.target.files);
          /* Reset so choosing the same file twice still fires a change. */
          event.target.value = '';
        }}
      />

      {files.length ? (
        <ul className="mt-2 space-y-1">
          {files.map((file) => (
            <li
              key={`${file.name}:${file.size}`}
              className="flex items-center gap-1.5 text-[0.75rem] text-ink-muted"
            >
              <Paperclip size={12} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-ink">{file.name}</span>
              <span className="shrink-0 tabular-nums">{formatBytes(file.size)}</span>
              <Tooltip label={`Remove ${file.name}`}>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => remove(file)}
                  className="shrink-0 rounded-cf p-0.5 transition hover:bg-surface-sunken hover:text-negative focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Dropzone;
