import { Link } from 'react-router-dom'

export default function GlobalHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-center">
      <Link
        to="/"
        className="text-sm font-bold text-white tracking-tight hover:text-indigo-300 transition-colors"
      >
        אלגברה לינארית
      </Link>
    </header>
  )
}
