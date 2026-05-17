import { supabase, isSupabaseEnabled } from '../lib/supabaseClient'

const SESSIONS_KEY  = 'la_sessions'
const MISTAKES_KEY  = 'la_mistakes'
const PROGRESS_KEY  = 'la_progress'

// ─── SRS intervals (ms) ───────────────────────────────────────────────────────

const HOUR = 60 * 60 * 1000
const DAY  = 24 * HOUR

const SRS_INTERVALS = [
  HOUR,       // wrong (or streak 0)
  DAY,        // streak 1 → +1 day
  3 * DAY,    // streak 2 → +3 days
  7 * DAY,    // streak 3+ → +7 days
]

function intervalFor(isCorrect, newStreak) {
  if (!isCorrect) return SRS_INTERVALS[0]
  return SRS_INTERVALS[Math.min(newStreak, SRS_INTERVALS.length - 1)]
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function saveSession(session) {
  try {
    const existing = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify([...existing, session].slice(-100))
    )
  } catch { /* localStorage blocked or full */ }
}

export function loadLastSession() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
    return sessions.length > 0 ? sessions[sessions.length - 1] : null
  } catch { return null }
}

export function loadSessionById(id) {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
    return sessions.find(s => s.id === id) ?? null
  } catch { return null }
}

// ─── Mistakes (localStorage) ─────────────────────────────────────────────────

export function loadMistakes() {
  try {
    return JSON.parse(localStorage.getItem(MISTAKES_KEY) ?? '[]')
  } catch { return [] }
}

function persist(list) {
  try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(list)) } catch {}
}

// ─── Progress (localStorage) ─────────────────────────────────────────────────

function loadRawProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}') } catch { return {} }
}

function persistProgress(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)) } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/** Sync read from localStorage — immediate, no async. */
export function getProgress() {
  const p = loadRawProgress()
  return {
    completedLessons:  new Set(p.completedLessons  ?? []),
    answeredQuestions: new Set(p.answeredQuestions  ?? []),
    totalCorrect:      p.totalCorrect  ?? 0,
    totalWrong:        p.totalWrong    ?? 0,
    currentStreak:     p.currentStreak ?? 0,
  }
}

// ─── Supabase internal helpers (fire-and-forget callers don't await) ─────────

async function _syncProgressToSupabase({ completedLessons, currentStreak, lastUsedDate }, userId) {
  try {
    const now = new Date().toISOString()

    // Upsert completed lessons into user_progress
    const rows = [...completedLessons].map(lessonId => ({
      user_id:           userId,
      lesson_id:         lessonId,
      completed_at:      now,
      last_practiced_at: now,
      questions_answered: 0,
      questions_correct:  0,
    }))
    if (rows.length > 0) {
      await supabase
        .from('user_progress')
        .upsert(rows, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })
    }

    // Update streak in profiles
    await supabase
      .from('profiles')
      .upsert(
        { id: userId, streak_current: currentStreak, streak_last_date: lastUsedDate },
        { onConflict: 'id' }
      )
  } catch { /* silent — localStorage already has the data */ }
}

async function _syncMistakeToSupabase(mistake, userId) {
  try {
    const { data: existing } = await supabase
      .from('review_queue')
      .select('wrong_count')
      .eq('user_id', userId)
      .eq('question_id', mistake.questionId)
      .maybeSingle()

    const now        = Date.now()
    const wrongCount = (existing?.wrong_count ?? 0) + 1

    await supabase.from('review_queue').upsert({
      user_id:          userId,
      question_id:      mistake.questionId,
      lesson_id:        mistake.lessonId,
      topic:            mistake.topic       ?? null,
      explanation:      mistake.explanation ?? null,
      mistake_tag:      mistake.mistakeTag  ?? null,
      wrong_count:      wrongCount,
      correct_streak:   0,
      last_answered_at: new Date(now).toISOString(),
      next_review_at:   new Date(now + SRS_INTERVALS[0]).toISOString(),
      first_wrong_at:   mistake.date ?? new Date(now).toISOString(),
    }, { onConflict: 'user_id,question_id' })
  } catch { /* silent */ }
}

async function _syncSRSToSupabase(questionId, isCorrect, userId) {
  try {
    const { data } = await supabase
      .from('review_queue')
      .select('wrong_count, correct_streak')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle()

    if (!data) return

    const now        = Date.now()
    const streak     = isCorrect ? (data.correct_streak + 1) : 0
    const wrongCount = isCorrect ? data.wrong_count : (data.wrong_count + 1)

    await supabase
      .from('review_queue')
      .update({
        wrong_count:      wrongCount,
        correct_streak:   streak,
        last_answered_at: new Date(now).toISOString(),
        next_review_at:   new Date(now + intervalFor(isCorrect, streak)).toISOString(),
      })
      .eq('user_id', userId)
      .eq('question_id', questionId)
  } catch { /* silent */ }
}

// ─── recordSession ────────────────────────────────────────────────────────────

export function recordSession(session, userId) {
  try {
    const p     = loadRawProgress()
    const today = todayStr()

    const completed = new Set(p.completedLessons ?? [])
    completed.add(session.lessonId)

    const answered = new Set(p.answeredQuestions ?? [])
    session.answers.forEach(a => answered.add(a.questionId))

    const totalCorrect = (p.totalCorrect ?? 0) + session.correctCount
    const totalWrong   = (p.totalWrong   ?? 0) + (session.total - session.correctCount)

    const diffMs  = p.lastUsedDate ? new Date(today) - new Date(p.lastUsedDate) : null
    const diffDays = diffMs !== null ? Math.round(diffMs / 86400000) : null
    let streak = p.currentStreak ?? 0
    if (diffDays === null || diffDays > 1) streak = 1
    else if (diffDays === 1)               streak += 1
    // diffDays === 0 → same day, keep streak

    persistProgress({
      ...p,
      completedLessons:   [...completed],
      answeredQuestions:  [...answered],
      totalCorrect,
      totalWrong,
      currentStreak:  streak,
      lastUsedDate:   today,
    })

    if (isSupabaseEnabled && userId) {
      _syncProgressToSupabase({ completedLessons: completed, currentStreak: streak, lastUsedDate: today }, userId)
    }
  } catch { /* silent */ }
}

// ─── saveMistake ──────────────────────────────────────────────────────────────

export function saveMistake(mistake, userId) {
  try {
    const list = loadMistakes()
    const idx  = list.findIndex(m => m.questionId === mistake.questionId)
    const now  = Date.now()

    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...mistake,
        wrongCount:     (list[idx].wrongCount ?? 0) + 1,
        correctStreak:  0,
        lastAnsweredAt: new Date(now).toISOString(),
        nextReviewAt:   new Date(now + intervalFor(false, 0)).toISOString(),
      }
    } else {
      list.push({
        ...mistake,
        wrongCount:     1,
        correctStreak:  0,
        lastAnsweredAt: new Date(now).toISOString(),
        nextReviewAt:   new Date(now + intervalFor(false, 0)).toISOString(),
      })
    }
    persist(list)
  } catch { /* silent */ }

  if (isSupabaseEnabled && userId) {
    _syncMistakeToSupabase(mistake, userId)
  }
}

// ─── updateSRS ────────────────────────────────────────────────────────────────

export function updateSRS(questionId, isCorrect, userId) {
  try {
    const list = loadMistakes()
    const idx  = list.findIndex(m => m.questionId === questionId)
    if (idx < 0) return

    const now    = Date.now()
    const entry  = list[idx]
    const streak = isCorrect ? (entry.correctStreak ?? 0) + 1 : 0

    list[idx] = {
      ...entry,
      wrongCount:     isCorrect ? entry.wrongCount : (entry.wrongCount ?? 0) + 1,
      correctStreak:  streak,
      lastAnsweredAt: new Date(now).toISOString(),
      nextReviewAt:   new Date(now + intervalFor(isCorrect, streak)).toISOString(),
    }
    persist(list)
  } catch { /* silent */ }

  if (isSupabaseEnabled && userId) {
    _syncSRSToSupabase(questionId, isCorrect, userId)
  }
}

// ─── removeMistake / clearMistakes ───────────────────────────────────────────

export function removeMistake(questionId, userId) {
  try { persist(loadMistakes().filter(m => m.questionId !== questionId)) } catch {}

  if (isSupabaseEnabled && userId) {
    supabase.from('review_queue')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .then(() => {})
      .catch(() => {})
  }
}

export function clearMistakes(userId) {
  try { localStorage.removeItem(MISTAKES_KEY) } catch {}

  if (isSupabaseEnabled && userId) {
    supabase.from('review_queue')
      .delete()
      .eq('user_id', userId)
      .then(() => {})
      .catch(() => {})
  }
}

// ─── Progress tracking (legacy, synchronous) ─────────────────────────────────

export function getLessonProgress(questionIds, answeredQuestions) {
  const answered = questionIds.filter(id => answeredQuestions.has(id)).length
  const total    = questionIds.length
  return { answered, total, pct: total > 0 ? Math.round((answered / total) * 100) : 0 }
}

export function getPendingReviewCount() {
  return loadMistakes().filter(isDue).length
}

// ─── saveProgress — exported async (for future explicit calls) ───────────────

/**
 * Explicitly persist a full progress snapshot to Supabase.
 * progress: { completedLessons: Set, currentStreak: number, lastUsedDate: string }
 */
export async function saveProgress(progress, userId) {
  if (!isSupabaseEnabled || !userId) return
  await _syncProgressToSupabase(progress, userId)
}

// ─── loadProgress — async, merges localStorage + Supabase ────────────────────

/**
 * Returns progress merged from localStorage and Supabase.
 * On first login with local data → silently migrates to Supabase.
 * Falls back to localStorage on any error.
 */
export async function loadProgress(userId) {
  const raw   = loadRawProgress()
  const local = {
    completedLessons:  new Set(raw.completedLessons  ?? []),
    answeredQuestions: new Set(raw.answeredQuestions  ?? []),
    totalCorrect:      raw.totalCorrect  ?? 0,
    totalWrong:        raw.totalWrong    ?? 0,
    currentStreak:     raw.currentStreak ?? 0,
  }

  if (!isSupabaseEnabled || !userId) return local

  try {
    const [lessonRes, profileRes] = await Promise.all([
      supabase.from('user_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null),
      supabase.from('profiles')
        .select('streak_current')
        .eq('id', userId)
        .maybeSingle(),
    ])

    const remoteCompleted = (lessonRes.data ?? []).map(r => r.lesson_id)
    const localCompleted  = raw.completedLessons ?? []
    const mergedCompleted = [...new Set([...localCompleted, ...remoteCompleted])]

    // Supabase streak wins (cross-device authoritative)
    const remoteStreak = profileRes.data?.streak_current ?? null
    const mergedStreak = remoteStreak !== null
      ? Math.max(remoteStreak, raw.currentStreak ?? 0)
      : (raw.currentStreak ?? 0)

    // Migrate localStorage → Supabase if user has local data but nothing remote
    if (remoteCompleted.length === 0 && localCompleted.length > 0) {
      _syncProgressToSupabase(
        { completedLessons: new Set(localCompleted), currentStreak: mergedStreak, lastUsedDate: raw.lastUsedDate ?? todayStr() },
        userId
      )
    }

    // Update localStorage with merged result
    persistProgress({ ...raw, completedLessons: mergedCompleted, currentStreak: mergedStreak })

    return {
      completedLessons:  new Set(mergedCompleted),
      answeredQuestions: new Set(raw.answeredQuestions ?? []),
      totalCorrect:      raw.totalCorrect ?? 0,
      totalWrong:        raw.totalWrong   ?? 0,
      currentStreak:     mergedStreak,
    }
  } catch {
    return local   // Supabase unavailable — fall back to localStorage
  }
}

// ─── loadReviewQueue — async, merges localStorage + Supabase ─────────────────

/**
 * Returns the review queue merged from localStorage and Supabase.
 * Supabase wins on conflict. Migrates local-only entries to Supabase.
 * Falls back to localStorage on any error.
 */
export async function loadReviewQueue(userId) {
  const local = loadMistakes()

  if (!isSupabaseEnabled || !userId) return local

  try {
    const { data } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', userId)

    if (!data || data.length === 0) {
      // First login with local data → migrate
      if (local.length > 0) {
        local.forEach(m => _syncMistakeToSupabase(m, userId).catch(() => {}))
      }
      return local
    }

    // Map Supabase row shape → local mistake shape
    const remote = data.map(row => ({
      questionId:     row.question_id,
      lessonId:       row.lesson_id,
      topic:          row.topic,
      explanation:    row.explanation,
      mistakeTag:     row.mistake_tag,
      wrongCount:     row.wrong_count,
      correctStreak:  row.correct_streak,
      lastAnsweredAt: row.last_answered_at,
      nextReviewAt:   row.next_review_at,
      date:           row.first_wrong_at,
    }))

    // Merge: Supabase wins on conflict; append local-only entries
    const remoteIds = new Set(remote.map(m => m.questionId))
    const localOnly = local.filter(m => !remoteIds.has(m.questionId))
    const merged    = [...remote, ...localOnly]

    // Mirror merged list back to localStorage
    persist(merged)

    return merged
  } catch {
    return local   // Supabase unavailable — fall back to localStorage
  }
}

// ─── SRS helpers (used by UI) ─────────────────────────────────────────────────

export function isDue(mistake) {
  if (!mistake.nextReviewAt) return true
  return new Date(mistake.nextReviewAt) <= new Date()
}

export function formatNextReview(nextReviewAt) {
  if (!nextReviewAt) return null
  const diff = new Date(nextReviewAt) - Date.now()
  if (diff <= 0)          return 'עכשיו'
  if (diff < HOUR)        return `בעוד ${Math.ceil(diff / 60000)} דק'`
  if (diff < DAY)         return `בעוד ${Math.round(diff / HOUR)} שעות`
  if (diff < 2 * DAY)     return 'מחר'
  return `בעוד ${Math.round(diff / DAY)} ימים`
}
