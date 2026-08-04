/**
 * Client-side export. Real deployments would hit an export endpoint, but the
 * demo needs the buttons in the screenshots to actually do something.
 */
const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCell(column.header)).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((column) =>
          escapeCell(typeof column.value === 'function' ? column.value(row) : row[column.key]),
        )
        .join(','),
    )
    .join('\n');
  return `${header}\n${body}`;
}

export function downloadCsv(filename, columns, rows) {
  const blob = new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
