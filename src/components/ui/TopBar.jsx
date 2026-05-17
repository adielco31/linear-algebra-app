import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import modules from '../../data/modules'
import { getLessonProgress } from '../../utils/progressStorage'
import { useProgressData } from '../../lib/useProgressData'
import { useAuth } from '../../lib/AuthContext'

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronRight = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function MatrixIcon() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
      <rect x="1"  y="1"  width="4" height="4" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="6"  y="1"  width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="11" y="1"  width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="1"  y="6"  width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="6"  y="6"  width="4" height="4" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="11" y="6"  width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="1"  y="11" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="6"  y="11" width="4" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="11" y="11" width="4" height="4" rx="1" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

// ─── LessonsSidebar ───────────────────────────────────────────────────────────

function LessonsSidebar({ open, onClose }) {
  const { user }   = useAuth()
  const { completedLessons, answeredQuestions } = useProgressData(user?.id)
  const module = modules[0]

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel — slides from the left edge (visual right in RTL) */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-[70] w-72 bg-white shadow-2xl flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">שיעורים</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="סגור תפריט"
          >
            <XIcon />
          </button>
        </div>

        {/* Module label */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 pt-4 pb-2">
          {module.title}
        </p>

        {/* Lesson list */}
        <nav className="flex-1 overflow-y-auto">
          {module.lessons.map((lesson, i) => {
            const isCompleted = completedLessons.has(lesson.id)
            const prog        = getLessonProgress(lesson.questionIds ?? [], answeredQuestions)
            const pct         = isCompleted ? 100 : prog.pct

            return (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50"
              >
                {/* Status badge */}
                {isCompleted ? (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckIcon />
                  </div>
                ) : (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                )}

                {/* Title + progress */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug truncate ${
                    isCompleted ? 'text-gray-400' : 'text-gray-800'
                  }`}>
                    {lesson.title}
                  </p>
                  {pct > 0 && pct < 100 && (
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1 bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  {isCompleted && (
                    <p className="text-xs text-green-500 mt-0.5">הושלם</p>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer — link to full module page */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Link
            to="/module/row-reduction"
            onClick={onClose}
            className="block w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            כל הפרקים →
          </Link>
        </div>
      </aside>
    </>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar({ title, variant = 'back', to }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleAction() {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 px-3 h-14 flex items-center gap-2 sticky top-10 z-10">

        {/* Back / Close button */}
        <button
          onClick={handleAction}
          className="shrink-0 p-2 -ms-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors"
          aria-label={variant === 'close' ? 'סגור' : 'חזרה'}
        >
          {variant === 'close' ? <XIcon /> : <ChevronRight />}
        </button>

        {/* Page title */}
        {title && (
          <h1 className="flex-1 text-sm font-semibold text-slate-100 truncate min-w-0">
            {title}
          </h1>
        )}

        {/* Matrix icon → opens lessons sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="תפריט שיעורים"
          className="shrink-0 p-1 rounded-xl transition-colors hover:bg-slate-800 active:bg-slate-700 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm
                          group-hover:bg-indigo-500 transition-colors">
            <MatrixIcon />
          </div>
        </button>

      </header>

      <LessonsSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
