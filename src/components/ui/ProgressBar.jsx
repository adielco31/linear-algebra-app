/**
 * ProgressBar — a simple labeled progress bar.
 *
 * Props:
 *   pct        — 0-100 (overrides value/max when provided)
 *   value/max  — alternative: pct = Math.round(value/max * 100)
 *   label      — left-side text (optional)
 *   sublabel   — right-side text; defaults to "${pct}%" when label is given
 *   color      — Tailwind bg class for the fill (default 'bg-blue-500')
 *   height     — Tailwind h class for bar thickness (default 'h-2')
 *   className  — wrapper class passthrough
 */
export default function ProgressBar({
  pct,
  value,
  max,
  label,
  sublabel,
  color     = 'bg-blue-500',
  height    = 'h-2',
  className = '',
}) {
  const resolved =
    pct !== undefined
      ? Math.min(100, Math.max(0, pct))
      : max > 0
        ? Math.min(100, Math.round((value / max) * 100))
        : 0

  const showLabels = label !== undefined || sublabel !== undefined
  const rightText  = sublabel !== undefined ? sublabel : label !== undefined ? `${resolved}%` : undefined

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          {label    !== undefined && <span>{label}</span>}
          {rightText !== undefined && <span>{rightText}</span>}
        </div>
      )}
      <div className={`${height} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${resolved}%` }}
        />
      </div>
    </div>
  )
}
