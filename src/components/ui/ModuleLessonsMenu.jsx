import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import modules from '../../data/modules'
import { getProgress } from '../../utils/progressStorage'

// Shown in the GlobalHeader when the user is on a PracticePage.
// Desktop: fixed dropdown below the header button.
// Mobile (<sm): backdrop + bottom sheet.
export default function ModuleLessonsMenu({ lessonId }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Resolve module + ordered lessons for this lessonId
  let currentModule = null
  let moduleLessons  = []
  for (const mod of modules) {
    if (mod.lessons.some(l => l.id === lessonId)) {
      currentModule = mod
      moduleLessons  = mod.lessons
      break
    }
  }

  // Sync read from localStorage — no async, no flicker
  const { completedLessons } = getProgress()

  // Close when the user clicks/taps outside the container.
  // The fixed panels are DOM children of containerRef, so contains() works.
  // The mobile backdrop handles its own close via onClick.
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  function handleSelect(id) {
    setOpen(false)
    navigate(`/lesson/${id}`)
  }

  // Shared lesson row JSX used by both desktop and mobile panels
  const lessonItems = moduleLessons.map((lesson, i) => {
    const isCurrent = lesson.id === lessonId
    const isDone    = completedLessons.has(lesson.id)
    return (
      <li key={lesson.id} role="none">
        <button
          role="menuitem"
          onClick={() => handleSelect(lesson.id)}
          className={`w-full text-start px-4 py-3 text-sm flex items-center gap-3 transition-colors border-b border-slate-700/40 last:border-0 ${
            isCurrent
              ? 'bg-slate-700/60 text-white'
              : 'text-slate-300 hover:bg-slate-700 active:bg-slate-600'
          }`}
        >
          {/* Lesson number / done badge */}
          <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
            isCurrent
              ? 'bg-indigo-500 text-white'
              : isDone
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-700 text-slate-400'
          }`}>
            {isDone && !isCurrent ? <CheckIcon /> : i + 1}
          </span>

          {/* Title */}
          <span className={`flex-1 leading-snug ${isCurrent ? 'font-semibold' : ''}`}>
            {lesson.title}
          </span>

          {/* Active dot */}
          {isCurrent && (
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
          )}
        </button>
      </li>
    )
  })

  return (
    <div ref={containerRef}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`p-2 rounded-full transition-colors ${
          open
            ? 'text-white bg-slate-700'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        aria-label="שיעורי המודול"
        aria-expanded={open}
      >
        <MenuListIcon />
      </button>

      {open && (
        <>
          {/* ── Mobile: backdrop + bottom sheet (hidden on sm+) ── */}
          <div
            className="fixed inset-0 bg-black/50 z-[59] sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[60] sm:hidden bg-slate-800 border-t border-slate-700 rounded-t-2xl shadow-2xl flex flex-col max-h-[70svh]"
            role="menu"
          >
            {/* Bottom sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {currentModule?.title ?? 'שיעורי המודול'}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                aria-label="סגור"
              >
                <XSmallIcon />
              </button>
            </div>
            <ul className="overflow-y-auto flex-1">
              {lessonItems}
            </ul>
          </div>

          {/* ── Desktop: dropdown (hidden on <sm) ── */}
          <div
            className="fixed top-10 left-1 w-72 bg-slate-800 border border-slate-700 border-t-0 rounded-b-2xl shadow-2xl z-[60] overflow-hidden hidden sm:block"
            role="menu"
          >
            {/* Module title */}
            <div className="px-4 py-2.5 border-b border-slate-700 bg-slate-900/60">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
                {currentModule?.title ?? 'שיעורי המודול'}
              </p>
            </div>
            <ul className="max-h-[calc(100svh-6rem)] overflow-y-auto">
              {lessonItems}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const MenuListIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="8"  y1="6"  x2="21" y2="6"  />
    <line x1="8"  y1="12" x2="21" y2="12" />
    <line x1="8"  y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6"  r="0.5" fill="currentColor" />
    <circle cx="3" cy="12" r="0.5" fill="currentColor" />
    <circle cx="3" cy="18" r="0.5" fill="currentColor" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XSmallIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
)
