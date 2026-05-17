import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const from = location.state?.from ?? '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(translateError(err.message))
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-5 pt-14 pb-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">
          אלגברה לינארית
        </p>
        <h1 className="text-2xl font-black text-gray-900">התחברות</h1>
        <p className="text-sm text-gray-400 mt-1">ברוך שובך — המשך מאיפה שעצרת</p>
      </div>

      {/* ── Form ── */}
      <main className="flex-1 px-5 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-sm mx-auto">

          <Field
            label="אימייל"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Field
            label="סיסמה"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-base transition-colors mt-2"
          >
            {loading ? 'מתחבר…' : 'התחבר'}
          </button>

        </form>

        <p className="text-sm text-center text-gray-400 mt-8">
          אין לך חשבון?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            הירשם עכשיו
          </Link>
        </p>
      </main>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir="ltr"
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-blue-400 bg-white placeholder-gray-300 transition-colors"
      />
    </div>
  )
}

// ─── Error translation ────────────────────────────────────────────────────────

function translateError(msg) {
  if (!msg) return 'אירעה שגיאה, נסה שוב'
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'אימייל או סיסמה שגויים'
  if (m.includes('email not confirmed'))
    return 'יש לאשר את האימייל תחילה — בדוק את תיבת הדואר שלך'
  if (m.includes('too many requests'))
    return 'יותר מדי ניסיונות — המתן מספר דקות ונסה שוב'
  if (m.includes('network') || m.includes('fetch'))
    return 'שגיאת חיבור — בדוק את האינטרנט ונסה שוב'
  return 'אירעה שגיאה, נסה שוב'
}
