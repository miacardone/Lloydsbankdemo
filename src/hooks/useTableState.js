import { useMemo, useState } from 'react';

/**
 * Everything a data table needs: text search, column sort, arbitrary filters and
 * pagination. Kept framework-free so swapping the mock arrays for API responses
 * only means feeding it a different `rows`.
 */
export function useTableState(rows, options = {}) {
  const { searchKeys = [], initialSort = null, initialPageSize = 25, filterFn = null } = options;

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState({});

  const filtered = useMemo(() => {
    let result = rows;

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      const keys = searchKeys.length ? searchKeys : Object.keys(rows[0] ?? {});
      result = result.filter((row) =>
        keys.some((key) =>
          String(row[key] ?? '')
            .toLowerCase()
            .includes(needle),
        ),
      );
    }

    const activeFilters = Object.entries(filters).filter(
      ([, value]) => value !== '' && value !== 'all' && value !== undefined && value !== null,
    );
    if (activeFilters.length) {
      result = result.filter((row) =>
        activeFilters.every(([key, value]) => String(row[key]) === String(value)),
      );
    }

    if (filterFn) result = result.filter(filterFn);

    return result;
  }, [rows, query, searchKeys, filters, filterFn]);

  const sorted = useMemo(() => {
    if (!sort?.key) return filtered;
    const { key, direction } = sort;
    const factor = direction === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return (
        String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true }) * factor
      );
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const toggleSort = (key) => {
    setPage(1);
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setPage(1);
  };

  return {
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    sort,
    toggleSort,
    filters,
    setFilter,
    clearFilters,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (value) => {
      setPageSize(value);
      setPage(1);
    },
    pageCount,
    rows: paged,
    allRows: sorted,
    total: sorted.length,
    unfilteredTotal: rows.length,
  };
}

export default useTableState;
