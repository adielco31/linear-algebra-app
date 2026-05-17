import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/ui/BottomNav'
import { removeMistake, clearMistakes, isDue, formatNextReview } from '../utils/progressStorage'
import { useReviewQueue } from '../lib/useProgressData'
import { useAuth } from '../lib/AuthContext'
import allQuestions from '../data/questions'

const QUESTION_MAP = Object.fromEntries(allQuestions.map(q => [q.id, q]))
const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד']

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MistakesReviewPage() {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const userId          = user?.id ?? null
  const { queue: mistakes, setQueue: setMistakes, dueCount } = useReviewQueue(userId)

  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? mistakes : mistakes.filter(isDue)

  function handleRemove(questionId) {
    removeMistake(questionId, userId)
    setMistakes(prev => prev.filter(m => m.questionId !== questionId))
  }

  function handleClearAll() {
    clearMistakes(userId)
    setMistakes([])
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ── Header ── */}
      <header className="bg-white px-4 pt-10 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">חזרה על טעויות</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {mistakes.length === 0
                ? 'אין שאלות לחזרה'
                : dueCount > 0
                  ? `${dueCount} שאלות לחזרה עכשיו`
                  : 'אין שאלות שמגיע זמנן כרגע'}
            </p>
          </div>
          {mistakes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 font-medium hover:text-red-600 transition-colors mt-1"
            >
              נקה הכל
            </button>
          )}
        </div>

        {/* ── Toggle: due only ↔ all ── */}
        {mistakes.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowAll(false)}
              className={`text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                !showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              לחזרה עכשיו
              {dueCount > 0 && (
                <span className={`ms-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  !showAll ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-600'
                }`}>
                  {dueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAll(true)}
              className={`text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                showAll
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              כל הטעויות
              <span className={`ms-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                showAll ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {mistakes.length}
              </span>
            </button>
          </div>
        )}
      </header>

      {/* ── List ── */}
      <main className="px-4 py-5">
        {visible.length > 0 ? (
          <div className="space-y-4">
            {visible.map(mistake => (
              <MistakeCard
                key={mistake.questionId}
                mistake={mistake}
                question={QUESTION_MAP[mistake.questionId]}
                onRemove={() => handleRemove(mistake.questionId)}
                onPractice={() => navigate(`/practice/${mistake.lessonId}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState showAll={showAll} hasMistakes={mistakes.length > 0} onShowAll={() => setShowAll(true)} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

// ─── MistakeCard ──────────────────────────────────────────────────────────────

function MistakeCard({ mistake, question, onRemove, onPractice }) {
  const [expanded, setExpanded] = useState(true)

  const isNumeric      = question?.type === 'numeric-answer'
  const due            = isDue(mistake)
  const nextReview     = formatNextReview(mistake.nextReviewAt)
  const streak         = mistake.correctStreak ?? 0
  const questionText   = question?.question ?? `שאלה ${mistake.questionId}`

  // MCQ-only fields
  const selectedText   = isNumeric ? null : question?.options?.[mistake.selectedAnswer]
  const correctText    = isNumeric ? null : question?.options?.[mistake.correctAnswer]
  const selectedLabel  = isNumeric ? null : (HEBREW_LETTERS[mistake.selectedAnswer] ?? String(mistake.selectedAnswer + 1))

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
      due ? 'border-orange-200' : 'border-gray-100'
    }`}>

      {/* ── Card header (tappable) ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-start px-5 pt-4 pb-3"
      >
        <div className="flex items-start gap-3">
          {/* due / scheduled indicator */}
          <div className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
            due ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            {due ? (
              <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-relaxed line-clamp-2">
              {questionText}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* due badge or next-review time */}
              {due ? (
                <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                  לחזרה עכשיו
                </span>
              ) : (
                <span className="bg-gray-50 text-gray-400 border border-gray-100 text-xs font-medium px-2 py-0.5 rounded-full">
                  {nextReview}
                </span>
              )}

              {/* topic */}
              <span className="text-xs text-gray-400">{mistake.topic}</span>

              {/* mistake tag */}
              {mistake.mistakeTag && (
                <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full">
                  {mistake.mistakeTag}
                </span>
              )}
            </div>
          </div>

          {/* SRS streak dots + chevron */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <StreakDots streak={streak} />
            <ChevronIcon expanded={expanded} />
          </div>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-gray-100">

          {isNumeric ? (
            /* ── Numeric answer display ── */
            <div className="divide-y divide-gray-100">
              <div className="px-5 py-3 bg-red-50/60 flex items-center justify-between">
                <p className="text-xs font-semibold text-red-500">הגשת</p>
                <span className="text-xl font-black tabular-nums text-red-700 dir-ltr" dir="ltr">
                  {mistake.numericInput ?? '—'}
                  {question?.unit ? <span className="text-sm font-medium ms-1">{question.unit}</span> : null}
                </span>
              </div>
              <div className="px-5 py-3 bg-green-50/60 flex items-center justify-between">
                <p className="text-xs font-semibold text-green-600">תשובה נכונה</p>
                <span className="text-xl font-black tabular-nums text-green-700" dir="ltr">
                  {mistake.correctAnswer}
                  {question?.unit ? <span className="text-sm font-medium ms-1">{question.unit}</span> : null}
                </span>
              </div>
            </div>
          ) : (
            /* ── MCQ answer display ── */
            <>
              <div className="px-5 py-3 bg-red-50/60 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full border-2 border-red-400 bg-red-400 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {selectedLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-500 mb-0.5">בחרת — לא נכון</p>
                  <OptionText text={selectedText} className="text-sm text-red-800" />
                </div>
              </div>
              <div className="px-5 py-3 bg-green-50/60 border-t border-gray-100 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 text-white flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-600 mb-0.5">תשובה נכונה</p>
                  <OptionText text={correctText} className="text-sm text-green-800" />
                </div>
              </div>
            </>
          )}

          {/* Explanation */}
          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">הסבר</p>
            <p className="text-sm text-gray-700 leading-relaxed">{mistake.explanation}</p>
          </div>

          {/* SRS footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <SRSStatus streak={streak} wrongCount={mistake.wrongCount ?? 1} />
          </div>

          {/* Actions */}
          <div className="px-5 pb-4 pt-1 flex gap-2.5">
            <button
              onClick={onPractice}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
            >
              תרגל שוב
            </button>
            <button
              onClick={onRemove}
              className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 font-semibold rounded-xl py-2.5 text-sm transition-colors"
            >
              הבנתי — הסר
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StreakDots({ streak }) {
  return (
    <div className="flex items-center gap-0.5" title={`${streak} תשובות נכונות ברצף`}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < streak ? 'bg-green-400' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function SRSStatus({ streak, wrongCount }) {
  const streakLabels = ['', 'נכון פעם אחת', 'נכון פעמיים ברצף', 'שולט בנושא ✓']
  const label = streakLabels[Math.min(streak, 3)]
  return (
    <div className="flex items-center justify-between w-full">
      <span>{label || `טעיתי ${wrongCount} פעמים`}</span>
      {streak > 0 && <span className="text-green-500 font-medium">{streak}/3 חזרות נכונות</span>}
    </div>
  )
}

function OptionText({ text, className }) {
  if (!text) return null
  return text.includes('\n')
    ? <pre dir="ltr" className={`font-mono whitespace-pre leading-relaxed ${className}`}>{text}</pre>
    : <span className={`leading-relaxed ${className}`}>{text}</span>
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyState({ showAll, hasMistakes, onShowAll }) {
  if (hasMistakes && !showAll) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">אין שאלות לחזרה עכשיו</h2>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          כל השאלות מתוזמנות לחזרה מאוחרת יותר. חזור כאן בהמשך!
        </p>
        <button
          onClick={onShowAll}
          className="mt-1 text-sm text-blue-600 font-semibold hover:underline"
        >
          הצג את כל הטעויות
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900">הכל נקי!</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        אין שאלות שממתינות לחזרה. המשך לתרגל כדי לשמר את מה שלמדת.
      </p>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon({ expanded }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
