import { NavLink } from 'react-router-dom'

const HomeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ReviewIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M1 4v6h6" />
    <path d="M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const TABS = [
  { to: '/', label: 'בית', Icon: HomeIcon, end: true },
  { to: '/review', label: 'חזרה', Icon: ReviewIcon, end: false },
  { to: '/profile', label: 'פרופיל', Icon: UserIcon, end: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex z-10 pb-safe">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 bg-indigo-500 rounded-b-full" />
              )}
              <Icon />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
