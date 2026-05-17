import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { isSupabaseEnabled } from '../../lib/supabaseClient'

/**
 * Wraps a route that requires authentication.
 *
 * - When Supabase is not configured: renders children immediately (no auth needed).
 * - While session is loading: shows a blank screen to avoid flash.
 * - No session: redirects to /login, preserving the intended destination.
 * - Session active: renders children.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!isSupabaseEnabled) return children

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
