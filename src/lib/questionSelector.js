import questionBank from '../data/questionBank'

const SESSION_SIZE = 9

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick(arr, n) {
  return shuffle(arr).slice(0, n)
}

// Shuffle each MCQ question's options and update correctAnswer accordingly
function shuffleOptions(q) {
  if (!q.options || q.options.length < 2) return q
  const order = [...Array(q.options.length).keys()]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]]
  }
  const newOptions       = order.map(i => q.options[i])
  const newCorrect       = order.indexOf(q.correctAnswer)
  const newWrongFeedback = q.wrongAnswerFeedback
    ? Object.fromEntries(
        order.map((oldIdx, newIdx) =>
          q.wrongAnswerFeedback[oldIdx] !== undefined
            ? [newIdx, q.wrongAnswerFeedback[oldIdx]]
            : null
        ).filter(Boolean)
      )
    : undefined
  return { ...q, options: newOptions, correctAnswer: newCorrect, wrongAnswerFeedback: newWrongFeedback }
}

export function selectPracticeQuestions(topicId, history) {
  const pool = questionBank.filter(q => q.topicId === topicId)
  if (pool.length === 0) return []

  const {
    seenQuestions    = [],
    wrongQuestions   = [],
    correctQuestions = [],
  } = history ?? {}

  const seenSet    = new Set(seenQuestions)
  const wrongSet   = new Set(wrongQuestions)

  const unseen  = pool.filter(q => !seenSet.has(q.id))
  const wrong   = pool.filter(q => wrongSet.has(q.id))
  const rest    = pool.filter(q => seenSet.has(q.id) && !wrongSet.has(q.id))

  const chosen = new Set()

  // 1. Up to 2 slots: wrong questions (spaced-repetition)
  for (const q of pick(wrong, 2)) chosen.add(q.id)

  // 2. Fill with unseen first
  const newSlots = SESSION_SIZE - chosen.size
  for (const q of pick(unseen.filter(q => !chosen.has(q.id)), newSlots)) chosen.add(q.id)

  // 3. If still short, fill from already-seen correct
  if (chosen.size < SESSION_SIZE) {
    for (const q of pick(rest.filter(q => !chosen.has(q.id)), SESSION_SIZE - chosen.size)) chosen.add(q.id)
  }

  // 4. Last resort: any remaining question
  if (chosen.size < SESSION_SIZE) {
    for (const q of pick(pool.filter(q => !chosen.has(q.id)), SESSION_SIZE - chosen.size)) chosen.add(q.id)
  }

  const selected = pool.filter(q => chosen.has(q.id))
  return shuffle(selected).map(shuffleOptions)
}
