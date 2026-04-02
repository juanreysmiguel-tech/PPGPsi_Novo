/**
 * Parses monetary values from various formats (Brazilian and US).
 * Handles: "R$ 1.234,56" (BR) or "1,234.56" (US) or plain numbers.
 * Replicated from js.html:7-43
 */
export function parseMoneyValue(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val

  let str = String(val).trim()

  // Remove currency symbols and text
  str = str.replace(/R\$\s*/gi, '').replace(/[^\d.,\-]/g, '').trim()

  if (!str) return 0

  // Handle Brazilian format: 1.234,56 -> 1234.56
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Brazilian: 1.234,56
      str = str.replace(/\./g, '').replace(',', '.')
    } else {
      // US: 1,234.56
      str = str.replace(/,/g, '')
    }
  } else if (str.includes(',')) {
    // Only comma: 1234,56 (Brazilian decimal)
    str = str.replace(',', '.')
  } else if (str.includes('.')) {
    // Only dot: could be 1234.56 (US) or 1.234 (BR thousands)
    const parts = str.split('.')
    if (parts.length === 2 && parts[1].length === 3) {
      // Likely thousands separator: 1.234
      str = str.replace(/\./g, '')
    }
  }

  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}
