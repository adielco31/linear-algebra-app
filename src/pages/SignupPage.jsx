import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function SignupPage() {
  const { signUp }  = useAuth()
  const navigate    = useNavigate()

  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 6)
      return setError('הסיסמה חייבת להכיל לפחות 6 תווים')
    if (password !== confirm)
      return setError('הסיסמאות אינן תואמות')

    setLoading(true)
    const { data, error: err } = await signUp(email.trim(), password, name.trim())
    setLoading(false)

    if (err) {
      setError(translateError(err.message))
      return
    }

    // Supabase requires email confirmation by default.
    // If the session is already set (email confirmation disabled), go home.
    if (data?.session) {
      navigate('/', { replace: true })
    } else {
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return <CheckEmailScreen email={email} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-5 pt-14 pb-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">
          אלגברה לינארית
        </p>
        <h1 className="text-2xl font-black text-gray-900">הרשמה</h1>
        <p className="text-sm text-gray-400 mt-1">צור חשבון ושמור את ההתקדמות שלך</p>
      </div>

      {/* ── Form ── */}
      <main className="flex-1 px-5 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-sm mx-auto">

          <Field
            label="שם תצוגה"
            type="text"
            value={name}
            onChange={setName}
            placeholder="השם שיוצג לך"
            autoComplete="name"
            dir="rtl"
          />

          <Field
            label="אימייל"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            dir="ltr"
          />

          <Field
            label="סיסמה"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="לפחות 6 תווים"
            autoComplete="new-password"
            dir="ltr"
          />

          <Field
            label="אימות סיסמה"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            autoComplete="new-password"
            dir="ltr"
          />

          {error && (
            <div className="text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || !confirm}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-base transition-colors mt-2"
          >
            {loading ? 'יוצר חשבון…' : 'צור חשבון'}
          </button>

        </form>

        <p className="text-sm text-center text-gray-400 mt-8">
          יש לך כבר חשבון?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            התחבר
          </Link>
        </p>
      </main>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, type, value, onChange, placeholder, autoComplete, dir = 'ltr' }) {
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
        dir={dir}
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-blue-400 bg-white placeholder-gray-300 transition-colors"
      />
    </div>
  )
}

function CheckEmailScreen({ email }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">בדוק את האימייל שלך</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        שלחנו קישור אישור לכתובת{' '}
        <span className="font-semibold text-gray-700 dir-ltr" dir="ltr">{email}</span>.
        לחץ על הקישור כדי להפעיל את החשבון ולהתחבר.
      </p>
      <Link
        to="/login"
        className="mt-2 bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-blue-700 transition-colors"
      >
        חזור להתחברות
      </Link>
    </div>
  )
}

// ─── Error translation ────────────────────────────────────────────────────────

function translateError(msg) {
  if (!msg) return 'אירעה שגיאה, נסה שוב'
  const m = msg.toLowerCase()
  if (m.includes('already registered') || m.includes('user already exists'))
    return 'כתובת האימייל הזו כבר רשומה — נסה להתחבר'
  if (m.includes('password') && m.includes('weak'))
    return 'הסיסמה חלשה מדי — השתמש ב-6 תווים לפחות'
  if (m.includes('invalid email'))
    return 'כתובת האימייל אינה תקינה'
  if (m.includes('network') || m.includes('fetch'))
    return 'שגיאת חיבור — בדוק את האינטרנט ונסה שוב'
  return 'אירעה שגיאה, נסה שוב'
}
