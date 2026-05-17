import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import modules from '../data/modules'
import { selectPracticeQuestions } from '../lib/questionSelector'
import { getTopicHistory, recordSessionResults } from '../lib/questionHistory'
import FeedbackBox from '../components/exercise/FeedbackBox'
import MatrixDisplay from '../components/math/MatrixDisplay'
import MatrixInput from '../components/math/MatrixInput'
import MathKeypad  from '../components/math/MathKeypad'
import { saveSession, saveMistake, updateSRS, recordSession } from '../utils/progressStorage'
import { useAuth } from '../lib/AuthContext'

// ─── Meta ────────────────────────────────────────────────────────────────────

const DIFFICULTY_META = {
  1: { label: 'בסיסי', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  2: { label: 'חישוב', bg: 'bg-indigo-100',  text: 'text-indigo-700'  },
  3: { label: 'הבנה',  bg: 'bg-orange-100',  text: 'text-orange-700'  },
  4: { label: 'שילוב', bg: 'bg-purple-100',  text: 'text-purple-700'  },
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד']
const FIND_MISTAKE_TYPES = new Set(['find-the-mistake'])

function isNumericQuestion(q)     { return q.type === 'numeric-answer' }
function isMatrixQuestion(q)      { return q.type === 'matrix-answer'  }
function isGuidedStepQuestion(q)  { return q.type === 'guided-step'    }


function emptyMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(''))
}

// Parse and compare numeric input. Handles "3", "3.0", " 2 ", "-1"
function numericMatch(input, correctAnswer) {
  const n = Number(input.trim())
  return !isNaN(n) && input.trim() !== '' && n === correctAnswer
}

function isValidNumber(input) {
  return input.trim() !== '' && !isNaN(Number(input.trim()))
}

// Parse a cell string: handles integers, decimals, and fractions like "1/2"
function parseCell(str) {
  const s = String(str).trim()
  if (s === '' || s === '-') return NaN
  const m = s.match(/^(-?\d+)\/(-?\d+)$/)
  if (m) {
    const den = Number(m[2])
    return den === 0 ? NaN : Number(m[1]) / den
  }
  return Number(s)
}

function matrixMatch(value, correctAnswer) {
  if (!value || !correctAnswer) return false
  return correctAnswer.every((row, ri) =>
    row.every((cell, ci) => {
      const u = parseCell(value[ri]?.[ci] ?? '')
      const c = parseCell(String(cell))
      return !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 1e-9
    })
  )
}

function matrixAllFilled(value) {
  if (!value) return false
  return value.every(row => row.every(cell => {
    const s = (cell ?? '').trim()
    return s !== '' && s !== '-'
  }))
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const feedbackRef  = useRef(null)
  const { user }     = useAuth()
  const userId       = user?.id ?? null

  const lessonTitle = modules.flatMap(m => m.lessons).find(l => l.id === lessonId)?.title ?? ''

  const [questions] = useState(() =>
    selectPracticeQuestions(lessonId, getTopicHistory(lessonId))
  )

  const [current,      setCurrent]      = useState(0)
  const [selected,     setSelected]     = useState(null)   // MCQ: option index
  const [numericInput, setNumericInput] = useState('')     // numeric-answer: user string
  const [matrixValue,  setMatrixValue]  = useState(() => { // matrix-answer: 2-D string array
    const q = questions[0]
    return isMatrixQuestion(q) ? emptyMatrix(q.matrixAnswer.rows, q.matrixAnswer.cols) : null
  })
  const [checked,      setChecked]      = useState(false)
  const [answers,      setAnswers]      = useState([])

  if (questions.length === 0) return <EmptyState lessonId={lessonId} />

  const question    = questions[current]
  const total       = questions.length
  const isNumeric    = isNumericQuestion(question)
  const isMatrix     = isMatrixQuestion(question)
  const isGuidedStep = isGuidedStepQuestion(question)
  const progressPct  = Math.round((current / total) * 100)

  const isCorrect = isMatrix
    ? matrixMatch(matrixValue, question.matrixAnswer.correctAnswer)
    : isNumeric
      ? numericMatch(numericInput, question.correctAnswer)
      : isGuidedStep
        ? true
        : selected === question.correctAnswer

  const canCheck = isMatrix
    ? matrixAllFilled(matrixValue)
    : isNumeric
      ? isValidNumber(numericInput)
      : isGuidedStep
        ? true
        : selected !== null

  function handleCheck() {
    if (!canCheck) return
    setChecked(true)
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
  }

  function handleNext() {
    const answer = {
      questionId:     question.id,
      selectedIndex:  isMatrix || isNumeric ? null : selected,
      numericInput:   isNumeric ? numericInput.trim() : null,
      matrixInput:    isMatrix  ? matrixValue : null,
      correctIndex:   isMatrix || isNumeric ? null : question.correctAnswer,
      correctNumeric: isNumeric ? question.correctAnswer : null,
      isCorrect,
      timestamp:      new Date().toISOString(),
    }
    const updated = [...answers, answer]

    if (!isCorrect) {
      saveMistake({
        questionId:     question.id,
        lessonId,
        topic:          question.topic,
        selectedAnswer: isMatrix || isNumeric ? null : selected,
        numericInput:   isNumeric ? numericInput.trim() : null,
        correctAnswer:  isMatrix
          ? JSON.stringify(question.matrixAnswer.correctAnswer)
          : question.correctAnswer,
        explanation:    question.explanation,
        mistakeTag:     question.commonMistakeTag,
        date:           new Date().toISOString(),
      }, userId)
    } else {
      updateSRS(question.id, true, userId)
    }

    if (current + 1 < total) {
      setAnswers(updated)
      setCurrent(c => c + 1)
      setSelected(null)
      setNumericInput('')
      const nextQ = questions[current + 1]
      setMatrixValue(isMatrixQuestion(nextQ)
        ? emptyMatrix(nextQ.matrixAnswer.rows, nextQ.matrixAnswer.cols)
        : null)
      setChecked(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const correctCount = updated.filter(a => a.isCorrect).length
      const session = {
        id:           Date.now().toString(),
        lessonId,
        date:         new Date().toISOString(),
        total,
        correctCount,
        answers:      updated,
      }
      saveSession(session)
      recordSession(session, userId)
      recordSessionResults(lessonId, updated.map(a => ({ questionId: a.questionId, isCorrect: a.isCorrect })))
      navigate('/results', { state: { correctCount, total, lessonId, sessionId: session.id } })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <PracticeHeader
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        current={current}
        total={total}
        progressPct={progressPct}
      />

      <main className="flex-1 px-4 py-5 space-y-3 pb-28">
        <QuestionCard question={question} />

        {isMatrix ? (
          <MatrixInputCard
            question={question}
            value={matrixValue ?? emptyMatrix(question.matrixAnswer.rows, question.matrixAnswer.cols)}
            onChange={setMatrixValue}
            checked={checked}
            isCorrect={isCorrect}
          />
        ) : isNumeric ? (
          <NumericInputCard
            value={numericInput}
            onChange={setNumericInput}
            checked={checked}
            isCorrect={isCorrect}
            unit={question.unit}
            correctAnswer={question.correctAnswer}
          />
        ) : isGuidedStep ? (
          <GuidedStepCard checked={checked} />
        ) : (
          <OptionList
            options={question.options}
            selected={selected}
            checked={checked}
            correctAnswer={question.correctAnswer}
            onSelect={i => !checked && setSelected(i)}
          />
        )}

        {checked && (
          <FeedbackBox
            ref={feedbackRef}
            isCorrect={isCorrect}
            explanation={question.explanation}
            wrongFeedback={isMatrix || isNumeric || isGuidedStep ? null : question.wrongAnswerFeedback?.[selected]}
            commonMistakeTag={question.commonMistakeTag}
          />
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-4-safe">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!canCheck}
            className="w-full bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3.5 text-base transition-colors"
          >
            בדוק תשובה
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`w-full font-semibold rounded-xl py-3.5 text-base transition-colors text-white ${
              isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {current + 1 < total ? 'שאלה הבאה' : 'סיים תרגול'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── PracticeHeader ───────────────────────────────────────────────────────────

function PracticeHeader({ lessonId, lessonTitle, current, total, progressPct }) {
  const navigate = useNavigate()

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-2.5 sticky top-10 z-10">
      {/* Top row: close + title + counter */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => navigate(`/lesson/${lessonId}`)}
          className="p-1.5 -ms-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="סגור תרגול"
        >
          <XIcon />
        </button>

        <p className="flex-1 text-xs font-semibold text-slate-300 truncate min-w-0">
          {lessonTitle}
        </p>

        <span className="text-xs font-medium text-slate-400 shrink-0 tabular-nums">
          {current + 1}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  )
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({ question }) {
  const diff          = DIFFICULTY_META[question.difficulty] ?? DIFFICULTY_META[1]
  const isFindMistake = FIND_MISTAKE_TYPES.has(question.type)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-0">
        <span className="text-xs text-slate-400 font-medium truncate">{question.topic}</span>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}>
          {diff.label}
        </span>
      </div>

      {isFindMistake && (
        <div className="mx-5 mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
          <span className="text-base shrink-0" aria-hidden>🔍</span>
          <span className="text-xs font-semibold text-orange-700">מצא את הטעות בפתרון הבא</span>
        </div>
      )}

      <p className="px-5 pt-4 pb-4 text-base font-semibold text-gray-900 leading-relaxed whitespace-pre-line">
        {question.question}
      </p>

      {question.questionMatrix && (
        <div className="mx-5 mb-4">
          <MatrixDisplay
            rows={question.questionMatrix.rows}
            augmented={question.questionMatrix.augmented}
            block
            className="text-gray-800"
          />
        </div>
      )}

      {isFindMistake && question.fauxSolution && (
        <div className="mx-5 mb-5 rounded-xl border border-orange-200 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center gap-2">
            <MagnifyIcon />
            <span className="text-xs font-semibold text-orange-700">ניסיון הפתרון</span>
          </div>
          <pre
            dir="ltr"
            className="px-4 py-3 text-sm font-mono text-gray-800 leading-relaxed overflow-x-auto whitespace-pre bg-white"
          >
            {question.fauxSolution}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── NumericInputCard ─────────────────────────────────────────────────────────

function NumericInputCard({ value, onChange, checked, isCorrect, unit, correctAnswer }) {
  const inputRef = useRef(null)

  // focus the input when the card mounts (new question)
  useEffect(() => { inputRef.current?.focus() }, [])

  const hasError = value !== '' && !isValidNumber(value)

  let wrapClass
  if (!checked)       wrapClass = hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus-within:border-blue-400 bg-white'
  else if (isCorrect) wrapClass = 'border-green-400 bg-green-50'
  else                wrapClass = 'border-red-400 bg-red-50'

  let textClass
  if (!checked)       textClass = 'text-gray-900 placeholder-gray-200'
  else if (isCorrect) textClass = 'text-green-700'
  else                textClass = 'text-red-700'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 mb-4">
        הכנס את תשובתך
      </p>

      <div className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 transition-colors ${wrapClass}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => !checked && onChange(e.target.value)}
          disabled={checked}
          placeholder="?"
          dir="ltr"
          className={`flex-1 text-4xl font-black text-center bg-transparent outline-none tabular-nums ${textClass}`}
        />
        {unit && (
          <span className={`shrink-0 text-sm font-semibold ${
            !checked ? 'text-gray-400' : isCorrect ? 'text-green-600' : 'text-red-500'
          }`}>
            {unit}
          </span>
        )}
      </div>

      {/* Validation hint */}
      {!checked && hasError && (
        <p className="mt-2 text-xs text-red-500 text-center">הכנס מספר בלבד</p>
      )}

      {/* Correct answer reveal when wrong */}
      {checked && !isCorrect && (
        <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-green-50 border border-green-100 rounded-xl">
          <span className="text-xs text-gray-500">התשובה הנכונה:</span>
          <span className="text-base font-black text-green-700 tabular-nums">
            {correctAnswer}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── MatrixInputCard ──────────────────────────────────────────────────────────

function MatrixInputCard({ question, value, onChange, checked, isCorrect }) {
  const { rows, cols, augmented, correctAnswer } = question.matrixAnswer
  const [activeCell, setActiveCell] = useState(null)

  function handleKeypadKey(key) {
    if (!activeCell) return
    const { ri, ci } = activeCell
    const cur = value[ri]?.[ci] ?? ''

    let next
    switch (key) {
      case 'backspace': next = cur.slice(0, -1); break
      case 'clear':     next = ''; break
      case '-':         next = cur.startsWith('-') ? cur.slice(1) : '-' + cur; break
      default:          next = cur + key
    }

    if (next !== '' && /[^-\d./]/.test(next)) return
    const updated = value.map(r => [...r])
    updated[ri][ci] = next
    onChange(updated)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        הזן את המטריצה המתקבלת
      </p>

      <div className={`flex justify-center rounded-xl py-2 transition-colors ${
        !checked ? '' : isCorrect ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <MatrixInput
          rows={rows}
          cols={cols}
          value={value}
          onChange={onChange}
          disabled={checked}
          keypad
          onCellFocus={setActiveCell}
        />
      </div>

      {!checked && (
        <MathKeypad
          onKey={handleKeypadKey}
          disabled={!activeCell}
        />
      )}

      {checked && !isCorrect && (
        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-xs font-semibold text-green-600 mb-2 text-center">המטריצה הנכונה:</p>
          <MatrixDisplay
            rows={correctAnswer}
            augmented={augmented}
            block
            className="text-green-700"
          />
        </div>
      )}
    </div>
  )
}

// ─── GuidedStepCard ──────────────────────────────────────────────────────────

function GuidedStepCard({ checked }) {
  return (
    <div className={`rounded-2xl border p-5 transition-colors ${
      checked ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'
    }`}>
      <p className="text-xs font-semibold text-indigo-600 mb-2">
        {checked ? '✓ המשך לשלב הבא' : 'שלב מודרך'}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">
        קרא את ההסבר בקפידה, ולחץ על "בדוק תשובה" כשאתה מוכן להמשיך.
      </p>
    </div>
  )
}

// ─── OptionList + OptionButton ────────────────────────────────────────────────

function OptionList({ options, selected, checked, correctAnswer, onSelect }) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <OptionButton
          key={i}
          letter={HEBREW_LETTERS[i] ?? String(i + 1)}
          text={opt}
          state={optionState(i, selected, checked, correctAnswer)}
          onClick={() => onSelect(i)}
          disabled={checked}
        />
      ))}
    </div>
  )
}

function optionState(i, selected, checked, correctAnswer) {
  if (!checked) return i === selected ? 'selected' : 'idle'
  if (i === correctAnswer) return 'correct'
  if (i === selected)      return 'wrong'
  return 'dim'
}

const OPTION_STYLES = {
  idle:     'border-slate-200  bg-white        text-slate-900',
  selected: 'border-indigo-400 bg-indigo-50    text-indigo-900',
  correct:  'border-emerald-400 bg-emerald-50  text-emerald-800',
  wrong:    'border-red-400    bg-red-50       text-red-800',
  dim:      'border-slate-200  bg-white        text-slate-400',
}

const LETTER_STYLES = {
  idle:     'border-slate-300  bg-transparent  text-slate-500',
  selected: 'border-indigo-500 bg-indigo-500   text-white',
  correct:  'border-emerald-500 bg-emerald-500 text-white',
  wrong:    'border-red-400    bg-red-400      text-white',
  dim:      'border-slate-200  bg-transparent  text-slate-300',
}

function OptionButton({ letter, text, state, onClick, disabled }) {
  const hasMatrix = text.includes('\n')

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-start rounded-xl border-2 transition-colors ${OPTION_STYLES[state]}`}
    >
      <div className="px-4 py-3.5 flex items-start gap-3">
        <span
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${LETTER_STYLES[state]}`}
        >
          {state === 'correct' ? <CheckmarkSmall /> : state === 'wrong' ? <XSmall /> : letter}
        </span>

        {hasMatrix ? (
          <pre
            dir="ltr"
            className="text-sm font-mono whitespace-pre leading-relaxed flex-1 text-start"
          >
            {text}
          </pre>
        ) : (
          <span className="text-sm font-semibold leading-relaxed flex-1">{text}</span>
        )}
      </div>
    </button>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ lessonId }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="text-4xl" aria-hidden>📭</p>
      <p className="text-lg font-bold text-gray-900">אין שאלות לשיעור זה עדיין</p>
      <p className="text-sm text-gray-400">תוכן בדרך — בינתיים חזור לשיעור</p>
      <button
        onClick={() => navigate(`/lesson/${lessonId}`)}
        className="mt-2 bg-indigo-600 text-white font-semibold rounded-xl px-6 py-3 text-sm"
      >
        חזור לשיעור
      </button>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MagnifyIcon = () => (
  <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CheckmarkSmall = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XSmall = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
