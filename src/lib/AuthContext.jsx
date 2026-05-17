import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseEnabled } from './supabaseClient'

/**
 * AuthContext
 *
 * When Supabase is not configured (isSupabaseEnabled = false), the context
 * returns a stable "no auth required" state so the app keeps working with
 * localStorage only and no login screen.
 *
 * When Supabase IS configured, session is required to access protected routes.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined → loading, null → no session, object → active session
  const [session, setSession] = useState(undefined)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setSession(null)
      return
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s ?? null)
      setAuthError(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    if (!supabase) return { error: { message: 'Supabase לא מוגדר' } }
    setAuthError(null)
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setAuthError(result.error.message)
    return result
  }

  async function signUp(email, password, displayName) {
    if (!supabase) return { error: { message: 'Supabase לא מוגדר' } }
    setAuthError(null)
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (result.error) setAuthError(result.error.message)
    return result
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user:       session?.user ?? null,
        loading:    session === undefined,
        authError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
