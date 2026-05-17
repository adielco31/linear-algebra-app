/**
 * mistakeDiagnosisService.js
 *
 * Diagnoses why a student got a question wrong and returns actionable Hebrew feedback.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Diagnosis pipeline (in order):                                 │
 * │                                                                 │
 * │  1. Specific per-option feedback  (wrongAnswerFeedback[idx])    │
 * │  2. Known pattern database        (commonMistakeTag lookup)     │
 * │  3. Caller-provided patterns      (knownPatterns argument)      │
 * │  4. Placeholder                   (AI fallback not yet live)    │
 * │                                                                 │
 * │  Future step 5:  POST /api/v1/diagnose  → backend Claude call  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Security model (IMPORTANT — do not bypass):
 *   Claude API keys must NEVER appear in frontend code.
 *   When AI diagnosis is activated, this service will POST to a
 *   backend endpoint (Supabase Edge Function or dedicated server)
 *   that holds the key and calls Claude on behalf of the user.
 *   The frontend only sends the session JWT — never the API key.
 */

// ─── Result shape ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} DiagnosisResult
 * @property {'specific-feedback'|'pattern'|'ai'|'placeholder'} source
 *   How the diagnosis was produced.
 * @property {string}  diagnosis   — Hebrew explanation of the likely mistake.
 * @property {'high'|'medium'|'low'} confidence
 *   'high'   = matched a specific per-option feedback or a known pattern
 *   'medium' = matched a general pattern
 *   'low'    = placeholder / no match
 * @property {string|null} patternTag  — The matched commonMistakeTag, if any.
 * @property {string|null} suggestion  — A short actionable tip in Hebrew.
 */

// ─── Built-in pattern database ────────────────────────────────────────────────
//
// Keys are the exact strings used in questions.js commonMistakeTag fields.
// Each entry has a diagnosis and an actionable suggestion.
//
// Confidence is 'high' when the pattern is a near-certain cause, 'medium' otherwise.

/** @type {Record<string, { diagnosis: string, suggestion: string, confidence: 'high'|'medium' }>} */
const BUILT_IN_PATTERNS = {

  'הפרדה שגויה של צד ימין': {
    diagnosis:  'הצד הימני של המשוואה (עמודת הקבועים) לא הועתק נכון למטריצה המורחבת. טעות נפוצה היא להחליף את ערכי ה-b בין השורות או לשכוח לכלול אותם בכלל.',
    suggestion: 'בנה את המטריצה שורה-שורה: לכל משוואה, כתוב את המקדמים ואחר כך את הקבוע בעמודה האחרונה.',
    confidence: 'high',
  },

  'בלבול בסדר משתנים': {
    diagnosis:  'נראה שהמקדמים הוקצו לעמודות הלא נכונות. כל עמודה במטריצה מייצגת משתנה ספציפי — xâ‚, xâ‚‚, ... — וסדר זה חייב להישמר בכל השורות.',
    suggestion: 'לפני שכותבים את המטריצה, רשום כותרת לכל עמודה. ודא שכל שורה מכבדת את אותו הסדר.',
    confidence: 'high',
  },

  'בלבול בין פעולות שורה לפעולות עמודה': {
    diagnosis:  'פעולות שורה (החלפה, הכפלה, חיסור) חלות על שורות שלמות. לא ניתן לפי כללי גאוס להחיל אותן על עמודות — זה משנה את מרחב הפתרונות.',
    suggestion: 'בכל פעם שאתה מבצע פעולה, שאל: "האם אני פועל על שורה שלמה?" אם לא — עצור.',
    confidence: 'high',
  },

  'חיסור שורה מעצמה': {
    diagnosis:  'ביצוע Rᵢ ← Rᵢ − Rᵢ ייתן שורת אפסים ויאבד מידע. זו פעולה חוקית אך חסרת תועלת, ולעיתים מסמנת בלבול בין שורות.',
    suggestion: 'ודא שמקור ויעד הפעולה הם שורות שונות. לדוגמה: R₂ ← R₂ − 2·R₁ פועל על שתי שורות שונות.',
    confidence: 'high',
  },

  'שורת אפסים לא בתחתית': {
    diagnosis:  'בצורה המדורגת (REF), שורות אפסים מלאות צריכות להופיע בתחתית המטריצה. הצבתן מעל שורות עם ציר פוגעת בסדר המדורג.',
    suggestion: 'לאחר כל שלב, בדוק אם נוצרה שורת אפסים. אם כן — העבר אותה לתחתית בעזרת פעולת החלפת שורות.',
    confidence: 'high',
  },

  'לא מאפסים מעל ציר': {
    diagnosis:  'בצורה RREF (מדורגת מצומצמת), כל ציר חייב להיות האיבר היחיד שאינו אפס בעמודתו — גם מעל וגם מתחת. הפסקה אחרי אפוס מתחת בלבד מניבה REF, לא RREF.',
    suggestion: 'אחרי שמאפסת מתחת לציר, המשך ומאפס גם מעליו. עבד מלמטה למעלה בחזרה.',
    confidence: 'high',
  },

  'התעלמות משורת סתירה': {
    diagnosis:  'שורה של צורה [0 0 … 0 | c] כאשר c ≠ 0 מייצגת סתירה (0 = c — בלתי אפשרי). מערכת כזו אין לה פתרון, ויש לדווח "אין פתרון" לפני שממשיכים.',
    suggestion: 'לאחר כל שלב, סרוק את השורות: אם כל המקדמים אפסים אבל הקבוע שונה מאפס — המערכת סתורה.',
    confidence: 'high',
  },

  'בלבול בין מספר צירים למספר פתרונות': {
    diagnosis:  'מספר הצירים (pivots) קובע אם יש פתרון יחיד, אבל לא קובע ישירות את מספר הפתרונות. מספר הפתרונות נקבע על ידי מספר המשתנים החופשיים (n − rank).',
    suggestion: 'ספור: כמה עמודות יש? כמה צירים? ההפרש הוא מספר המשתנים החופשיים, וזה קובע אינסוף פתרונות.',
    confidence: 'high',
  },

  'סימן שגוי בביטוי משתנה ציר': {
    diagnosis:  'כשמבטאים משתנה ציר כפונקציה של המשתנים החופשיים, הסימן עשוי להתהפך. העברת איבר מהצד הימין לשמאל הופכת את הסימן.',
    suggestion: 'בצע את ההעברה בשלבים: כתוב את המשוואה מהשורה, העבר את המשתנים החופשיים לצד ימין, ובדוק כל סימן.',
    confidence: 'high',
  },

  'טעות סימן בבידוד משתנה ציר': {
    diagnosis:  'בעת בידוד משתנה הציר, נראה שהסימן התהפך בטעות. שגיאה נפוצה היא להעתיק את המקדם ישירות במקום להפוך את סימנו.',
    suggestion: 'אחרי שכתבת xᵢ = ..., הצב ערך פשוט (כמו t=1) ובדוק שהמשוואה המקורית מתקיימת.',
    confidence: 'high',
  },

  'שינוי עמודות ללא עדכון סדר משתנים': {
    diagnosis:  'החלפת עמודות מחליפה את הסדר של המשתנים. אם לא מעדכנים את רשימת המשתנים בהתאם, הפתרון הסופי יוצמד לשמות הלא נכונים.',
    suggestion: 'עקוב אחרי עמודות עם כותרות. כל פעם שמחליפים עמודות, עדכן גם את כותרת העמודות.',
    confidence: 'high',
  },

  'טעות סימן בחישוב ביטול': {
    diagnosis:  'בחישוב הסקלר לביטול ציר, הסימן שגוי. אם הציר הוא a ורוצים לבטל b מתחתיו, הסקלר צריך להיות −b/a, לא b/a.',
    suggestion: 'בדוק: לאחר הפעולה, האיבר שרצית לאפס — האם הוא אכן 0? אם לא, הסקלר הפוך.',
    confidence: 'high',
  },

  'בלבול בין שורת אפסים לשורת סתירה': {
    diagnosis:  'שורת [0 0 … 0 | 0] היא שורת אפסים — תקינה, פשוט מיותרת. שורת [0 0 … 0 | c≠0] היא סתירה — המערכת חסרת פתרון. ההבדל הוא בעמודת הקבועים.',
    suggestion: 'בדוק תמיד את הספרה האחרונה בשורה (עמודת הקבועים). אפס — בסדר. לא-אפס — סתירה.',
    confidence: 'high',
  },

  'rank(A) < n אינו מספיק לאינסוף פתרונות': {
    diagnosis:  'rank(A) < n (מספר משתנים) מתנה הכרחית לאינסוף פתרונות, אך לא מספיקה. אם קיימת גם סתירה (rank(A) < rank([A|b])), אין פתרון כלל.',
    suggestion: 'בדוק שני תנאים: (1) rank(A) = rank([A|b]) — עקביות. (2) rank < n — אינסוף פתרונות.',
    confidence: 'high',
  },

  'כפל שורה באפס — פעולה לא הפיכה': {
    diagnosis:  'הכפלת שורה ב-0 מוחקת אותה לחלוטין ויוצרת שורת אפסים. זו פעולה לא הפיכה — לא ניתן לשחזר את המידע המקורי, ולכן היא אסורה בגאוס.',
    suggestion: 'ניתן לכפול שורה רק בסקלר שונה מאפס. לביטול איבר — השתמש בפעולת חיבור/חיסור שורה.',
    confidence: 'high',
  },

  'ספירת שורות במקום צירים': {
    diagnosis:  'rank המטריצה הוא מספר הצירים (ה-pivots), לא מספר השורות. שורות אפסים אינן תורמות ל-rank.',
    suggestion: 'הביא את המטריצה לצורה מדורגת וספור את השורות עם לפחות איבר אחד שאינו אפס.',
    confidence: 'high',
  },

  'ספירת עמודות במקום צירים': {
    diagnosis:  'rank המטריצה מוגדר על-פי מספר הצירים — לא מספר העמודות. ייתכן שיש עמודות חופשיות (ללא ציר) שאינן נספרות ב-rank.',
    suggestion: 'בצורה המדורגת, ספור רק את העמודות שיש בהן ציר (המוביל של כל שורה לא-אפסית).',
    confidence: 'high',
  },

  'שכחו לחסר את הדרגה ממספר המשתנים': {
    diagnosis:  'מספר המשתנים החופשיים הוא n − rank(A), לא rank(A) בעצמו. נראה שהנוסחה יושמה חלקית.',
    suggestion: 'חשב: כמה עמודות יש? (n) כמה צירים? (rank) תשובה: n − rank = מספר המשתנים החופשיים.',
    confidence: 'high',
  },

  'בלבול בין מספר השורה לאינדקס המשתנה': {
    diagnosis:  'המשתנה xᵢ בפתרון לא בהכרח מופיע בשורה i של המטריצה המדורגת. הציר בשורה i עשוי להיות בעמודה j שונה.',
    suggestion: 'עקוב אחרי עמודת הציר, לא אחרי מספר השורה. עמודה j עם ציר → משתנה j.',
    confidence: 'medium',
  },

  'ספירת שורות כולל שורות אפסים': {
    diagnosis:  'שורות אפסים לא מוסיפות מידע ולא נספרות ב-rank. ה-rank הוא מספר השורות הלא-אפסיות בצורה המדורגת.',
    suggestion: 'אחרי הדירוג, התעלם משורות האפסים. ספור רק שורות עם לפחות ספרה אחת שאינה אפס.',
    confidence: 'high',
  },

  'שכחה להחיל פעולה על כל האיברים בשורה': {
    diagnosis:  'פעולת שורה חייבת לחול על כל האיברים באותה שורה — כולל עמודת הקבועים. החלה חלקית תשנה את המשוואה שהשורה מייצגת.',
    suggestion: 'בצע את הפעולה עמודה-עמודה, מהראשונה ועד האחרונה כולל. אחר-כך ודא את כל החישובים.',
    confidence: 'high',
  },

}

// ─── Step 1: specific per-option feedback ─────────────────────────────────────

/**
 * Returns the question's per-option feedback for the chosen answer, if it exists.
 * Only applies to multiple-choice and find-the-mistake question types.
 *
 * @param {object} question
 * @param {number|string|null} userAnswer
 * @returns {DiagnosisResult|null}
 */
function matchSpecificFeedback(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) return null
  const feedback = question.wrongAnswerFeedback?.[userAnswer]
  if (!feedback) return null

  return {
    source:     'specific-feedback',
    diagnosis:  feedback,
    confidence: 'high',
    patternTag: question.commonMistakeTag ?? null,
    suggestion: null,
  }
}

// ─── Step 2 + 3: pattern database ────────────────────────────────────────────

/**
 * Matches the question's commonMistakeTag against the built-in database
 * and any caller-provided patterns.
 *
 * @param {object}                question
 * @param {Record<string,object>} callerPatterns  — additional patterns from the callsite
 * @returns {DiagnosisResult|null}
 */
function matchPattern(question, callerPatterns) {
  const tag = question.commonMistakeTag
  if (!tag) return null

  const allPatterns = { ...BUILT_IN_PATTERNS, ...callerPatterns }
  const entry = allPatterns[tag]
  if (!entry) return null

  return {
    source:     'pattern',
    diagnosis:  entry.diagnosis,
    confidence: entry.confidence,
    patternTag: tag,
    suggestion: entry.suggestion ?? null,
  }
}

// ─── Step 4: placeholder ──────────────────────────────────────────────────────

/**
 * Returns a placeholder result when no pattern matches and AI is not yet live.
 *
 * @param {object} question
 * @returns {DiagnosisResult}
 */
function placeholder(question) {
  return {
    source:     'placeholder',
    diagnosis:  question.explanation ?? 'עיין בהסבר המצורף לשאלה.',
    confidence: 'low',
    patternTag: question.commonMistakeTag ?? null,
    suggestion: 'נסה לפתור שוב תוך קריאת ההסבר בעיון.',
  }
}

// ─── Future Step 5: backend AI call ──────────────────────────────────────────
//
// When AI diagnosis is ready, this function will POST to a backend endpoint.
// The endpoint (Supabase Edge Function or Node server) holds the Anthropic API
// key server-side and calls Claude on behalf of the authenticated user.
//
// NEVER add an Anthropic API key to this file or to any .env.* file that is
// bundled by Vite (VITE_* variables are embedded in the JS bundle).
//
// Example endpoint contract:
//
//   POST /api/v1/diagnose-mistake
//   Authorization: Bearer <supabase-session-jwt>
//   Content-Type: application/json
//
//   Request body:
//   {
//     "questionText":   string,   // question.question
//     "questionTopic":  string,   // question.topic
//     "questionType":   string,   // question.type
//     "userAnswer":     any,      // raw user answer
//     "correctAnswer":  any,      // correct answer
//     "mistakeTag":     string | null,
//     "explanation":    string,   // question.explanation (give Claude context)
//   }
//
//   Response body:
//   {
//     "diagnosis":   string,
//     "confidence":  "high" | "medium" | "low",
//     "suggestion":  string,
//   }
//
// async function fetchAIDiagnosis(question, userAnswer, correctAnswer, sessionJwt) {
//   const res = await fetch('/api/v1/diagnose-mistake', {
//     method:  'POST',
//     headers: {
//       'Content-Type':  'application/json',
//       'Authorization': `Bearer ${sessionJwt}`,
//     },
//     body: JSON.stringify({
//       questionText:  question.question,
//       questionTopic: question.topic,
//       questionType:  question.type,
//       userAnswer,
//       correctAnswer,
//       mistakeTag:    question.commonMistakeTag ?? null,
//       explanation:   question.explanation,
//     }),
//   })
//   if (!res.ok) throw new Error(`Diagnosis endpoint returned ${res.status}`)
//   return res.json()
// }

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Diagnose why a student got a question wrong.
 *
 * @param {object}                question       — Full question object from questions.js
 * @param {number|string|null}    userAnswer     — What the student answered
 *   - MCQ:    option index (number)
 *   - Numeric: the string the student typed
 *   - Matrix:  2-D string array
 * @param {number|string|Array}   correctAnswer  — The correct answer
 * @param {Record<string,object>} [knownPatterns={}]
 *   — Additional patterns to check beyond the built-in database.
 *     Shape: { [tagString]: { diagnosis, suggestion, confidence } }
 *
 * @returns {DiagnosisResult}
 */
export function diagnoseMistake(question, userAnswer, correctAnswer, knownPatterns = {}) {
  // 1. Specific per-option feedback (most precise)
  const specific = matchSpecificFeedback(question, userAnswer)
  if (specific) return specific

  // 2. Known pattern match (built-in + caller-provided)
  const pattern = matchPattern(question, knownPatterns)
  if (pattern) return pattern

  // 3. Placeholder — AI fallback not yet active
  return placeholder(question)
}

// ─── Utility exports ──────────────────────────────────────────────────────────

/**
 * Returns true when a question has a known pattern in the built-in database.
 * Useful for UI decisions (e.g. "show detailed diagnosis" toggle).
 */
export function hasKnownPattern(question) {
  return Boolean(question?.commonMistakeTag && BUILT_IN_PATTERNS[question.commonMistakeTag])
}

/**
 * Returns all built-in pattern tags — useful for testing or building admin UIs.
 */
export function getBuiltInPatternTags() {
  return Object.keys(BUILT_IN_PATTERNS)
}
