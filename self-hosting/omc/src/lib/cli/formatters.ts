/**
 * Console output formatting utilities for CLI scripts.
 * Provides consistent visual styling across all commands.
 */

const HEADER_WIDTH = 80;
const COLUMN_WIDTH = 30;

/**
 * Format section header with double-line border.
 *
 * @example
 * console.log(formatHeader('Queue Statistics'));
 * // ═══════════════════════════════════...
 * // Queue Statistics
 * // ═══════════════════════════════════...
 */
export function formatHeader(title: string): string {
  const border = '═'.repeat(HEADER_WIDTH);
  return `${border}\n${title}\n${border}`;
}

/**
 * Format section divider with single-line border.
 */
export function formatDivider(): string {
  return '─'.repeat(HEADER_WIDTH);
}

/**
 * Format success message with checkmark prefix.
 *
 * @example
 * console.log(formatSuccess('Analysis complete'));
 * // ✓ Analysis complete
 */
export function formatSuccess(message: string): string {
  return `✓ ${message}`;
}

/**
 * Format error message with cross prefix.
 *
 * @example
 * console.log(formatError('Failed to fetch article'));
 * // ✗ Failed to fetch article
 */
export function formatError(message: string): string {
  return `✗ ${message}`;
}

/**
 * Format data as simple aligned table.
 *
 * AIDEV-NOTE: Simple column formatting - not full table library
 * Columns are padded to COLUMN_WIDTH for alignment
 *
 * @example
 * formatTable(
 *   [{ name: 'foo', status: 'done' }],
 *   ['name', 'status']
 * );
 */
export function formatTable(data: any[], columns: string[]): string {
  if (data.length === 0) {
    return '(no data)';
  }

  const rows: string[] = [];

  // Header row
  const header = columns.map(col => col.padEnd(COLUMN_WIDTH)).join('');
  rows.push(header);
  rows.push('─'.repeat(header.length));

  // Data rows
  for (const item of data) {
    const row = columns
      .map(col => String(item[col] ?? '').padEnd(COLUMN_WIDTH))
      .join('');
    rows.push(row);
  }

  return rows.join('\n');
}
