/**
 * rowOperations.js — pure row-operation utilities for Gaussian elimination.
 *
 * All functions are pure: they return new matrices and never mutate their input.
 * No UI, no display logic, no React imports.
 *
 * Fraction representation: { n: number, d: number }
 *   n — numerator (any integer, including negative)
 *   d — denominator (always a positive integer, always in lowest terms)
 *
 * Operation types:
 *   { type: 'swap',  rowA: number, rowB: number }
 *   { type: 'scale', row:  number, scalar: Frac }
 *   { type: 'add',   sourceRow: number, targetRow: number, scalar: Frac }
 *     → targetRow ← targetRow + scalar × sourceRow
 */

// ─── Fraction helpers ─────────────────────────────────────────────────────────

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

/** Create a reduced fraction from numerator and denominator. */
export function frac(n, d = 1) {
  if (d < 0) { n = -n; d = -d }
  const g = gcd(Math.abs(n), d)
  return { n: n / g, d: d / g }
}

export function fadd(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d) }
export function fmul(a, b) { return frac(a.n * b.n, a.d * b.d) }

/**
 * Parse a string like "3", "-2", "1/2", "-3/4" into a Frac.
 * Returns null if the string is not a valid fraction.
 */
export function parseFrac(str) {
  const s = String(str ?? '').trim()
  const m = s.match(/^(-?\d+)(?:\/(\d+))?$/)
  if (!m) return null
  const d = m[2] ? parseInt(m[2]) : 1
  return d === 0 ? null : frac(parseInt(m[1]), d)
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Check whether a row operation is mathematically legal.
 *
 * @param  {object} op      — operation object (see type definitions above)
 * @param  {number} numRows — optional matrix height; enables bounds checking
 * @returns {{ ok: boolean, error: string | null }}
 */
export function isLegalRowOperation(op, numRows) {
  const inBounds = r =>
    Number.isInteger(r) && r >= 0 && (numRows === undefined || r < numRows)

  switch (op?.type) {

    case 'swap': {
      if (!inBounds(op.rowA) || !inBounds(op.rowB))
        return { ok: false, error: 'אינדקס שורה מחוץ לטווח' }
      if (op.rowA === op.rowB)
        return { ok: false, error: 'יש לבחור שתי שורות שונות' }
      return { ok: true, error: null }
    }

    case 'scale': {
      if (!inBounds(op.row))
        return { ok: false, error: 'אינדקס שורה מחוץ לטווח' }
      if (!op.scalar || op.scalar.n === 0)
        return { ok: false, error: 'לא ניתן לכפול שורה באפס — הפעולה לא הפיכה' }
      return { ok: true, error: null }
    }

    case 'add': {
      if (!inBounds(op.sourceRow) || !inBounds(op.targetRow))
        return { ok: false, error: 'אינדקס שורה מחוץ לטווח' }
      if (op.sourceRow === op.targetRow)
        return { ok: false, error: 'שורת המקור ושורת היעד חייבות להיות שונות' }
      if (!op.scalar)
        return { ok: false, error: 'סקלר חסר' }
      return { ok: true, error: null }
    }

    default:
      return { ok: false, error: `סוג פעולה לא מוכר: "${op?.type}"` }
  }
}

// ─── Pure row operations ──────────────────────────────────────────────────────

/**
 * Swap two rows. Returns a new matrix; the original is not mutated.
 * Assumes both indices are valid — call isLegalRowOperation first.
 */
export function swapRows(matrix, rowA, rowB) {
  const next = matrix.map(r => [...r])
  ;[next[rowA], next[rowB]] = [next[rowB], next[rowA]]
  return next
}

/**
 * Multiply every cell in a row by a scalar fraction.
 * Row ← scalar × Row
 */
export function multiplyRow(matrix, row, scalar) {
  return matrix.map((r, ri) =>
    ri === row ? r.map(cell => fmul(cell, scalar)) : [...r]
  )
}

/**
 * Add a scalar multiple of sourceRow to targetRow.
 * targetRow ← targetRow + scalar × sourceRow
 */
export function addMultipleOfRow(matrix, sourceRow, targetRow, scalar) {
  return matrix.map((r, ri) =>
    ri === targetRow
      ? r.map((cell, ci) => fadd(cell, fmul(scalar, matrix[sourceRow][ci])))
      : [...r]
  )
}

// ─── Debug / self-test ────────────────────────────────────────────────────────

/**
 * Runs assertions against all exported functions and logs the result.
 * Call from a browser console or Node REPL:
 *
 *   import { debugTest } from './src/utils/rowOperations.js'
 *   debugTest()
 */
export function debugTest() {
  let passed = 0
  let failed = 0

  function assert(condition, label) {
    if (condition) {
      passed++
    } else {
      console.error(`  ✗ FAIL: ${label}`)
      failed++
    }
  }

  // ── Fixture: 2×2 identity matrix ──
  const id2 = [[frac(1), frac(0)], [frac(0), frac(1)]]
  // ── Fixture: [[1,2],[3,4]] ──
  const m   = [[frac(1), frac(2)], [frac(3), frac(4)]]

  // parseFrac
  assert(parseFrac('3')?.n   === 3,  'parseFrac integer')
  assert(parseFrac('1/2')?.d === 2,  'parseFrac fraction denominator')
  assert(parseFrac('-3/4')?.n === -3,'parseFrac negative fraction numerator')
  assert(parseFrac('') === null,     'parseFrac empty → null')
  assert(parseFrac('1/0') === null,  'parseFrac zero denominator → null')
  assert(parseFrac('abc') === null,  'parseFrac non-numeric → null')

  // frac reduction
  const half = frac(2, 4)
  assert(half.n === 1 && half.d === 2, 'frac reduces 2/4 → 1/2')
  const neg  = frac(3, -6)
  assert(neg.n === -1 && neg.d === 2,  'frac handles negative denominator')

  // swapRows
  const swapped = swapRows(id2, 0, 1)
  assert(swapped[0][0].n === 0 && swapped[0][1].n === 1, 'swapRows: row 0 → [0,1]')
  assert(swapped[1][0].n === 1 && swapped[1][1].n === 0, 'swapRows: row 1 → [1,0]')
  assert(id2[0][0].n === 1, 'swapRows: original unchanged (pure)')

  // multiplyRow
  const scaled = multiplyRow(m, 0, frac(3))
  assert(scaled[0][0].n === 3 && scaled[0][1].n === 6, 'multiplyRow integers')
  assert(scaled[1][0].n === 3, 'multiplyRow: row 1 unchanged')
  const halved = multiplyRow(id2, 0, frac(1, 2))
  assert(halved[0][0].n === 1 && halved[0][0].d === 2, 'multiplyRow: exact 1/2')

  // addMultipleOfRow  (targetRow ← targetRow + scalar × sourceRow)
  // source=0 ([1,2]), target=1 ([3,4]), scalar=2 → R₁ ← [3,4] + 2·[1,2] = [5,8]
  const added = addMultipleOfRow(m, 0, 1, frac(2))
  assert(added[1][0].n === 5 && added[1][1].n === 8, 'addMultipleOfRow result')
  assert(added[0][0].n === 1, 'addMultipleOfRow: source row unchanged')

  // addMultipleOfRow with fraction scalar: -1/3
  const m2 = [[frac(3), frac(0)], [frac(1), frac(1)]]
  const sub = addMultipleOfRow(m2, 0, 1, frac(-1, 3))  // R₁ ← [1,1] + (-1/3)·[3,0] = [0,1]
  assert(sub[1][0].n === 0, 'addMultipleOfRow: fraction scalar eliminates pivot')

  // isLegalRowOperation — legal cases
  assert(isLegalRowOperation({ type: 'swap',  rowA: 0, rowB: 1 }).ok,                         'legal swap')
  assert(isLegalRowOperation({ type: 'scale', row: 0, scalar: frac(3) }).ok,                   'legal scale')
  assert(isLegalRowOperation({ type: 'add', sourceRow: 1, targetRow: 0, scalar: frac(2) }).ok, 'legal add')
  assert(isLegalRowOperation({ type: 'add', sourceRow: 0, targetRow: 1, scalar: frac(0) }).ok, 'add with scalar=0 is legal (pointless but valid)')

  // isLegalRowOperation — illegal cases
  assert(!isLegalRowOperation({ type: 'swap',  rowA: 0, rowB: 0 }).ok,                          'swap same row')
  assert(!isLegalRowOperation({ type: 'scale', row: 0, scalar: frac(0) }).ok,                   'scale by zero')
  assert(!isLegalRowOperation({ type: 'add',   sourceRow: 1, targetRow: 1, scalar: frac(2) }).ok,'add same row')
  assert(!isLegalRowOperation({ type: 'swap',  rowA: 0, rowB: 5 }, 3).ok,                       'swap out of bounds')
  assert(!isLegalRowOperation({ type: 'scale', row: -1, scalar: frac(2) }).ok,                  'negative index')
  assert(!isLegalRowOperation({ type: 'unknown' }).ok,                                           'unknown op type')

  const summary = failed === 0
    ? `✓ rowOperations: all ${passed} tests passed`
    : `✗ rowOperations: ${failed} failed, ${passed} passed`
  console.log(summary)
  return { passed, failed }
}
