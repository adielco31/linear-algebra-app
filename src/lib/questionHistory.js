const KEY = 'la_question_history'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}
function save(h) { localStorage.setItem(KEY, JSON.stringify(h)) }

function blank() {
  return { seenQuestions: [], wrongQuestions: [], correctQuestions: [], lastSeenAt: {} }
}

export function getTopicHistory(topicId) {
  return load()[topicId] ?? blank()
}

export function recordSessionResults(topicId, answers) {
  // answers: [{ questionId, isCorrect }]
  const h = load()
  if (!h[topicId]) h[topicId] = blank()
  const t   = h[topicId]
  const now = new Date().toISOString()

  for (const { questionId, isCorrect } of answers) {
    if (!t.seenQuestions.includes(questionId)) t.seenQuestions.push(questionId)
    t.lastSeenAt[questionId] = now

    if (isCorrect) {
      if (!t.correctQuestions.includes(questionId)) t.correctQuestions.push(questionId)
      t.wrongQuestions = t.wrongQuestions.filter(id => id !== questionId)
    } else {
      if (!t.wrongQuestions.includes(questionId)) t.wrongQuestions.push(questionId)
    }
  }
  save(h)
}
