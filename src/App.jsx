import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import GlobalHeader from './components/ui/GlobalHeader'

import HomePage from './pages/HomePage'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'
import PracticePage from './pages/PracticePage'
import ResultsPage from './pages/ResultsPage'
import MistakesReviewPage from './pages/MistakesReviewPage'
import ProfilePage from './pages/ProfilePage'
import RowEditorPage from './pages/RowEditorPage'
import FeedbackPage from './pages/FeedbackPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalHeader />
        <div className="pt-10">
        <Routes>
          {/* ── Public ── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Protected ── */}
          <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          } />
          <Route path="/module/:moduleId" element={
            <ProtectedRoute><ModulePage /></ProtectedRoute>
          } />
          <Route path="/lesson/:lessonId" element={
            <ProtectedRoute><LessonPage /></ProtectedRoute>
          } />
          <Route path="/practice/:lessonId" element={
            <ProtectedRoute><PracticePage /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><ResultsPage /></ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute><MistakesReviewPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/row-editor" element={
            <ProtectedRoute><RowEditorPage /></ProtectedRoute>
          } />
          <Route path="/feedback/:lessonId" element={
            <ProtectedRoute><FeedbackPage /></ProtectedRoute>
          } />
        </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
