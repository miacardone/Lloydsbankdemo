import { ChevronDown, ChevronUp, ChevronsUpDown, Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { downloadCsv } from '@/lib/csv';
import { cn } from '@/lib/cn';

/**
 * The workhorse. Columns are plain objects:
 *   { key, header, align, width, sortable, render(row), value(row) }
 * `render` is for the cell, `value` is what lands in the CSV.
 */
export function DataTable({
  columns,
  state,
  caption,
  exportName,
  toolbar,
  emptyTitle = 'Nothing matches those filters',
  emptyDescription = 'Widen the date range or clear the search to see more cases.',
  dense = false,
  rowKey = (row, index) => row.id ?? index,
  onRowClick,
}) {
  const { rows, sort, toggleSort, query, setQuery, total, unfilteredTotal, clearFilters } = state;
  const isFiltered = total !== unfilteredTotal;

  return (
    <div className="relative overflow-hidden rounded-cf border border-line bg-surface pt-[3px] shadow-cf before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label={caption ? `Search ${caption}` : 'Search table'}
              className="h-8 w-52 rounded-cf border border-lineStrong bg-surface pl-8 pr-3 text-cf-body text-ink placeholder:text-ink-subtle focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
            />
          </div>
          {toolbar}
          {isFiltered ? (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>

        {exportName ? (
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => downloadCsv(exportName, columns, state.allRows)}
          >
            Export CSV
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-y border-line bg-surface-sunken">
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const sortable = column.sortable !== false;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={{ width: column.width }}
                    aria-sort={
                      active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                    className={cn(
                      'whitespace-nowrap px-3 py-2 text-cf-label uppercase text-ink-muted',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[2px] transition hover:text-brand',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                          active && 'text-brand',
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp size={12} aria-hidden="true" />
                          ) : (
                            <ChevronDown size={12} aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown size={12} className="opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line/70 transition last:border-b-0',
                  'hover:bg-brand-lightest/60',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 text-cf-body text-ink',
                      dense ? 'py-1.5' : 'py-2.5',
                      column.align === 'right' && 'text-right tabular-nums',
                      column.align === 'center' && 'text-center',
                      column.numeric && 'tabular-nums',
                    )}
                  >
                    {column.render ? column.render(row) : (row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Search}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : null}

      <Pagination state={state} />
    </div>
  );
}

export function Pagination({ state }) {
  const { page, setPage, pageCount, pageSize, setPageSize, total } = state;
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = (() => {
    const window = [];
    const start = Math.max(1, Math.min(page - 2, pageCount - 4));
    for (let index = start; index < start + 5 && index <= pageCount; index += 1) window.push(index);
    return window;
  })();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <div className="flex items-center gap-3 text-[0.75rem] text-ink-muted">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="sr-only">Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-7 rounded-cf border border-lineStrong bg-surface px-1.5 text-[0.75rem] focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <PageButton onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </PageButton>
        {pages[0] > 1 ? <span className="px-1 text-ink-subtle">…</span> : null}
        {pages.map((number) => (
          <PageButton key={number} active={number === page} onClick={() => setPage(number)}>
            {number}
          </PageButton>
        ))}
        {pages[pages.length - 1] < pageCount ? (
          <>
            <span className="px-1 text-ink-subtle">…</span>
            <PageButton onClick={() => setPage(pageCount)}>{pageCount}</PageButton>
          </>
        ) : null}
        <PageButton onClick={() => setPage(page + 1)} disabled={page === pageCount}>
          Next
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({ active, children, ...rest }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'h-7 min-w-7 rounded-cf px-2 text-[0.75rem] font-semibold transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'bg-brand text-brand-contrast'
          : 'border border-line text-ink-muted hover:border-brand hover:text-brand',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default DataTable;
