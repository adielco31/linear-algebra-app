import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { saveFeedback } from '../lib/feedbackStorage'
import TopBar from '../components/ui/TopBar'
import modules from '../data/modules'

function findModuleId(lessonId) {
  for (const mod of modules) {
    if (mod.lessons.some(l => l.id === lessonId)) return mod.id
  }
  return 'row-reduction'
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const { lessonId } = useParams()
  const { state }    = useLocation()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [clarity,      setClarity]      = useState(null) // 1 | 2 | 3
  const [feedbackHelp, setFeedbackHelp] = useState(null) // 1 | 2 | 3
  const [difficulty,   setDifficulty]   = useState(null) // 'easy' | 'right' | 'hard'
  const [openText,     setOpenText]     = useState('')
  const [submitted,    setSubmitted]    = useState(false)

  const moduleId = findModuleId(lessonId)
  const backTo   = `/module/${moduleId}`

  function handleSubmit() {
    saveFeedback({
      lessonId,
      sessionId:   state?.sessionId ?? null,
      userId:      user?.id ?? null,
      clarity,
      feedbackHelp,
      difficulty,
      openText,
    })
    setSubmitted(true)
    setTimeout(() => navigate(backTo), 1800)
  }

  if (submitted) return <ThankYou />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar title="משוב על השיעור" variant="close" to={backTo} />

      <main className="flex-1 px-4 py-5 space-y-4 pb-32">

        <p className="text-sm text-gray-500 leading-relaxed">
          עזור לנו לשפר את החומר. המשוב אנונימי ולוקח פחות מדקה.
        </p>

        {/* Q1 */}
        <QuestionCard label="האם ההסבר בשיעור היה ברור?">
          <SegmentControl
            value={clarity}
            onChange={setClarity}
            options={[
              { value: 1, label: 'לא ממש' },
              { value: 2, label: 'פחות'  },
              { value: 3, label: 'ברור מאוד' },
            ]}
          />
        </QuestionCard>

        {/* Q2 */}
        <QuestionCard label="האם הפידבק עזר להבין את הטעויות?">
          <SegmentControl
            value={feedbackHelp}
            onChange={setFeedbackHelp}
            options={[
              { value: 1, label: 'לא עזר'   },
              { value: 2, label: 'קצת'       },
              { value: 3, label: 'עזר מאוד' },
            ]}
          />
        </QuestionCard>

        {/* Q3 */}
        <QuestionCard label="איך הרגשת את רמת הקושי של התרגול?">
          <SegmentControl
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'easy',  label: 'קל מדי'  },
              { value: 'right', label: 'מתאים'   },
              { value: 'hard',  label: 'קשה מדי' },
            ]}
            colorMap={{ easy: 'teal', right: 'blue', hard: 'orange' }}
          />
        </QuestionCard>

        {/* Q4 */}
        <QuestionCard label="מה עדיין לא ברור?" hint="אופציונלי">
          <textarea
            value={openText}
            onChange={e => setOpenText(e.target.value)}
            placeholder="למשל: לא הבנתי איך לזהות ציר מוביל..."
            rows={3}
            className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition leading-relaxed"
          />
        </QuestionCard>

      </main>

      {/* ── Fixed bottom ── */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-4-safe space-y-2.5">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl py-3.5 text-base transition-colors"
        >
          שלח משוב
        </button>
        <button
          onClick={() => navigate(backTo)}
          className="w-full text-center text-sm text-slate-500 py-1"
        >
          דלג — אין לי משוב כרגע
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuestionCard({ label, hint, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug flex-1">{label}</p>
        {hint && <span className="text-xs text-gray-400 shrink-0">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const COLOR_CLASSES = {
  blue:   { selected: 'bg-blue-600 text-white border-blue-600',   idle: 'text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'   },
  teal:   { selected: 'bg-teal-600 text-white border-teal-600',   idle: 'text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'   },
  orange: { selected: 'bg-orange-500 text-white border-orange-500', idle: 'text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600' },
}

function SegmentControl({ value, onChange, options, colorMap = {} }) {
  return (
    <div className="flex gap-2">
      {options.map(opt => {
        const isSelected = value === opt.value
        const colorKey   = colorMap[opt.value] ?? 'blue'
        const colors     = COLOR_CLASSES[colorKey] ?? COLOR_CLASSES.blue
        return (
          <button
            key={opt.value}
            onClick={() => onChange(isSelected ? null : opt.value)}
            className={`flex-1 text-xs font-semibold rounded-xl border py-2.5 px-1 transition-colors ${
              isSelected ? colors.selected : colors.idle
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Thank-you screen ────────────────────────────────────────────────────────

function ThankYou() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="text-xl font-bold text-gray-900">תודה על המשוב!</p>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        המשוב שלך עוזר לנו לשפר את החומר לכולם.
      </p>
    </div>
  )
}
