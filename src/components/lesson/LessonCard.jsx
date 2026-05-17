import { Link } from 'react-router-dom'

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function StatusBadge({ index, isLocked, isCompleted }) {
  if (isCompleted)
    return (
      <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <CheckIcon />
      </div>
    )
  if (isLocked)
    return (
      <div className="shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <LockIcon />
      </div>
    )
  return (
    <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
      {index}
    </div>
  )
}

function CardContent({ lesson, index, isLocked, isCompleted, progress }) {
  const questionCount = lesson.questionIds?.length ?? 0

  const actionLabel = isCompleted ? 'סקור שוב' : 'התחל שיעור'
  const actionStyle = isCompleted
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-indigo-600 text-white'

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow ${
        !isLocked ? 'hover:shadow-md' : 'opacity-70'
      }`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <StatusBadge index={index} isLocked={isLocked} isCompleted={isCompleted} />
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug">{lesson.title}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-3 leading-relaxed line-clamp-2">
          {lesson.shortExplanation}
        </p>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{questionCount} שאלות</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full">
          <div
            className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-5">
        {isLocked ? (
          <div className="w-full bg-slate-100 text-slate-400 font-semibold rounded-xl py-3 text-sm text-center flex items-center justify-center gap-2">
            <LockIcon />
            <span>נעול</span>
          </div>
        ) : (
          <div className={`w-full font-semibold rounded-xl py-3 text-sm text-center ${actionStyle}`}>
            {actionLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LessonCard({ lesson, index, isLocked, isCompleted, progress = 0 }) {
  if (isLocked) {
    return (
      <CardContent
        lesson={lesson}
        index={index}
        isLocked
        isCompleted={isCompleted}
        progress={progress}
      />
    )
  }

  return (
    <Link to={`/lesson/${lesson.id}`}>
      <CardContent
        lesson={lesson}
        index={index}
        isLocked={false}
        isCompleted={isCompleted}
        progress={progress}
      />
    </Link>
  )
}
