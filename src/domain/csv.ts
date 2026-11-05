type Cell = string | number;

function escapeCell(cell: Cell): string {
  if (typeof cell === 'number') return String(cell);
  // A cell starting with these runs as a formula when opened in a spreadsheet.
  const safe = /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** UTF-8 BOM first, so Excel shows accents correctly. */
export function toCsv(rows: Cell[][]): string {
  return '﻿' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}
