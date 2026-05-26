import { Link, useMatch } from 'react-router-dom'
import ModuleLessonsMenu from './ModuleLessonsMenu'

export default function GlobalHeader() {
  // Show the lessons menu only when the user is on a practice page
  const practiceMatch = useMatch('/practice/:lessonId')
  const activeLessonId = practiceMatch?.params?.lessonId ?? null

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-center">
      {/* Left slot: module lessons menu, visible on practice pages only */}
      {activeLessonId && (
        <div className="absolute left-0 inset-y-0 flex items-center px-1">
          <ModuleLessonsMenu lessonId={activeLessonId} />
        </div>
      )}

      <Link
        to="/"
        className="text-sm font-bold text-white tracking-tight hover:text-indigo-300 transition-colors"
      >
        אלגברה לינארית
      </Link>
    </header>
  )
}
