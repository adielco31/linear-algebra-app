import { useLocation, useNavigate } from 'react-router-dom'
import allQuestions from '../data/questions'
import modules from '../data/modules'
import ProgressBar from '../components/ui/ProgressBar'
import { getLessonProgress, getPendingReviewCount } from '../utils/progressStorage'
import { useProgressData } from '../lib/useProgressData'
import { useAuth } from '../lib/AuthContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadSession(sessionId) {
  try {
    const sessions = JSON.parse(localStorage.getItem('la_sessions') ?? '[]')
    if (sessionId) {
      const byId = sessions.find(s => s.id === sessionId)
      if (byId) return byId
    }
    return sessions.length > 0 ? sessions[sessions.length - 1] : null
  } catch { return null }
}

function findLesson(lessonId) {
  for (const mod of modules) {
    const lesson = mod.lessons.find(l => l.id === lessonId)
    if (lesson) return { lesson, module: mod }
  }
  return null
}

function findModuleId(lessonId) {
  for (const mod of modules) {
    if (mod.lessons.some(l => l.id === lessonId)) return mod.id
  }
  return 'row-reduction'
}

function scoreLabel(pct, isPerfect) {
  if (isPerfect)  return 'מושלם!'
  if (pct >= 80)  return 'כל הכבוד!'
  if (pct >= 60)  return 'עבודה טובה!'
  return 'כמעט שם!'
}

function motivationText(pct, isPerfect) {
  if (isPerfect)  return 'שלטת בכל החומר בשיעור זה. אתה מוכן להמשיך קדימה!'
  if (pct >= 80)  return 'הבנה מצוינת. עוד תרגול קטן ותשלוט בנושא לגמרי.'
  if (pct >= 60)  return 'בסיס טוב! כדאי לחזור על הנושאים שהתקשית בהם לפני שממשיכים.'
  return 'אל תתייאש — כל טעות היא חלק מהלמידה. חזור על הנושאים ונסה שוב.'
}

const QUESTION_MAP = Object.fromEntries(allQuestions.map(q => [q.id, q]))

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const session = loadSession(state?.sessionId)

  // Progress hook must be called unconditionally (Rules of Hooks)
  const { completedLessons: cl, answeredQuestions: aq } = useProgressData(user?.id)

  if (!session) return <EmptyState />

  const { correctCount, total, lessonId, answers } = session
  const wrongCount  = total - correctCount
  const percentage  = Math.round((correctCount / total) * 100)
  const isPerfect   = correctCount === total
  const moduleId    = findModuleId(lessonId)

  // Progress data — already loaded by the hook above
  const completedLessons  = cl
  const answeredQuestions = aq
  const pendingReviews = getPendingReviewCount()
  const found = findLesson(lessonId)
  const lessonQuestionIds = found?.lesson?.questionIds ?? []
  const lessonProg = getLessonProgress(lessonQuestionIds, answeredQuestions)
  const isLessonComplete = completedLessons.has(lessonId)

  // Topics the student got wrong — deduplicated, preserving order
  const seen = new Set()
  const struggledTopics = answers
    .filter(a => !a.isCorrect)
    .map(a => QUESTION_MAP[a.questionId]?.topic)
    .filter(t => t && !seen.has(t) && seen.add(t))

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-slate-200 px-4 pt-10 pb-8 flex flex-col items-center text-center">
        <ScoreRing percentage={percentage} isPerfect={isPerfect} />
        <h1 className="text-2xl font-bold text-slate-900 mt-5">
          {scoreLabel(percentage, isPerfect)}
        </h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs">
          {motivationText(percentage, isPerfect)}
        </p>
      </div>

      <main className="flex-1 px-4 py-5 space-y-4 pb-44">

        {/* ── Stats card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <StatRow
            icon={<CheckIcon />}
            label="תשובות נכונות"
            value={correctCount}
            total={total}
            valueClass="text-green-600"
            barClass="bg-green-400"
          />
          <StatRow
            icon={<XIcon />}
            label="תשובות שגויות"
            value={wrongCount}
            total={total}
            valueClass="text-red-500"
            barClass="bg-red-400"
          />
        </div>

        {/* ── Struggled topics ── */}
        {struggledTopics.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base" aria-hidden>⚠️</span>
              <p className="text-sm font-semibold text-slate-700">נושאים שכדאי לחזור עליהם</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {struggledTopics.map(topic => (
                <span
                  key={topic}
                  className="bg-orange-50 text-orange-700 border border-orange-100 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Lesson progress card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">התקדמות בשיעור</p>
            {isLessonComplete && (
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                הושלם
              </span>
            )}
          </div>
          <ProgressBar
            value={lessonProg.answered}
            max={lessonProg.total}
            label={`${lessonProg.answered}/${lessonProg.total} שאלות הושלמו`}
            color={isLessonComplete ? 'bg-green-500' : 'bg-indigo-500'}
          />
          {pendingReviews > 0 && (
            <p className="text-xs text-orange-600">
              {pendingReviews} שאלות ממתינות לחזרה
            </p>
          )}
        </div>

        {/* ── Perfect score bonus message ── */}
        {isPerfect && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden>⭐</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">ניקוד מושלם!</p>
              <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
                השגת את כל הנקודות בשיעור זה. מוכן לאתגר הבא?
              </p>
            </div>
          </div>
        )}

      </main>

      {/* ── Fixed bottom actions ── */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-4-safe space-y-2.5">
        {wrongCount > 0 && (
          <button
            onClick={() => navigate('/review', { state: { sessionId: session.id, lessonId } })}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl py-3.5 text-base transition-colors flex items-center justify-center gap-2"
          >
            <RepeatIcon />
            חזור על הטעויות ({wrongCount})
          </button>
        )}
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(`/practice/${lessonId}`)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            תרגל שוב
          </button>
          <button
            onClick={() => navigate(`/module/${moduleId}`)}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl py-3 text-sm hover:bg-slate-700 transition-colors"
          >
            חזור לשיעורים
          </button>
        </div>
        <button
          onClick={() => navigate(`/feedback/${lessonId}`, { state: { sessionId: session.id } })}
          className="w-full text-center text-xs text-slate-500 hover:text-indigo-400 py-0.5 transition-colors"
        >
          רוצה לשתף משוב על השיעור?
        </button>
      </div>

    </div>
  )
}

// ─── ScoreRing ────────────────────────────────────────────────────────────────

function ScoreRing({ percentage, isPerfect }) {
  const size     = 128
  const stroke   = 10
  const radius   = (size - stroke) / 2
  const circ     = 2 * Math.PI * radius
  const offset   = circ * (1 - percentage / 100)

  let ringColor, bgColor, textColor
  if (isPerfect)        { ringColor = '#f59e0b'; bgColor = 'bg-yellow-50'; textColor = 'text-yellow-600' }
  else if (percentage >= 80) { ringColor = '#22c55e'; bgColor = 'bg-green-50';  textColor = 'text-green-600'  }
  else if (percentage >= 60) { ringColor = '#6366f1'; bgColor = 'bg-indigo-50';  textColor = 'text-indigo-600' }
  else                       { ringColor = '#f97316'; bgColor = 'bg-orange-50'; textColor = 'text-orange-600' }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f3f4f6" strokeWidth={stroke}
        />
        {/* progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full`}>
        <span className={`text-3xl font-black tabular-nums ${textColor}`}>{percentage}%</span>
      </div>
    </div>
  )
}

// ─── StatRow ─────────────────────────────────────────────────────────────────

function StatRow({ icon, label, value, total, valueClass, barClass }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`shrink-0 ${valueClass}`}>{icon}</span>
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <span className={`font-bold text-base tabular-nums ${valueClass}`}>
          {value}<span className="text-slate-300 font-normal text-sm">/{total}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="text-4xl" aria-hidden>📊</p>
      <p className="text-lg font-bold text-slate-900">אין תוצאות עדיין</p>
      <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
        לא נמצא סשן תרגול שמור. התחל תרגול כדי לראות את הציון שלך כאן.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 bg-indigo-600 text-white font-semibold rounded-xl px-6 py-3 text-sm"
      >
        חזור לדף הבית
      </button>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RepeatIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
)
