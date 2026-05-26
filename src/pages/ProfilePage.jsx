import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/ui/BottomNav'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseEnabled } from '../lib/supabaseClient'
import { getPendingReviewCount } from '../utils/progressStorage'
import { useProgressData } from '../lib/useProgressData'
import { isDarkModeOn, setDarkMode } from '../utils/darkMode'
import modules from '../data/modules'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const { completedLessons, totalCorrect, totalWrong, currentStreak } = useProgressData(user?.id)
  const pendingReviews  = getPendingReviewCount()
  const totalAnswered   = totalCorrect + totalWrong
  const accuracyPct     = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null
  const totalCompleted  = modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => completedLessons.has(l.id)).length,
    0
  )

  const [darkMode, setDarkModeState] = useState(isDarkModeOn)

  const displayName = user?.user_metadata?.display_name ?? null
  const email       = user?.email ?? null

  function handleDarkToggle() {
    const next = !darkMode
    setDarkModeState(next)
    setDarkMode(next)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">הפרופיל שלי</h1>
      </header>

      <main className="px-4 py-6 space-y-5">

        {/* ── Avatar + identity ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {displayName && (
              <p className="font-bold text-gray-900 text-base truncate">{displayName}</p>
            )}
            {email ? (
              <p className="text-sm text-gray-400 truncate" dir="ltr">{email}</p>
            ) : (
              <p className="text-sm text-gray-400">מצב אנונימי</p>
            )}
          </div>
        </div>

        {/* ── Appearance ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <MoonIcon />
              <span className="text-sm font-medium text-gray-700">מצב כהה</span>
            </div>
            <DarkToggle enabled={darkMode} onToggle={handleDarkToggle} />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          <StatRow label="שיעורים שהושלמו" value={totalCompleted > 0 ? String(totalCompleted) : '—'} />
          <StatRow label="שאלות שנענו"     value={totalAnswered > 0 ? String(totalAnswered)   : '—'} />
          <StatRow
            label="דיוק ממוצע"
            value={accuracyPct !== null ? `${accuracyPct}%` : '—'}
            highlight={accuracyPct !== null && accuracyPct >= 80}
          />
          <StatRow
            label="ימי רצף"
            value={currentStreak > 0 ? String(currentStreak) : '—'}
            highlight={currentStreak >= 3}
          />
          {pendingReviews > 0 && (
            <StatRow
              label="ממתינות לחזרה"
              value={String(pendingReviews)}
              accent="orange"
            />
          )}
        </div>

        {/* ── Auth actions ── */}
        {isSupabaseEnabled ? (
          <button
            onClick={handleSignOut}
            className="w-full bg-white border border-red-100 text-red-600 font-semibold rounded-2xl py-4 text-sm hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            התנתק
          </button>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center space-y-1">
            <p className="text-sm font-semibold text-gray-600">שמירת התקדמות בענן</p>
            <p className="text-xs text-gray-400">
              הגדר את משתני הסביבה של Supabase כדי להפעיל חשבון משתמש.
            </p>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  )
}

function DarkToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full shadow-sm transition-transform duration-200 bg-white toggle-thumb ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

function StatRow({ label, value, highlight = false, accent = null }) {
  const valueClass = accent === 'orange'
    ? 'text-orange-500'
    : highlight
      ? 'text-blue-600'
      : 'text-gray-900'

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}
