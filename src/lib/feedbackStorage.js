const STORAGE_KEY = 'la_feedback'

/**
 * Save a feedback entry to localStorage.
 * The shape is designed for a future Supabase `feedback` table insert.
 *
 * Future Supabase wiring:
 *   if (isSupabaseEnabled) {
 *     supabase.from('feedback').insert(entry)   // fire-and-forget
 *   }
 */
export function saveFeedback({ lessonId, sessionId, userId, clarity, feedbackHelp, difficulty, openText }) {
  const entry = {
    id:          `fb_${Date.now()}`,
    lessonId,
    sessionId:   sessionId  ?? null,
    userId:      userId     ?? null,
    timestamp:   new Date().toISOString(),
    clarity,      // 1 | 2 | 3 | null  (1=לא ברור … 3=ברור מאוד)
    feedbackHelp, // 1 | 2 | 3 | null  (1=לא עזר … 3=עזר מאוד)
    difficulty,   // 'easy' | 'right' | 'hard' | null
    openText:    openText?.trim() || null,
  }

  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, entry]))
  } catch { /* storage full or private-mode */ }

  return entry
}

export function loadAllFeedback() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}
