import { useParams } from 'react-router-dom'
import modules from '../data/modules'
import TopBar from '../components/ui/TopBar'
import ProgressBar from '../components/ui/ProgressBar'
import LessonCard from '../components/lesson/LessonCard'
import { getLessonProgress, getPendingReviewCount } from '../utils/progressStorage'
import { useProgressData } from '../lib/useProgressData'
import { useAuth } from '../lib/AuthContext'

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

export default function ModulePage() {
  const { moduleId } = useParams()
  const module = modules.find(m => m.id === moduleId) ?? modules[0]

  const { user } = useAuth()
  const { completedLessons, answeredQuestions } = useProgressData(user?.id)
  const pendingReviews = getPendingReviewCount()

  const completedCount = module.lessons.filter(l => completedLessons.has(l.id)).length
  const progressPct    = Math.round((completedCount / module.lessons.length) * 100)
  const allDone        = completedCount === module.lessons.length

  return (
    <div className="min-h-screen bg-slate-100">
      <TopBar title="דירוג מטריצות" to="/" />

      <main className="px-4 py-6 space-y-6">

        {/* Module header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h1 className="text-lg font-bold text-slate-900 leading-snug">{module.title}</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{module.description}</p>

          <ProgressBar
            value={completedCount}
            max={module.lessons.length}
            label={`${completedCount}/${module.lessons.length} שיעורים הושלמו`}
            className="mt-5"
          />

          {pendingReviews > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
              <span className="text-orange-500 text-sm font-bold tabular-nums">{pendingReviews}</span>
              <span className="text-orange-700 text-sm">שאלות ממתינות לחזרה</span>
            </div>
          )}
        </div>

        {/* Lessons */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            שיעורים
          </h2>
          <div className="space-y-3">
            {module.lessons.map((lesson, i) => {
              const isCompleted = completedLessons.has(lesson.id)
              const lessonProg  = getLessonProgress(lesson.questionIds ?? [], answeredQuestions)
              const isLocked    = i > 0 && !completedLessons.has(module.lessons[i - 1].id)

              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i + 1}
                  isLocked={isLocked}
                  isCompleted={isCompleted}
                  progress={isCompleted ? 100 : lessonProg.pct}
                />
              )
            })}
          </div>
        </section>

        {/* Chapter test */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            סיום
          </h2>
          <ChapterTestCard isLocked={!allDone} />
        </section>

      </main>
    </div>
  )
}

function ChapterTestCard({ isLocked }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${
        isLocked ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            isLocked ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          {isLocked ? (
            <LockIcon />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">מבחן סוף פרק</h3>
          <p className="text-sm text-slate-500 mt-1">
            {isLocked
              ? 'יפתח לאחר השלמת כל 5 השיעורים'
              : '20 שאלות · כולל כל הנושאים שלמדת'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div
          className={`w-full font-semibold rounded-xl py-3 text-sm text-center ${
            isLocked
              ? 'bg-slate-100 text-slate-400 flex items-center justify-center gap-2'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {isLocked ? (
            <>
              <LockIcon />
              <span>נעול</span>
            </>
          ) : (
            'התחל מבחן'
          )}
        </div>
      </div>
    </div>
  )
}
