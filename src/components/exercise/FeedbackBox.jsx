import { forwardRef } from 'react'

const CORRECT_MESSAGES = [
  { title: 'מצוין!', sub: 'הבנת את הרעיון בול.' },
  { title: 'כל הכבוד!', sub: 'ניתוח מדויק.' },
  { title: 'נכון לחלוטין!', sub: 'המשך כך.' },
]

function pickCorrectMessage(explanation) {
  // deterministic pick based on explanation length so it doesn't flicker
  return CORRECT_MESSAGES[explanation.length % CORRECT_MESSAGES.length]
}

const FeedbackBox = forwardRef(function FeedbackBox(
  { isCorrect, explanation, wrongFeedback, commonMistakeTag },
  ref
) {
  const msg = isCorrect ? pickCorrectMessage(explanation) : null

  return (
    <div
      ref={ref}
      className={`rounded-2xl overflow-hidden border ${
        isCorrect ? 'border-green-200' : 'border-red-200'
      }`}
    >
      {/* ── Header ── */}
      <div
        className={`px-5 py-4 flex items-start gap-3 ${
          isCorrect ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <ResultIcon isCorrect={isCorrect} />

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-base leading-snug ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? msg.title : 'לא בדיוק...'}
          </p>
          <p className={`text-sm mt-0.5 leading-snug ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
            {isCorrect ? msg.sub : 'בוא נבין יחד איפה הדבר התפספס'}
          </p>

          {/* common mistake chip — only when wrong */}
          {!isCorrect && commonMistakeTag && (
            <span className="inline-block mt-2 bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              טעות נפוצה: {commonMistakeTag}
            </span>
          )}
        </div>
      </div>

      {/* ── Why your choice was wrong ── */}
      {!isCorrect && wrongFeedback && (
        <div className="bg-white px-5 py-4 border-t border-red-100">
          <p className="text-xs font-semibold text-slate-400 mb-2">
            למה הבחירה שלך שגויה
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{wrongFeedback}</p>
        </div>
      )}

      {/* ── Full explanation (always shown) ── */}
      <div
        className={`px-5 py-4 border-t ${
          isCorrect ? 'border-green-100 bg-green-50/40' : 'border-red-100 bg-white'
        }`}
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {isCorrect ? 'למה זה נכון' : 'ההסבר המלא'}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
      </div>
    </div>
  )
})

export default FeedbackBox

// ─── Icons ────────────────────────────────────────────────────────────────────

function ResultIcon({ isCorrect }) {
  return (
    <div
      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
        isCorrect ? 'bg-green-200' : 'bg-red-200'
      }`}
    >
      {isCorrect ? (
        <svg className="w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </div>
  )
}
