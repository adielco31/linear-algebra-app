import { useRef } from 'react'

/**
 * Grid of text inputs shaped like a matrix.
 *
 * Props:
 *   rows        — number — number of rows
 *   cols        — number — number of columns
 *   value       — string[][] — controlled 2-D array of cell strings
 *   onChange    — (newValue: string[][]) => void
 *   disabled    — boolean
 *   keypad      — boolean — when true, suppresses the native mobile keyboard
 *                 (inputMode="none") so MathKeypad can be the sole input method
 *   onCellFocus — ({ ri, ci }) => void — called when a cell receives focus
 *   className   — string — extra classes on the outermost element
 *
 * Allowed characters: digits, minus, dot, slash (for fractions like 1/2).
 * Arrow keys navigate between cells. Tab/Shift-Tab follow natural DOM order.
 * dir="ltr" is always applied so the grid works inside RTL pages.
 */
export default function MatrixInput({
  rows,
  cols,
  value,
  onChange,
  disabled    = false,
  keypad      = false,
  onCellFocus,
  className   = '',
}) {
  const tableRef = useRef(null)

  function handleChange(ri, ci, raw) {
    if (raw !== '' && /[^-\d./]/.test(raw)) return
    const next = value.map(r => [...r])
    next[ri][ci] = raw
    onChange(next)
  }

  function handleKeyDown(e, ri, ci) {
    const dirs = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    const dir = dirs[e.key]
    if (!dir) return
    e.preventDefault()
    const nr = ri + dir[0]
    const nc = ci + dir[1]
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      tableRef.current?.querySelector(`[data-cell="${nr}-${nc}"]`)?.focus()
    }
  }

  function handleFocus(e, ri, ci) {
    e.target.select()
    onCellFocus?.({ ri, ci })
  }

  return (
    <span
      dir="ltr"
      className={`inline-flex items-stretch font-mono select-none ${disabled ? 'opacity-70' : ''} ${className}`}
    >
      {/* Left bracket */}
      <span className="border-l-2 border-y-2 border-gray-700 w-1.5 shrink-0 self-stretch rounded-l-sm" />

      <table ref={tableRef} className="border-collapse">
        <tbody>
          {value.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="p-0.5">
                  <input
                    data-cell={`${ri}-${ci}`}
                    type="text"
                    inputMode={keypad ? 'none' : 'decimal'}
                    value={cell}
                    onChange={e => handleChange(ri, ci, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, ri, ci)}
                    onFocus={e => handleFocus(e, ri, ci)}
                    disabled={disabled}
                    dir="ltr"
                    placeholder="0"
                    className="w-14 h-11 text-center text-base font-mono tabular-nums rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-300 outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed focus:border-blue-400"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Right bracket */}
      <span className="border-r-2 border-y-2 border-gray-700 w-1.5 shrink-0 self-stretch rounded-r-sm" />
    </span>
  )
}
