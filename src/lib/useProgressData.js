import { useState, useEffect } from 'react'
import { getProgress, loadProgress, loadReviewQueue, isDue } from '../utils/progressStorage'

/**
 * useProgressData(userId)
 *
 * Returns the user's progress, merging localStorage + Supabase.
 *
 * - Initial value: localStorage (sync, instant render — no loading flash)
 * - After mount: loadProgress(userId) resolves and updates state if the
 *   Supabase data differs (e.g. completed lessons from another device)
 *
 * Shape: { completedLessons: Set, answeredQuestions: Set,
 *          totalCorrect, totalWrong, currentStreak }
 */
export function useProgressData(userId) {
  const [data, setData] = useState(getProgress)  // sync init from localStorage

  useEffect(() => {
    let cancelled = false
    loadProgress(userId ?? null).then(merged => {
      if (!cancelled) setData(merged)
    })
    return () => { cancelled = true }
  }, [userId])

  return data
}

/**
 * useReviewQueue(userId)
 *
 * Returns the SRS review queue, merging localStorage + Supabase.
 *
 * - Initial value: localStorage (sync)
 * - After mount: loadReviewQueue(userId) resolves and updates state
 *
 * Also exposes dueCount for convenience.
 */
export function useReviewQueue(userId) {
  const [queue, setQueue] = useState(() => {
    // Sync init from localStorage — avoids blank flash
    try {
      return JSON.parse(localStorage.getItem('la_mistakes') ?? '[]')
    } catch { return [] }
  })

  useEffect(() => {
    let cancelled = false
    loadReviewQueue(userId ?? null).then(merged => {
      if (!cancelled) setQueue(merged)
    })
    return () => { cancelled = true }
  }, [userId])

  const dueCount = queue.filter(isDue).length

  return { queue, setQueue, dueCount }
}
