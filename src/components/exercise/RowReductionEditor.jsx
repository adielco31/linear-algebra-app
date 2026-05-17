import { useState } from 'react'
import MatrixDisplay from '../math/MatrixDisplay'
import {
  frac, parseFrac,
  isLegalRowOperation,
  swapRows, multiplyRow, addMultipleOfRow,
} from '../../utils/rowOperations'

// ─── Display helpers ──────────────────────────────────────────────────────────

function fstr(f) { return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}` }

// ─── Operation labels ─────────────────────────────────────────────────────────

const SUBS = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉']
function rsub(i) { return 'R' + String(i + 1).split('').map(c => SUBS[+c]).join('') }

function descSwap(i, j)         { return `${rsub(i)} ↔ ${rsub(j)}` }
function descScale(i, sc)        { return `${rsub(i)} ← ${fstr(sc)}·${rsub(i)}` }
function descAdd(target, sc, source) {
  const absN  = Math.abs(sc.n)
  const sign  = sc.n < 0 ? ' − ' : ' + '
  const coeff = absN === 1 && sc.d === 1 ? '' : `${fstr(frac(absN, sc.d))}·`
  return `${rsub(target)} ← ${rsub(target)}${sign}${coeff}${rsub(source)}`
}

// ─── Main component ───────────────────────────────────────────────────────────

const OPS = [
  { id: 'swap',  label: 'החלפה',  note: 'Rᵢ ↔ Rⱼ'  },
  { id: 'scale', label: 'הכפלה',  note: 'c · Rᵢ'    },
  { id: 'add',   label: 'חיבור',  note: 'Rᵢ + c·Rⱼ' },
]

export default function RowReductionEditor({ initialMatrix, augmented, className = '' }) {
  const [matrix,  setMatrix]  = useState(() =>
    initialMatrix.map(r => r.map(v => parseFrac(String(v)) ?? frac(0)))
  )
  const [history, setHistory] = useState([])
  const [opType,  setOpType]  = useState('swap')
  const [r1,      setR1]      = useState(0)
  const [r2,      setR2]      = useState(1)
  const [scalar,  setScalar]  = useState('')
  const [error,   setError]   = useState(null)

  const n = matrix.length

  function getPreview() {
    if (opType === 'swap') {
      return r1 !== r2 ? descSwap(r1, r2) : null
    }
    const sc = parseFrac(scalar)
    if (!sc || sc.n === 0) return null
    if (opType === 'scale') return descScale(r1, sc)
    if (opType === 'add')   return r1 !== r2 ? descAdd(r1, sc, r2) : null
  }

  function wrap(setter) { return v => { setter(v); setError(null) } }

  function apply() {
    setError(null)

    if (opType === 'swap') {
      const { ok, error: err } = isLegalRowOperation({ type: 'swap', rowA: r1, rowB: r2 }, n)
      if (!ok) return setError(err)
      setMatrix(m => swapRows(m, r1, r2))
      setHistory(h => [...h, descSwap(r1, r2)])

    } else if (opType === 'scale') {
      const sc = parseFrac(scalar)
      if (!sc) return setError('הכנס סקלר חוקי — כגון 3, −2, 1/2')
      const { ok, error: err } = isLegalRowOperation({ type: 'scale', row: r1, scalar: sc }, n)
      if (!ok) return setError(err)
      setMatrix(m => multiplyRow(m, r1, sc))
      setHistory(h => [...h, descScale(r1, sc)])

    } else {
      const sc = parseFrac(scalar)
      if (!sc) return setError('הכנס סקלר חוקי — כגון 3, −2, 1/2')
      // r1 = target row, r2 = source row
      const { ok, error: err } = isLegalRowOperation({ type: 'add', sourceRow: r2, targetRow: r1, scalar: sc }, n)
      if (!ok) return setError(err)
      setMatrix(m => addMultipleOfRow(m, r2, r1, sc))
      setHistory(h => [...h, descAdd(r1, sc, r2)])
    }
  }

  const preview     = getPreview()
  const displayRows = matrix.map(r => r.map(fstr))

  return (
    <div className={`space-y-3 ${className}`}>

      {/* ── Current matrix ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-5">
        <MatrixDisplay rows={displayRows} augmented={augmented} block />
      </div>

      {/* ── Operation type selector ── */}
      <div className="grid grid-cols-3 gap-2">
        {OPS.map(op => (
          <button
            key={op.id}
            onClick={() => { setOpType(op.id); setError(null) }}
            className={`rounded-xl py-3 px-2 text-center transition-colors ${
              opType === op.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="text-sm font-semibold">{op.label}</div>
            <div className={`text-xs font-mono mt-0.5 ${opType === op.id ? 'text-blue-200' : 'text-gray-400'}`}>
              {op.note}
            </div>
          </button>
        ))}
      </div>

      {/* ── Parameters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        {opType === 'swap' && (
          <>
            <RowPicker label="שורה ראשונה" value={r1} onChange={wrap(setR1)} count={n} />
            <RowPicker label="שורה שנייה"  value={r2} onChange={wrap(setR2)} count={n} />
          </>
        )}
        {opType === 'scale' && (
          <>
            <RowPicker label="שורה"  value={r1} onChange={wrap(setR1)} count={n} />
            <ScalarField value={scalar} onChange={wrap(setScalar)} />
          </>
        )}
        {opType === 'add' && (
          <>
            <RowPicker label={`שורת יעד (${rsub(r1)})`}  value={r1} onChange={wrap(setR1)} count={n} />
            <ScalarField value={scalar} onChange={wrap(setScalar)} />
            <RowPicker label={`שורת מקור (${rsub(r2)})`} value={r2} onChange={wrap(setR2)} count={n} />
          </>
        )}
      </div>

      {/* ── Live preview or error ── */}
      {error ? (
        <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : preview ? (
        <div className="font-mono text-base text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center" dir="ltr">
          {preview}
        </div>
      ) : null}

      {/* ── Apply ── */}
      <button
        onClick={apply}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl py-3.5 text-base transition-colors"
      >
        החל פעולה
      </button>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">פעולות שבוצעו</p>
          <ol className="space-y-1.5">
            {history.map((entry, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 shrink-0 w-5">{i + 1}.</span>
                <span className="font-mono text-sm text-gray-700" dir="ltr">{entry}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RowPicker({ label, value, onChange, count }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`h-10 min-w-[2.75rem] px-3 rounded-full text-sm font-bold font-mono transition-colors ${
              value === i
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rsub(i)}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScalarField({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">סקלר</p>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="כגון: 3 , −2 , 1/2"
        dir="ltr"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xl font-mono text-center outline-none focus:border-blue-400 bg-white placeholder-gray-300"
      />
    </div>
  )
}
