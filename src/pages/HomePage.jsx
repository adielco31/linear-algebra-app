import { Link } from 'react-router-dom'
import BottomNav from '../components/ui/BottomNav'
import ProgressBar from '../components/ui/ProgressBar'
import { getPendingReviewCount, getLessonProgress } from '../utils/progressStorage'
import { useProgressData } from '../lib/useProgressData'
import { useAuth } from '../lib/AuthContext'
import modules from '../data/modules'

const MODULE = modules[0]

// ─── Motivational text based on progress ─────────────────────────────────────

function getMotivation(completedCount, total) {
  if (completedCount === 0)    return 'כל דבר גדול מתחיל בצעד קטן. הנה השלך.'
  if (completedCount === total) return 'השלמת את המודול. כל הכבוד — זה לא פשוט.'
  if (completedCount / total >= 0.6) return 'יותר ממחצית הדרך. אל תפסיק עכשיו.'
  return 'אתה מתקדם. כל שיעור בונה על הקודם.'
}

function getCTA(completedCount, total) {
  if (completedCount === 0)    return 'התחל ללמוד'
  if (completedCount === total) return 'עיין במודול'
  return 'המשך ללמוד'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user }   = useAuth()
  const { completedLessons, totalCorrect, totalWrong, currentStreak, answeredQuestions } = useProgressData(user?.id)
  const pendingReviews = getPendingReviewCount()

  const totalAnswered  = totalCorrect + totalWrong
  const accuracyPct    = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null

  const completedCount = MODULE.lessons.filter(l => completedLessons.has(l.id)).length
  const progressPct    = Math.round((completedCount / MODULE.lessons.length) * 100)

  const motivation = getMotivation(completedCount, MODULE.lessons.length)
  const cta        = getCTA(completedCount, MODULE.lessons.length)

  // Find the next unlocked lesson to link to
  const nextLesson = MODULE.lessons.find(l => !completedLessons.has(l.id)) ?? MODULE.lessons[0]

  return (
    <div className="min-h-screen bg-slate-100 pb-20">

      {/* ── Hero ── */}
      <header className="bg-slate-900 px-5 pt-10 pb-8">
        <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-1">
          ברוך הבא
        </p>
        <h1 className="text-2xl font-black text-white leading-tight">
          שלום, סטודנט
        </h1>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          {motivation}
        </p>
      </header>

      <main className="px-4 pt-5 pb-4 space-y-4">

        {/* ── Module progress card ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Module meta */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                מודול ראשון
              </p>
              <span className="text-xs font-semibold text-indigo-600 tabular-nums">
                {progressPct}%
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug mt-1">
              {MODULE.title}
            </h2>

            <ProgressBar
              value={completedCount}
              max={MODULE.lessons.length}
              color={completedCount === MODULE.lessons.length ? 'bg-emerald-500' : 'bg-indigo-500'}
              className="mt-4"
            />

            <p className="text-xs text-slate-400 mt-2">
              {completedCount} מתוך {MODULE.lessons.length} שיעורים הושלמו
            </p>
          </div>

          {/* CTA */}
          <Link
            to={`/lesson/${nextLesson.id}`}
            className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-5 py-4 transition-colors"
          >
            <span className="text-white font-semibold text-base">{cta}</span>
            <ArrowIcon />
          </Link>
        </section>

        {/* ── All lessons ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              כל השיעורים
            </p>
            <span className="text-xs text-slate-300 tabular-nums">
              {completedCount}/{MODULE.lessons.length}
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {MODULE.lessons.map((lesson, i) => {
              const isCompleted = completedLessons.has(lesson.id)
              const lessonProg  = getLessonProgress(lesson.questionIds ?? [], answeredQuestions)
              const pct         = isCompleted ? 100 : lessonProg.pct

              return (
                <Link
                  key={lesson.id}
                  to={`/lesson/${lesson.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  {isCompleted ? (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <SmallCheckIcon />
                    </div>
                  ) : (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug truncate ${
                      isCompleted ? 'text-slate-400' : 'text-slate-800'
                    }`}>
                      {lesson.title}
                    </p>
                    {pct > 0 && pct < 100 && (
                      <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-1 bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>

                  <span className={`shrink-0 text-xs font-medium ${
                    isCompleted ? 'text-emerald-500' : pct > 0 ? 'text-indigo-500' : 'text-slate-300'
                  }`}>
                    {isCompleted ? 'הושלם' : pct > 0 ? `${pct}%` : ''}
                  </span>

                  <ChevronLeftIcon />
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Review mistakes ── */}
        {pendingReviews > 0 && (
          <Link
            to="/review"
            className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <RepeatIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-900">חזרה על טעויות</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {pendingReviews === 1
                  ? 'שאלה אחת ממתינה לחזרה'
                  : `${pendingReviews} שאלות ממתינות לחזרה`}
              </p>
            </div>
            <span className="shrink-0 text-2xl font-black text-amber-400 tabular-nums">
              {pendingReviews}
            </span>
          </Link>
        )}

        {/* ── Stats ── */}
        {totalAnswered > 0 && (
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-1">
              הסטטיסטיקה שלך
            </p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="רצף ימים"
                value={currentStreak > 0 ? String(currentStreak) : '—'}
                sub={currentStreak >= 3 ? 'כל הכבוד' : null}
                highlight={currentStreak >= 3}
              />
              <StatCard
                label="שאלות"
                value={String(totalAnswered)}
              />
              <StatCard
                label="דיוק"
                value={accuracyPct !== null ? `${accuracyPct}%` : '—'}
                highlight={accuracyPct !== null && accuracyPct >= 80}
              />
            </div>
          </section>
        )}

        {/* ── Product promise ── */}
        {totalAnswered === 0 && (
          <div className="bg-indigo-600 rounded-2xl px-5 py-5">
            <p className="text-sm font-semibold text-white leading-relaxed">
              למה להתאמץ עם אלגברה לינארית לבד?
            </p>
            <p className="text-sm text-indigo-200 mt-2 leading-relaxed">
              תרגל שלב אחר שלב, קבל משוב מיידי, וחזור על מה שקשה לך — בדיוק כשצריך.
            </p>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub = null, highlight = false }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <p className={`text-xl font-bold tabular-nums ${highlight ? 'text-indigo-600' : 'text-slate-900'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-indigo-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ArrowIcon = () => (
  <svg className="w-5 h-5 text-white opacity-80 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const RepeatIcon = () => (
  <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
)

const SmallCheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4 text-gray-300 shrink-0 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
