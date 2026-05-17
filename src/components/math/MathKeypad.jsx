/**
 * MathKeypad — numeric keypad for matrix cell input on mobile.
 *
 * Props:
 *   onKey    — (key: string) => void
 *              Values: '0'–'9', '-', '/', 'backspace', 'clear'
 *   disabled — boolean — dims all buttons when no cell is active
 *
 * Buttons use onPointerDown + e.preventDefault() so they never
 * steal focus from the active matrix input cell.
 */
export default function MathKeypad({ onKey, disabled = false }) {
  function fire(key, e) {
    e.preventDefault()
    if (!disabled) onKey(key)
  }

  return (
    <div dir="ltr" className="mt-3 grid grid-cols-4 gap-2 select-none">

      <Key label="7" onFire={fire} disabled={disabled} />
      <Key label="8" onFire={fire} disabled={disabled} />
      <Key label="9" onFire={fire} disabled={disabled} />
      <Key label="⌫" value="backspace" onFire={fire} disabled={disabled} variant="action" />

      <Key label="4" onFire={fire} disabled={disabled} />
      <Key label="5" onFire={fire} disabled={disabled} />
      <Key label="6" onFire={fire} disabled={disabled} />
      <Key label="−" value="-" onFire={fire} disabled={disabled} variant="special" />

      <Key label="1" onFire={fire} disabled={disabled} />
      <Key label="2" onFire={fire} disabled={disabled} />
      <Key label="3" onFire={fire} disabled={disabled} />
      <Key label="/" onFire={fire} disabled={disabled} variant="special" />

      <Key label="C" value="clear" onFire={fire} disabled={disabled} variant="action" />
      <Key label="0" onFire={fire} disabled={disabled} className="col-span-2" />
      {/* spacer keeps grid balanced */}
      <div />
    </div>
  )
}

const BASE = 'h-13 rounded-xl text-xl font-semibold transition-colors flex items-center justify-center'

const VARIANTS = {
  digit:   { on: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300', off: 'bg-gray-100 text-gray-300' },
  action:  { on: 'bg-red-50   text-red-700  hover:bg-red-100  active:bg-red-200',  off: 'bg-red-50   text-red-300'  },
  special: { on: 'bg-blue-50  text-blue-700 hover:bg-blue-100 active:bg-blue-200', off: 'bg-blue-50  text-blue-300' },
}

function Key({ label, value, onFire, disabled, variant = 'digit', className = '' }) {
  const key    = value ?? label
  const colors = VARIANTS[variant]
  return (
    <button
      type="button"
      tabIndex={-1}
      onPointerDown={e => onFire(key, e)}
      className={`${BASE} ${disabled ? colors.off : colors.on} ${className}`}
    >
      {label}
    </button>
  )
}
