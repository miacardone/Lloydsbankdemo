import { useMemo, useState } from 'react';

/**
 * Column-level conditions from the table's advanced search.
 *
 * `get` comes from the column definition, so a condition works on what the cell
 * actually shows rather than on a raw field the column may not even use.
 */
const TEXT = (value) => String(value ?? '').toLowerCase();

export const CONDITION_OPERATORS = [
  { value: 'contains', label: 'contains', input: 'text' },
  { value: 'notContains', label: 'does not contain', input: 'text' },
  { value: 'is', label: 'is', input: 'text' },
  { value: 'isNot', label: 'is not', input: 'text' },
  { value: 'startsWith', label: 'starts with', input: 'text' },
  { value: 'endsWith', label: 'ends with', input: 'text' },
  { value: 'gt', label: 'is greater than', input: 'number' },
  { value: 'lt', label: 'is less than', input: 'number' },
  { value: 'isEmpty', label: 'is empty', input: 'none' },
  { value: 'isNotEmpty', label: 'is not empty', input: 'none' },
];

const OPERATOR_INPUT = Object.fromEntries(
  CONDITION_OPERATORS.map((operator) => [operator.value, operator.input]),
);

export function matchesCondition(row, condition) {
  const { key, operator, value, get } = condition;
  const raw = get ? get(row) : row[key];

  if (operator === 'isEmpty') return raw === null || raw === undefined || String(raw).trim() === '';
  if (operator === 'isNotEmpty')
    return !(raw === null || raw === undefined || String(raw).trim() === '');

  /* An unfinished row shouldn't hide everything while it is being typed. */
  if (OPERATOR_INPUT[operator] !== 'none' && String(value ?? '').trim() === '') return true;

  if (operator === 'gt' || operator === 'lt') {
    const left = Number(String(raw).replace(/[^0-9.-]/g, ''));
    const right = Number(value);
    if (Number.isNaN(left) || Number.isNaN(right)) return false;
    return operator === 'gt' ? left > right : left < right;
  }

  const haystack = TEXT(raw);
  const needle = TEXT(value).trim();
  switch (operator) {
    case 'is':
      return haystack === needle;
    case 'isNot':
      return haystack !== needle;
    case 'notContains':
      return !haystack.includes(needle);
    case 'startsWith':
      return haystack.startsWith(needle);
    case 'endsWith':
      return haystack.endsWith(needle);
    case 'contains':
    default:
      return haystack.includes(needle);
  }
}

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
  const [conditions, setConditions] = useState([]);

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

    if (conditions.length) {
      result = result.filter((row) =>
        conditions.every((condition) => matchesCondition(row, condition)),
      );
    }

    if (filterFn) result = result.filter(filterFn);

    return result;
  }, [rows, query, searchKeys, filters, conditions, filterFn]);

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
    setConditions([]);
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
    conditions,
    setConditions: (value) => {
      setConditions(value);
      setPage(1);
    },
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
