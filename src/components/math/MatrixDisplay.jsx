import { Fragment } from 'react'

/**
 * Renders a 2D array as a formatted mathematical matrix.
 *
 * Props:
 *   rows      — (number|string)[][] — the matrix data
 *   augmented — number — column index before which to draw the | separator
 *               e.g. augmented=2 on a 3-col matrix gives [ a  b | c ]
 *   block     — boolean — if true, centers the matrix in a full-width scroll container
 *   className — string — extra classes on the outermost element
 *
 * The brackets are pure CSS (border technique), so they scale with font size.
 * dir="ltr" is always applied so matrices display correctly inside RTL pages.
 */
export default function MatrixDisplay({ rows, augmented, block = false, className = '' }) {
  if (!rows?.length) return null

  const inner = (
    <span
      dir="ltr"
      className={`inline-flex items-stretch font-mono select-none ${className}`}
    >
      {/* Left bracket: left + top + bottom border, rounded on the open side */}
      <span className="border-l-2 border-y-2 border-gray-700 w-2 shrink-0 self-stretch rounded-l-sm" />

      {/* Table gives automatic per-column alignment */}
      <table className="border-collapse">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <Fragment key={ci}>
                  {/* Augmented separator: a zero-width cell with a left border */}
                  {augmented !== undefined && ci === augmented && (
                    <td
                      aria-hidden
                      className="border-l border-gray-400 p-0"
                      style={{ width: 0 }}
                    />
                  )}
                  <td className="tabular-nums text-base text-right py-1 px-2.5 whitespace-nowrap leading-snug">
                    {cell ?? '—'}
                  </td>
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Right bracket: mirror of left */}
      <span className="border-r-2 border-y-2 border-gray-700 w-2 shrink-0 self-stretch rounded-r-sm" />
    </span>
  )

  if (block) {
    return (
      <div className="w-full overflow-x-auto flex justify-center py-2">
        {inner}
      </div>
    )
  }

  return inner
}
