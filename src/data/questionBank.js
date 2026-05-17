// questionBank.js — single source of truth for practice sessions.
// Existing questions from questions.js are adapted (topicId = lessonId).
// New bank questions are defined here with ids prefixed by topic abbreviation.

import existingQuestions from './questions'

// ─── Port existing questions ──────────────────────────────────────────────────

const ported = existingQuestions.map(q => ({ ...q, topicId: q.lessonId }))

// ─── New bank questions ───────────────────────────────────────────────────────
// Format: id, topicId, type, difficulty, topic, question, options, correctAnswer,
//         explanation, wrongAnswerFeedback?, commonMistakeTag?, fauxSolution?,
//         questionMatrix?, unit?

const newQuestions = [

  // ══════════════════════════════════════════════════════════════════════════
  // MATRIX-INTRO  (mi-)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'mi-01',
    topicId: 'matrix-intro',
    topic: 'כתיבת מטריצה מורחבת',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'כמה שורות יש במטריצה המורחבת של מערכת עם 4 משוואות ו-3 משתנים?',
    options: ['4', '3', '7', '12'],
    correctAnswer: 0,
    explanation: 'מספר השורות במטריצה המורחבת שווה למספר המשוואות — 4. מספר המשתנים קובע את מספר העמודות (3 + 1 לצד ימין = 4 עמודות), לא את מספר השורות.',
    wrongAnswerFeedback: { 1: 'מספר המשתנים קובע את מספר העמודות, לא השורות.', 2: 'זה סכום המשוואות והמשתנים — אבל אין קשר כזה לגודל המטריצה.', 3: 'מספר האיברים כולם — לא זה מה שנשאל.' },
    commonMistakeTag: 'בלבול שורות/עמודות',
  },

  {
    id: 'mi-02',
    topicId: 'matrix-intro',
    topic: 'כתיבת מטריצה מורחבת',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'כמה עמודות יש במטריצה המורחבת של מערכת עם 3 משוואות ו-4 משתנים?',
    options: ['5', '4', '3', '7'],
    correctAnswer: 0,
    explanation: 'מספר העמודות במטריצה המורחבת = מספר המשתנים + 1 (עמודת הצד הימין). כאן: 4 + 1 = 5.',
    wrongAnswerFeedback: { 1: 'זה מספר המשתנים בלבד — שכחת את עמודת הצד הימין.', 2: 'זה מספר המשוואות — לא קשור למספר העמודות.', 3: 'זה הסכום — אבל הנוסחה היא משתנים + 1.' },
    commonMistakeTag: 'שכחת עמודת הצד הימין',
  },

  {
    id: 'mi-03',
    topicId: 'matrix-intro',
    topic: 'קריאת מטריצה מורחבת',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'איזו מערכת משוואות מייצגת המטריצה המורחבת:\n[ 3  0  -1 | 5 ]\n[ 0  2   4 | 1 ]',
    options: [
      '3x − z = 5\n2y + 4z = 1',
      '3x + 2y − z = 5\n4z = 1',
      '3x − y = 5\n2y + 4 = 1',
      '3x − z = 5\n2y − 4z = 1',
    ],
    correctAnswer: 0,
    explanation: 'שורה 1: מקדם x הוא 3, מקדם y הוא 0 (לא מופיע), מקדם z הוא −1 → 3x − z = 5. שורה 2: מקדם x הוא 0, מקדם y הוא 2, מקדם z הוא 4 → 2y + 4z = 1.',
    wrongAnswerFeedback: { 1: 'אם y לא מופיע בשורה 1, משתנה y לא "נעלם" — הוא פשוט לא משפיע על המשוואה הזו.', 2: 'שורה 2 מייצגת משוואה עם y ו-z, לא רק z.', 3: 'הסימן של z בשורה 2 הוא +4, לא −4.' },
    commonMistakeTag: 'קריאה שגויה של מקדמים',
  },

  {
    id: 'mi-04',
    topicId: 'matrix-intro',
    topic: 'מבנה מטריצה מורחבת',
    difficulty: 1,
    type: 'conceptual',
    question: 'מדוע פעולות שורה אלמנטריות על המטריצה המורחבת לא משנות את סט הפתרונות של המערכת?',
    options: [
      'כי כל פעולה הפיכה — ניתן לחזור למצב המקורי',
      'כי הפעולות משנות רק את הסדר של השורות',
      'כי הפעולות פועלות רק על הצד הימין',
      'כי הפעולות שומרות על ערכי המשתנים',
    ],
    correctAnswer: 0,
    explanation: 'כל פעולה שורה אלמנטרית היא הפיכה: החלפת שורות ניתן להחזיר, הכפלה בסקלר ≠ 0 ניתן לחלק, הוספת כפולה ניתן לחסר. הפיכות מבטיחה שכל פתרון של המטריצה המקורית הוא פתרון של המטריצה החדשה, ולהפך.',
    wrongAnswerFeedback: { 1: 'נכון שהחלפת שורות שומרת סדר, אבל שאר הפעולות עושות הרבה יותר מזה.', 2: 'הפעולות פועלות על כל האיברים בשורה, כולל הצד הימין.', 3: 'הפעולות לא "שומרות" על ערכי המשתנים — הן שומרות על סט הפתרונות דרך שקילות.' },
    commonMistakeTag: 'הסבר שגוי לשימור סט הפתרונות',
  },

  {
    id: 'mi-05',
    topicId: 'matrix-intro',
    topic: 'כתיבת מטריצה מורחבת',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'במטריצה המורחבת של המערכת הבאה, מה הערך בשורה 2, עמודה 3?\n\n  x + 2y − 3z = 4\n  5x − y + 2z = −1\n  3x + 4y − z = 0',
    correctAnswer: 2,
    explanation: 'המטריצה המורחבת:\n[ 1  2 −3 | 4 ]\n[ 5 −1  2 | −1]\n[ 3  4 −1 | 0 ]\nשורה 2, עמודה 3 = מקדם z במשוואה השנייה = 2.',
    commonMistakeTag: 'בלבול אינדקסים שורה/עמודה',
  },

  {
    id: 'mi-06',
    topicId: 'matrix-intro',
    topic: 'קריאת מטריצה מורחבת',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'מהי המשוואה המיוצגת על ידי השורה השלישית במטריצה:\n[ 1  2  0 | 3 ]\n[ 0  1 -1 | 5 ]\n[ 0  0  2 | 8 ]',
    options: ['2z = 8', 'z = 8', '0 + 0 + 2 = 8', '2z = 0'],
    correctAnswer: 0,
    explanation: 'שורה 3: [0, 0, 2 | 8] → 0·x + 0·y + 2·z = 8, כלומר 2z = 8. משמע z = 4.',
    wrongAnswerFeedback: { 1: 'לא פתרנו עדיין — השורה אומרת 2z = 8, לא z = 8.', 2: 'כתוב בצורה אנליטית: 0·x + 0·y + 2·z = 8 → 2z = 8.', 3: 'הצד הימין הוא 8, לא 0.' },
    commonMistakeTag: 'בלבול בין שורה לפתרון',
  },

  {
    id: 'mi-07',
    topicId: 'matrix-intro',
    topic: 'מבנה מטריצה מורחבת',
    difficulty: 3,
    type: 'conceptual',
    question: 'מטריצה מורחבת 3×5 (3 שורות, 5 עמודות). כמה משתנים ומשוואות יש במערכת?',
    options: [
      '3 משוואות, 4 משתנים',
      '3 משוואות, 5 משתנים',
      '5 משוואות, 3 משתנים',
      '4 משוואות, 5 משתנים',
    ],
    correctAnswer: 0,
    explanation: 'שורות = מספר משוואות = 3. עמודות = מספר משתנים + 1 (עמודת b) → 4 משתנים. לכן: 3 משוואות, 4 משתנים.',
    wrongAnswerFeedback: { 1: '5 עמודות אבל אחת מהן היא עמודת הצד הימין — נשארים 4 משתנים.', 2: 'שורות הן המשוואות, לא העמודות.', 3: 'שורות הן המשוואות (3), ועמודות − 1 הן המשתנים (4).' },
    commonMistakeTag: 'בלבול ממדי מטריצה מורחבת',
  },

  {
    id: 'mi-08',
    topicId: 'matrix-intro',
    topic: 'כתיבת מטריצה מורחבת',
    difficulty: 3,
    type: 'find-the-mistake',
    question: 'תלמיד כתב מטריצה מורחבת למערכת הבאה. מה הטעות?\n\n  x − 2y + 3z = 0\n  2x + y − z = 4\n  −x + 3y + 2z = −1',
    fauxSolution:
      '[ 1  -2  3 |  0 ]\n' +
      '[ 2   1 -1 |  4 ]\n' +
      '[ 1   3  2 | -1 ]',
    options: [
      'בשורה 3, מקדם x צריך להיות −1 ולא 1',
      'בשורה 2, מקדם y צריך להיות −1 ולא 1',
      'עמודת הצד הימין שגויה',
      'אין טעות',
    ],
    correctAnswer: 0,
    explanation: 'המשוואה השלישית היא −x + 3y + 2z = −1, לכן מקדם x הוא −1. התלמיד כתב 1 (חיובי) — שגיאת סימן.',
    wrongAnswerFeedback: { 1: 'מקדם y בשורה 2 הוא +1 — נכון.', 2: 'עמודת הצד הימין (0, 4, −1) נכונה.', 3: 'יש טעות — שים לב לסימן הראשון בשורה השלישית.' },
    commonMistakeTag: 'שגיאת סימן בכתיבת מטריצה',
  },

  {
    id: 'mi-09',
    topicId: 'matrix-intro',
    topic: 'מטריצת מקדמים',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'מה ההבדל בין מטריצת המקדמים A לבין המטריצה המורחבת [A|b]?',
    options: [
      '[A|b] מוסיפה את וקטור הצד הימין b כעמודה נוספת',
      '[A|b] מוסיפה שורה נוספת של קבועים',
      'A גדולה יותר מ-[A|b]',
      'אין הבדל — הן אותה מטריצה',
    ],
    correctAnswer: 0,
    explanation: 'מטריצת המקדמים A מכילה רק את מקדמי המשתנים. המטריצה המורחבת [A|b] מוסיפה את וקטור b (צד ימין של כל משוואה) כעמודה אחרונה, מופרדת בקו אנכי.',
    wrongAnswerFeedback: { 1: 'b מוסף כעמודה, לא כשורה.', 2: 'A לא יכולה להיות גדולה יותר — [A|b] כוללת את A ועוד.', 3: 'ההבדל הוא בדיוק עמודת b.' },
    commonMistakeTag: 'בלבול מטריצת מקדמים ומטריצה מורחבת',
  },

  {
    id: 'mi-10',
    topicId: 'matrix-intro',
    topic: 'קריאת מטריצה מורחבת',
    difficulty: 3,
    type: 'numeric-answer',
    question: 'מה הסכום של כל מקדמי המשתנה y במטריצה המורחבת:\n[ 1  3  -2 | 5 ]\n[ 0  -1  4 | 2 ]\n[ 2  0   1 | 3 ]',
    correctAnswer: 2,
    explanation: 'עמודת y (עמודה 2, לא עמודת b): 3, −1, 0. סכום: 3 + (−1) + 0 = 2.',
    commonMistakeTag: 'בלבול עמודות',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ROW-OPERATIONS  (ro-)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ro-01',
    topicId: 'row-operations',
    topic: 'חישוב פעולת שורה',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'בצע R₂ ← R₂ − 3·R₁ על המטריצה:\n[ 1   2  |  5 ]\n[ 3  -1  |  4 ]',
    options: [
      '[ 0  -7  | -11 ]',
      '[ 0   5  | -11 ]',
      '[ 0  -7  |   9 ]',
      '[ 0  -7  |  19 ]',
    ],
    correctAnswer: 0,
    explanation: 'R₂ − 3·R₁: (3−3·1, −1−3·2, 4−3·5) = (0, −7, −11). השורה הראשונה לא משתנה.',
    wrongAnswerFeedback: { 1: 'בדוק: −1 − 3·2 = −1 − 6 = −7, לא 5.', 2: 'בדוק: 4 − 3·5 = 4 − 15 = −11, לא 9.', 3: 'בדוק: 4 − 3·5 = 4 − 15 = −11, לא +19.' },
    commonMistakeTag: 'שגיאת חישוב בפעולת שורה',
  },

  {
    id: 'ro-02',
    topicId: 'row-operations',
    topic: 'זיהוי פעולת שורה',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'איזו פעולה הופכת:\n[ 1  2 | 3 ]\n[ 4  5 | 6 ]\nל:\n[ 1  2 | 3 ]\n[ 0 -3 | -6 ]?',
    options: [
      'R₂ ← R₂ − 4·R₁',
      'R₁ ← R₁ − 4·R₂',
      'R₂ ← R₂ + 4·R₁',
      'R₁ ↔ R₂',
    ],
    correctAnswer: 0,
    explanation: '4 − 4·1 = 0 ✓, 5 − 4·2 = −3 ✓, 6 − 4·3 = −6 ✓. הפעולה היא R₂ ← R₂ − 4·R₁.',
    wrongAnswerFeedback: { 1: 'אם מחסרים מ-R₁, R₁ תשתנה — אבל R₁ לא השתנתה.', 2: 'R₂ ← R₂ + 4·R₁ ייתן 4+4=8 בעמודה 1, לא 0.', 3: 'החלפת שורות תיתן [4,5|6] בשורה 1 — לא זה שקרה.' },
    commonMistakeTag: 'זיהוי כיוון הפעולה',
  },

  {
    id: 'ro-03',
    topicId: 'row-operations',
    topic: 'חישוב סקלר לאפוס',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'בכמה יש להכפיל את R₁ כדי לאפס את האיבר הראשון בשורה 2 בפעולה R₂ ← R₂ − c·R₁?\n\n[ 2   1 | 4 ]\n[ 6  -3 | 2 ]',
    correctAnswer: 3,
    explanation: 'האיבר הראשון של R₂ הוא 6. R₁[1] = 2. כדי לאפס: 6 − c·2 = 0 → c = 3.',
    commonMistakeTag: 'חישוב סקלר לאפוס',
  },

  {
    id: 'ro-04',
    topicId: 'row-operations',
    topic: 'חוקיות פעולת שורה',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'אילו מהפעולות הבאות פסולה כפעולת שורה?',
    options: [
      'R₁ ← 0 · R₁',
      'R₁ ← 5 · R₁',
      'R₁ ← R₁ + 3 · R₂',
      'R₁ ↔ R₃',
    ],
    correctAnswer: 0,
    explanation: 'הכפלה באפס מוחקת את כל המידע בשורה ואינה הפיכה — פעולה אסורה. שלוש הפעולות החוקיות הן: הכפלה בסקלר ≠ 0, הוספת כפולה של שורה אחרת, החלפת שתי שורות.',
    wrongAnswerFeedback: { 1: 'הכפלה ב-5 (≠0) חוקית לחלוטין.', 2: 'הוספת כפולה של שורה אחרת — חוקית.', 3: 'החלפת שורות — חוקית.' },
    commonMistakeTag: 'הכפלה באפס כפעולה פסולה',
  },

  {
    id: 'ro-05',
    topicId: 'row-operations',
    topic: 'סדר פעולות',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'על מנת לאפס את העמודה הראשונה בשורות 2 ו-3, מה הסדר הנכון?\n\n[ 1  2  | 1 ]\n[ 2  5  | 3 ]\n[ 3  1  | 2 ]',
    options: [
      'R₂ ← R₂ − 2R₁, ואז R₃ ← R₃ − 3R₁',
      'R₃ ← R₃ − 3R₂, ואז R₂ ← R₂ − 2R₁',
      'R₁ ← R₁ + 2R₂, ואז R₁ ← R₁ + 3R₃',
      'R₂ ↔ R₃, ואז R₂ ← R₂ − 2R₁',
    ],
    correctAnswer: 0,
    explanation: 'כדי לאפס עמודה 1 בשורות 2 ו-3 תוך שימוש ב-R₁ כציר, מחסרים את המכפלה המתאימה של R₁. סדר הפעולות לא משנה כאן, אבל הפעולות הנכונות הן R₂ − 2R₁ ו-R₃ − 3R₁.',
    wrongAnswerFeedback: { 1: 'R₃ − 3R₂ תשנה R₃ ביחס לR₂ המשוּנה — לא מה שרוצים.', 2: 'פועלים על R₁, לא נרצה לשנות אותה.', 3: 'החלפה תגרום לשינוי הציר — לא הגישה הפשוטה.' },
    commonMistakeTag: 'בחירת שורת ציר',
  },

  {
    id: 'ro-06',
    topicId: 'row-operations',
    topic: 'חישוב פעולת שורה',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'לאחר R₂ ← R₂ − 2·R₁ על:\n[ 3  1  -2 | 5 ]\n[ 6  4   1 | 7 ]\nמה הערך בשורה 2, עמודה 3?',
    correctAnswer: 5,
    explanation: 'R₂[3] − 2·R₁[3] = 1 − 2·(−2) = 1 + 4 = 5.',
    commonMistakeTag: 'שגיאת סימן בחיסור',
  },

  {
    id: 'ro-07',
    topicId: 'row-operations',
    topic: 'מטרת פעולות שורה',
    difficulty: 3,
    type: 'conceptual',
    question: 'מה המטרה של פעולת R₂ ← R₂ − (a₂₁/a₁₁)·R₁ בתהליך הגאוסיאני?',
    options: [
      'לאפס את האיבר a₂₁ בעמודה הראשונה של שורה 2',
      'לאפס את כל עמודה 1',
      'לנרמל את שורה 1',
      'להפוך את המטריצה לאלכסונית',
    ],
    correctAnswer: 0,
    explanation: 'הפעולה מחסרת מ-R₂ את המכפלה המתאימה של R₁ כדי לאפס בדיוק את האיבר הראשון בשורה 2. שאר האיברים בR₂ משתנים, אבל שורה 1 עצמה לא מושפעת.',
    wrongAnswerFeedback: { 1: 'הפעולה מאפסת רק את האיבר בשורה 2, לא את כל עמודה 1.', 2: 'נרמול הוא פעולה אחרת (חלוקה בציר).', 3: 'דירוג גאוסיאני מכוון ל-REF, לא לאלכסון.' },
    commonMistakeTag: 'מטרת פעולת אפוס',
  },

  {
    id: 'ro-08',
    topicId: 'row-operations',
    topic: 'חישוב פעולת שורה',
    difficulty: 2,
    type: 'find-the-mistake',
    question: 'תלמיד ביצע R₁ ↔ R₂ על המטריצה ואז R₂ ← R₂ − 2·R₁. מה הטעות בתוצאה?\n\nמטריצה מקורית:\n[ 2  4 | 6 ]\n[ 1  3 | 5 ]',
    fauxSolution:
      'לאחר R₁ ↔ R₂:\n[ 1  3 | 5 ]\n[ 2  4 | 6 ]\n\nלאחר R₂ ← R₂ − 2·R₁:\n[ 1  3 |  5 ]\n[ 0  2 | -4 ]',
    options: [
      'b₂ שגוי — צריך להיות −4 (נכון), אבל a₂₂ אמור להיות −2',
      'שתי הפעולות בוצעו נכון',
      'הסדר של פעולות הוחלף',
      'שורה 1 השתנתה בשלב השני',
    ],
    correctAnswer: 1,
    explanation: 'שתי הפעולות בוצעו נכון: לאחר ההחלפה R₁=[1,3|5], R₂=[2,4|6]. אז R₂−2R₁: (2−2, 4−6, 6−10) = (0, −2, −4). אבל התלמיד כתב [0,2,−4] — a₂₂ צריך להיות −2 לא 2!',
    wrongAnswerFeedback: { 0: 'נכון — a₂₂ = 4 − 2·3 = −2, לא 2.', 2: 'הסדר מעולה — קודם מחליפים, אחר כך מאפסים.', 3: 'שורה 1 לא משתנה בR₂ ← R₂ − 2R₁.' },
    commonMistakeTag: 'שגיאת סימן בחישוב פעולת שורה',
  },

  {
    id: 'ro-09',
    topicId: 'row-operations',
    topic: 'פעולות שורה — תכנון',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'כדי לאפס את האיבר (3,1) במטריצה:\n[ 2  1  3 | 4 ]\n[ 0  3 -1 | 2 ]\n[ 4  0  5 | 1 ]\nאיזו פעולה נדרשת?',
    options: [
      'R₃ ← R₃ − 2·R₁',
      'R₁ ← R₁ − 2·R₃',
      'R₃ ← R₃ + 2·R₁',
      'R₃ ← (1/2)·R₃',
    ],
    correctAnswer: 0,
    explanation: 'האיבר (3,1) הוא 4. הציר בשורה 1 הוא 2. לאפס: 4 − c·2 = 0 → c = 2. הפעולה: R₃ ← R₃ − 2·R₁.',
    wrongAnswerFeedback: { 1: 'זה ישנה את R₁ — לא רצוי כשR₁ הוא הציר.', 2: 'הסימן הפוך: 4 + 2·2 = 8, לא 0.', 3: 'חלוקה תנרמל אבל לא תאפס — (1/2)·4 = 2 ≠ 0.' },
    commonMistakeTag: 'חישוב מכפיל לאפוס',
  },

  {
    id: 'ro-10',
    topicId: 'row-operations',
    topic: 'פעולות שורה — הבנה',
    difficulty: 1,
    type: 'conceptual',
    question: 'מה קורה לסט הפתרונות של מערכת משוואות כאשר מחליפים בין שתי שורות במטריצה?',
    options: [
      'סט הפתרונות נשאר זהה',
      'הפתרון מוכפל ב-1',
      'ה-rank של המטריצה משתנה',
      'הפתרון הופך לא-יחיד',
    ],
    correctAnswer: 0,
    explanation: 'החלפת שורות משנה את סדר המשוואות במערכת — אבל לא את תוכנן. סט הפתרונות נשאר זהה לחלוטין כי אותן משוואות מוגדרות, רק בסדר שונה.',
    wrongAnswerFeedback: { 1: 'הפתרון לא "מוכפל" — הוא נשאר בדיוק אותו הדבר.', 2: 'ה-rank תמיד נשמר בפעולות שורה.', 3: 'יחידות הפתרון לא מושפעת מהחלפת שורות.' },
    commonMistakeTag: 'השפעת החלפת שורות',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // REF-RREF  (rr-)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'rr-01',
    topicId: 'ref-rref',
    topic: 'זיהוי REF',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'איזו מהמטריצות הבאות נמצאת ב-REF (צורה מדורגת)?',
    options: [
      '[ 1  2  3 ]\n[ 0  1  4 ]\n[ 0  0  1 ]',
      '[ 1  2  3 ]\n[ 0  0  0 ]\n[ 0  1  4 ]',
      '[ 1  2  3 ]\n[ 1  0  4 ]\n[ 0  0  1 ]',
      '[ 0  1  3 ]\n[ 1  0  4 ]\n[ 0  0  1 ]',
    ],
    correctAnswer: 0,
    explanation: 'ב-REF: (1) שורות האפס בתחתית, (2) הציר המוביל בכל שורה נמצא משמאל לציר בשורה הבאה. אפשרות א מקיימת שני התנאים.',
    wrongAnswerFeedback: { 1: 'שורה האפס (שורה 2) מופיעה לפני שורה עם ציר — שבירת כלל ה-REF.', 2: 'שורה 2 מתחילה בציר בעמודה 1, אבל שורה 1 גם מתחילה בעמודה 1 — לא REF.', 3: 'שורה 1 מתחילה בעמודה 2, אבל שורה 2 מתחילה בעמודה 1 — הציר "זזה ימינה", לא שמאלה.' },
    commonMistakeTag: 'הגדרת REF',
  },

  {
    id: 'rr-02',
    topicId: 'ref-rref',
    topic: 'זיהוי RREF',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'איזו מהמטריצות נמצאת ב-RREF (צורה מדורגת מצומצמת)?',
    options: [
      '[ 1  0  0  2 ]\n[ 0  1  0  3 ]\n[ 0  0  1  4 ]',
      '[ 1  2  0  5 ]\n[ 0  1  0  3 ]\n[ 0  0  1  4 ]',
      '[ 1  0  3  2 ]\n[ 0  2  0  6 ]\n[ 0  0  1  4 ]',
      '[ 1  0  0  2 ]\n[ 0  0  1  3 ]\n[ 0  1  0  4 ]',
    ],
    correctAnswer: 0,
    explanation: 'ב-RREF: כל ציר מוביל הוא 1, מסביבו כל שאר האיברים באותה עמודה הם 0. רק אפשרות א מקיימת זאת — צירים ב-(1,1),(2,2),(3,3) עם 0 בכל יתרת העמודות.',
    wrongAnswerFeedback: { 1: 'בעמודה של הציר (2,2), יש ערך 2 בשורה 1 — לא RREF.', 2: 'הציר בשורה 2 הוא 2 (לא 1) — לא RREF.', 3: 'שורה האפס הראשונה צריכה לבוא לאחר שורות עם ציר — הסדר שגוי.' },
    commonMistakeTag: 'הגדרת RREF',
  },

  {
    id: 'rr-03',
    topicId: 'ref-rref',
    topic: 'מעבר מ-REF ל-RREF',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'המטריצה נמצאת ב-REF. מה הצעד הבא לקבלת RREF?\n\n[ 1  2  0 | 3 ]\n[ 0  0  1 | 4 ]',
    options: [
      'R₁ ← R₁ − 0·R₂ (כלום — המטריצה כבר ב-RREF)',
      'R₁ ← R₁ − 2·R₂',
      'R₂ ← R₂ − 2·R₁',
      'R₁ ← (1/2)·R₁',
    ],
    correctAnswer: 0,
    explanation: 'הציר בשורה 2 הוא בעמודה 3 (ערך 1). בשורה 1, עמודה 3 הערך הוא 0 — כבר מאופס. הציר בשורה 1 הוא 1. לכן המטריצה כבר ב-RREF.',
    wrongAnswerFeedback: { 1: 'R₂ משפיע על עמודה 3, אבל עמודה 3 בשורה 1 כבר 0.', 2: 'עמודה 2 אינה עמודת ציר (בשורה 2 יש 0 שם) — לא צריך לאפסה.', 3: 'הציר בשורה 1 כבר 1.' },
    commonMistakeTag: 'זיהוי סיום RREF',
  },

  {
    id: 'rr-04',
    topicId: 'ref-rref',
    topic: 'ספירת צירים',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'כמה צירים מובילים יש במטריצה:\n[ 1  2  0  3 ]\n[ 0  0  1  4 ]\n[ 0  0  0  0 ]',
    correctAnswer: 2,
    explanation: 'ציר מוביל הוא האיבר הראשון השונה מאפס בשורה (ב-REF). שורה 1: ציר בעמודה 1. שורה 2: ציר בעמודה 3. שורה 3: שורת אפסים — אין ציר. סך הכל 2 צירים.',
    commonMistakeTag: 'ספירת צירים מובילים',
  },

  {
    id: 'rr-05',
    topicId: 'ref-rref',
    topic: 'REF לעומת RREF',
    difficulty: 3,
    type: 'conceptual',
    question: 'מדוע כל מטריצה היא בעלת RREF יחיד, אך REF לא יחיד?',
    options: [
      'RREF מחייב ספציפית שצירים=1 ויתרת עמודה=0, בעוד REF מאפשר צירים שרירותיים',
      'כי ל-RREF יש יותר כללים',
      'כי REF לא ייחודי בגלל החלפת שורות',
      'RREF גם אינו יחיד',
    ],
    correctAnswer: 0,
    explanation: 'REF מאפשר צירים בכל ערך ≠ 0, ואפשר לבצע פעולות נוספות ועדיין להישאר ב-REF. RREF מחייב שהצירים הם בדיוק 1 ושאר העמודה מאופסת — אילוצים אלה מחייבים ייצוג יחיד.',
    wrongAnswerFeedback: { 1: 'נכון שיש יותר כללים, אבל הסיבה המדויקת היא האילוצים הנוספים.', 2: 'החלפת שורות יוצרת REF שקול — זו דוגמה אבל לא ההסבר המלא.', 3: 'RREF יחיד — זה תוצאה מוכחת (משפט RREF).' },
    commonMistakeTag: 'ייחודיות RREF',
  },

  {
    id: 'rr-06',
    topicId: 'ref-rref',
    topic: 'rank',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'מה ה-rank של המטריצה:\n[ 2  4  -2 ]\n[ 1  2  -1 ]\n[ 3  6  -3 ]',
    correctAnswer: 1,
    explanation: 'שורה 2 = (1/2)·שורה 1, שורה 3 = (3/2)·שורה 1. לאחר דירוג יישארו שורה 1 בלבד כציר. rank = 1.',
    commonMistakeTag: 'חישוב rank',
  },

  {
    id: 'rr-07',
    topicId: 'ref-rref',
    topic: 'עמודות ציר',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'בREF הבאה, מה הן עמודות הציר (pivot columns)?\n\n[ 1  3  0  2 ]\n[ 0  0  1  5 ]\n[ 0  0  0  0 ]',
    options: ['עמודות 1 ו-3', 'עמודות 1 ו-2', 'עמודות 1, 2 ו-3', 'עמודות 2 ו-3'],
    correctAnswer: 0,
    explanation: 'עמודות ציר הן העמודות שבהן נמצאים הצירים המובילים. שורה 1: ציר בעמודה 1. שורה 2: ציר בעמודה 3. לכן עמודות הציר הן 1 ו-3.',
    wrongAnswerFeedback: { 1: 'עמודה 2 אינה עמודת ציר — אין בה ציר מוביל (יש שם 3 ו-0, לא מוביל).', 2: 'יש שני צירים בלבד, לא שלושה.', 3: 'עמודה 2 אינה עמודת ציר.' },
    commonMistakeTag: 'זיהוי עמודות ציר',
  },

  {
    id: 'rr-08',
    topicId: 'ref-rref',
    topic: 'REF',
    difficulty: 3,
    type: 'find-the-mistake',
    question: 'תלמיד דירג מטריצה וטוען שהתוצאה היא REF. מה הבעיה?',
    fauxSolution:
      '[ 2  4  6 | 8 ]\n' +
      '[ 0  3  1 | 2 ]\n' +
      '[ 0  0  0 | 0 ]',
    options: [
      'אין טעות — זו REF תקינה',
      'שורה האפסים חייבת להיות למעלה',
      'הציר בשורה 1 צריך להיות 1, לא 2',
      'אין מספיק שורות לREF',
    ],
    correctAnswer: 0,
    explanation: 'REF לא דורשת שהצירים יהיו 1 — זה דרישת RREF. הצירים בשורות 1 ו-2 (2 ו-3) גדלים משמאל לימין, שורת האפסים בתחתית — REF תקינה. רק RREF מחייבת צירים=1.',
    wrongAnswerFeedback: { 1: 'שורות האפס תמיד בתחתית — כאן זה נכון.', 2: 'REF לא מחייבת צירים=1 — רק RREF כן.', 3: 'גודל המטריצה אינו מגביל REF.' },
    commonMistakeTag: 'בלבול REF / RREF',
  },

  {
    id: 'rr-09',
    topicId: 'ref-rref',
    topic: 'rank',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'מהו ה-rank של מטריצה m×n שכל שורותיה בלתי-תלויות לינארית?',
    options: ['m', 'n', 'min(m,n)', 'max(m,n)'],
    correctAnswer: 0,
    explanation: 'ה-rank שווה למספר השורות הבלתי-תלויות לינארית. אם כל m השורות בלתי-תלויות, אז rank = m (בהנחה שm ≤ n, שאחרת לא ייתכן).',
    wrongAnswerFeedback: { 1: 'n הוא מספר העמודות — rank ≤ min(m,n).', 2: 'min(m,n) זה ה-rank המקסימלי האפשרי — אבל אם כל השורות בלתי-תלויות, מקבלים בדיוק m.', 3: 'max לא רלוונטי לrank.' },
    commonMistakeTag: 'הגדרת rank',
  },

  {
    id: 'rr-10',
    topicId: 'ref-rref',
    topic: 'RREF ידנית',
    difficulty: 3,
    type: 'numeric-answer',
    question: 'לאחר הבאת המטריצה ל-RREF:\n[ 1  2  3 ]\n[ 2  4  6 ]\n[ 0  1  2 ]\nמה ה-rank?',
    correctAnswer: 2,
    explanation: 'שורה 2 = 2·שורה 1 — מאופסת. לאחר דירוג: שורה 1 [1,2,3], שורה 2 מאופסת, שורה 3 [0,1,2]. RREF: [1,0,-1] / [0,1,2] / [0,0,0]. שני צירים → rank = 2.',
    commonMistakeTag: 'שורות תלויות לינארית',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SOLUTIONS-COUNT  (sc-)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'sc-01',
    topicId: 'solutions-count',
    topic: 'מספר פתרונות',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'לאחר דירוג המטריצה המורחבת מתקבל:\n[ 1  0 | 3 ]\n[ 0  1 | 5 ]\n[ 0  0 | 0 ]\nכמה פתרונות יש למערכת?',
    options: ['פתרון יחיד', 'אין פתרון', 'אינסוף פתרונות', 'שני פתרונות'],
    correctAnswer: 0,
    explanation: 'יש 2 צירים, 2 משתנים — rank(A) = rank([A|b]) = 2 = n. המשוואה האחרונה 0=0 לא מוסיפה אילוץ. תוצאה: פתרון יחיד: x=3, y=5.',
    wrongAnswerFeedback: { 1: 'שורת 0=0 אינה סתירה — היא אינה מוסיפה אילוץ.', 2: 'כדי לקבל אינסוף פתרונות נדרשים משתנים חופשיים.', 3: 'מערכת ליניארית לא יכולה להיות בעלת בדיוק 2 פתרונות.' },
    commonMistakeTag: 'בלבול שורת אפסים',
  },

  {
    id: 'sc-02',
    topicId: 'solutions-count',
    topic: 'חוסר פתרון',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'לאחר דירוג מתקבל:\n[ 1  2 | 3 ]\n[ 0  0 | 5 ]\nמה מסקנת מספר הפתרונות?',
    options: ['אין פתרון', 'פתרון יחיד', 'אינסוף פתרונות', 'שני פתרונות'],
    correctAnswer: 0,
    explanation: 'שורה 2 אומרת 0·x + 0·y = 5, כלומר 0 = 5 — סתירה. rank(A) = 1 < rank([A|b]) = 2. לכן אין פתרון למערכת.',
    wrongAnswerFeedback: { 1: 'שורה 2 יוצרת סתירה — לא ייתכן פתרון.', 2: 'לאינסוף פתרונות היה נדרש 0 = 0, לא 0 = 5.', 3: 'מערכות ליניאריות לא יכולות להיות בעלות 2 פתרונות.' },
    commonMistakeTag: 'זיהוי סתירה',
  },

  {
    id: 'sc-03',
    topicId: 'solutions-count',
    topic: 'אינסוף פתרונות',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'מתי מערכת ליניארית תקיימת (consistent) בעלת אינסוף פתרונות?',
    options: [
      'כאשר rank(A) = rank([A|b]) < n',
      'כאשר rank(A) < rank([A|b])',
      'כאשר rank(A) = n',
      'כאשר מספר השורות < מספר העמודות',
    ],
    correctAnswer: 0,
    explanation: 'קיום פתרון (תקיימות): rank(A) = rank([A|b]). אינסוף פתרונות: rank(A) < n (יש משתנים חופשיים). שניהם ביחד: rank(A) = rank([A|b]) < n.',
    wrongAnswerFeedback: { 1: 'rank(A) < rank([A|b]) פירושו אין פתרון.', 2: 'rank(A) = n פירושו פתרון יחיד (בהנחה שהמערכת תקיימת).', 3: 'זה גורם הכרחי אך לא מספיק.' },
    commonMistakeTag: 'תנאי אינסוף פתרונות',
  },

  {
    id: 'sc-04',
    topicId: 'solutions-count',
    topic: 'rank ומספר פתרונות',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'מערכת עם 4 משוואות ו-3 משתנים שוב rank(A) = 2, rank([A|b]) = 2. כמה פתרונות?',
    options: ['אינסוף', 'פתרון יחיד', 'אין פתרון', 'אי-אפשר לקבוע'],
    correctAnswer: 0,
    explanation: 'rank(A) = rank([A|b]) = 2 → המערכת תקיימת. n = 3 משתנים, rank = 2, כלומר 3 − 2 = 1 משתנה חופשי → אינסוף פתרונות.',
    wrongAnswerFeedback: { 1: 'לפתרון יחיד נדרש rank(A) = n = 3.', 2: 'rank(A) = rank([A|b]) מבטיח קיום פתרון.', 3: 'ניתן לקבוע — rank קובע את התשובה.' },
    commonMistakeTag: 'משתנים חופשיים ואינסוף פתרונות',
  },

  {
    id: 'sc-05',
    topicId: 'solutions-count',
    topic: 'rank',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'מה rank(A) עבור:\n[ 1  2  3 ]\n[ 0  0  0 ]\n[ 2  4  6 ]',
    correctAnswer: 1,
    explanation: 'שורה 2 = שורת אפסים. שורה 3 = 2·שורה 1. לאחר דירוג נשאר רק ציר אחד → rank = 1.',
    commonMistakeTag: 'זיהוי שורות תלויות',
  },

  {
    id: 'sc-06',
    topicId: 'solutions-count',
    topic: 'מספר פתרונות',
    difficulty: 3,
    type: 'conceptual',
    question: 'מדוע מערכת ליניארית לא יכולה להיות בעלת בדיוק שני פתרונות?',
    options: [
      'כי צירוף קווי של שני פתרונות הוא גם פתרון — תמיד יש אינסוף פתרונות',
      'כי זה נוגד את חוקי האלגברה',
      'כי rank תמיד שווה למספר השורות',
      'כי מערכת ליניארית היא גיאומטרית',
    ],
    correctAnswer: 0,
    explanation: 'אם x₁ ו-x₂ הם שני פתרונות של Ax=b, אז x₁ + t(x₂−x₁) הוא פתרון לכל t∈ℝ — קו שלם של פתרונות. לכן אם יש שני פתרונות, יש אינסוף.',
    wrongAnswerFeedback: { 1: 'חוקי האלגברה הם הסיבה, אך הנוסחה הספציפית היא הצירוף הקווי.', 2: 'rank קשור אבל לא ההסבר ישיר.', 3: 'נכון גיאומטרית, אבל לא ההסבר האלגברי.' },
    commonMistakeTag: 'הגדרת מרחב פתרונות',
  },

  {
    id: 'sc-07',
    topicId: 'solutions-count',
    topic: 'מספר פתרונות',
    difficulty: 2,
    type: 'find-the-mistake',
    question: 'תלמיד ביצע דירוג וסיכם: "יש אינסוף פתרונות". האם הוא צודק?',
    fauxSolution:
      'לאחר דירוג:\n' +
      '[ 1  3 | 2 ]\n' +
      '[ 0  0 | 7 ]\n\n' +
      'rank(A) = 1 < n = 2 → אינסוף פתרונות',
    options: [
      'לא — שורה 2 היא 0 = 7, סתירה → אין פתרון',
      'כן — rank(A) < n מספיק לאינסוף פתרונות',
      'לא — rank(A) צריך להיות שווה ל-n',
      'כן — אין שורת אפסים מלאה',
    ],
    correctAnswer: 0,
    explanation: 'שורה 2: [0, 0 | 7] פירושה 0 = 7 — סתירה. rank([A|b]) = 2 > rank(A) = 1. זהו תנאי "אין פתרון". התלמיד שכח לבדוק את הצד הימני.',
    wrongAnswerFeedback: { 1: 'rank(A) < n מבטיח אינסוף רק אם המערכת תקיימת.', 2: 'rank(A) = n נדרש לפתרון יחיד, לא לאינסוף.', 3: 'שורה 2 אינה שורת אפסים — הצד הימין הוא 7.' },
    commonMistakeTag: 'שגיאה בבדיקת תקיימות',
  },

  {
    id: 'sc-08',
    topicId: 'solutions-count',
    topic: 'rank ומספר פתרונות',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'מערכת עם rank(A) = 3 ו-5 משתנים שהיא תקיימת. כמה משתנים חופשיים יש?',
    correctAnswer: 2,
    explanation: 'מספר משתנים חופשיים = מספר משתנים − rank(A) = 5 − 3 = 2.',
    commonMistakeTag: 'ספירת משתנים חופשיים',
  },

  {
    id: 'sc-09',
    topicId: 'solutions-count',
    topic: 'מספר פתרונות',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'מערכת ריבועית (מספר שווה של משוואות ומשתנים) עם rank(A) = n. כמה פתרונות יש אם היא תקיימת?',
    options: ['פתרון יחיד', 'אינסוף', 'אין פתרון', 'תלוי בb'],
    correctAnswer: 0,
    explanation: 'rank(A) = n ומערכת תקיימת → פתרון יחיד. rank(A) = n פירושו אין משתנים חופשיים.',
    wrongAnswerFeedback: { 1: 'למשתנים חופשיים נדרש rank(A) < n.', 2: 'אם המערכת תקיימת ו-rank = n, בהכרח יש פתרון.', 3: 'b קובע את הפתרון הספציפי, לא את כמותו.' },
    commonMistakeTag: 'rank = n פירושו פתרון יחיד',
  },

  {
    id: 'sc-10',
    topicId: 'solutions-count',
    topic: 'תנאי תקיימות',
    difficulty: 3,
    type: 'conceptual',
    question: 'מתי rank(A) ≠ rank([A|b])?',
    options: [
      'כאשר וקטור b לא שייך לטווח של A',
      'כאשר A סינגולרית',
      'כאשר n > m',
      'כאשר כל שורות A בלתי-תלויות',
    ],
    correctAnswer: 0,
    explanation: 'rank([A|b]) > rank(A) מתרחש כאשר הוספת עמודת b "מרחיבה" את מרחב השורות — כלומר b לא ניתן לייצוג כצירוף קווי של עמודות A, ולכן b לא נמצאת בטווח (image) של A.',
    wrongAnswerFeedback: { 1: 'סינגולריות מגבילה את rank(A), אבל לא בהכרח גורמת לrank([A|b]) להיות גדול יותר.', 2: 'n > m הוא תנאי לאינסוף פתרונות, לא לחוסר פתרון.', 3: 'שורות בלתי-תלויות מחזקות את rank(A) — לא גורמות לסתירה.' },
    commonMistakeTag: 'תנאי אי-תקיימות',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FREE-VARIABLES  (fv-)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'fv-01',
    topicId: 'free-variables',
    topic: 'זיהוי משתנים חופשיים',
    difficulty: 1,
    type: 'multiple-choice',
    question: 'ב-RREF הבאה, אילו משתנים חופשיים?\n\n[ 1  2  0  3 | 5 ]\n[ 0  0  1  4 | 2 ]\n[ 0  0  0  0 | 0 ]',
    options: [
      'x₂ ו-x₄',
      'x₁ ו-x₃',
      'x₁, x₂, x₃',
      'x₄ בלבד',
    ],
    correctAnswer: 0,
    explanation: 'עמודות ציר: 1 (x₁) ו-3 (x₃). עמודות שאינן ציר: 2 (x₂) ו-4 (x₄). המשתנים שאינם ציר הם החופשיים: x₂ ו-x₄.',
    wrongAnswerFeedback: { 1: 'x₁ ו-x₃ הם ציר (pivot variables) — לא חופשיים.', 2: 'יש כאן שני משתנים חופשיים, לא שלושה.', 3: 'גם x₂ הוא חופשי — עמודה 2 אינה עמודת ציר.' },
    commonMistakeTag: 'זיהוי משתנים חופשיים vs ציר',
  },

  {
    id: 'fv-02',
    topicId: 'free-variables',
    topic: 'ספירת משתנים חופשיים',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'RREF של מערכת עם 5 משתנים נותנת rank = 3. כמה משתנים חופשיים?',
    correctAnswer: 2,
    explanation: 'מספר משתנים חופשיים = n − rank = 5 − 3 = 2.',
    commonMistakeTag: 'נוסחת משתנים חופשיים',
  },

  {
    id: 'fv-03',
    topicId: 'free-variables',
    topic: 'ביטוי פתרון כללי',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'מ-RREF:\n[ 1  0  2 | 4 ]\n[ 0  1 -1 | 3 ]\nמה הפתרון הכללי? (x₃ = t)',
    options: [
      'x₁ = 4 − 2t, x₂ = 3 + t, x₃ = t',
      'x₁ = 4 + 2t, x₂ = 3 − t, x₃ = t',
      'x₁ = 4 − 2t, x₂ = 3 − t, x₃ = t',
      'x₁ = 4, x₂ = 3, x₃ = t',
    ],
    correctAnswer: 0,
    explanation: 'שורה 1: x₁ + 2x₃ = 4 → x₁ = 4 − 2t. שורה 2: x₂ − x₃ = 3 → x₂ = 3 + t. x₃ = t חופשי.',
    wrongAnswerFeedback: { 1: 'שורה 1: x₁ = 4 − 2t (פחות, לא פלוס).', 2: 'שורה 2: x₂ − x₃ = 3 → x₂ = 3 + t (פלוס, כי מעבירים −t להפך).', 3: 'x₁ ו-x₂ תלויים ב-t.' },
    commonMistakeTag: 'ביטוי ציר בפונקציה של חופשי',
  },

  {
    id: 'fv-04',
    topicId: 'free-variables',
    topic: 'ממד מרחב הפתרונות',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'מרחב הפתרונות של מערכת הומוגנית עם 4 משתנים ו-rank 3 הוא:',
    options: [
      'קו (ממד 1) במרחב ℝ⁴',
      'מישור (ממד 2) במרחב ℝ⁴',
      'נקודה בלבד',
      'כל ℝ⁴',
    ],
    correctAnswer: 0,
    explanation: 'מרחב הפתרונות ההומוגני (kernel) הוא תת-מרחב של ממד = n − rank = 4 − 3 = 1. ממד 1 = קו דרך הראשית.',
    wrongAnswerFeedback: { 1: 'ממד 2 מתקבל כאשר יש 2 משתנים חופשיים (n − rank = 2).', 2: 'נקודה אחת (הפתרון הטריוויאלי) מתקבלת כאשר ה-rank = n.', 3: 'כל ℝ⁴ מתקבל רק אם rank = 0.' },
    commonMistakeTag: 'ממד kernel',
  },

  {
    id: 'fv-05',
    topicId: 'free-variables',
    topic: 'פתרון פרטי ופתרון הומוגני',
    difficulty: 3,
    type: 'conceptual',
    question: 'מה הקשר בין הפתרון הפרטי x_p לבין הפתרון ההומוגני של Ax = b?',
    options: [
      'כל פתרון הוא x_p + v כאשר v הוא פתרון של Ax = 0',
      'הפתרון הפרטי הוא תמיד הפתרון של Ax = 0',
      'הפתרון הכללי הוא x_p בלבד',
      'אין קשר בין השניים',
    ],
    correctAnswer: 0,
    explanation: 'אם x_p הוא פתרון פרטי כלשהו של Ax = b, אז כל פתרון x מקיים A(x − x_p) = 0, כלומר x − x_p הוא פתרון הומוגני. לכן: x = x_p + (פתרון הומוגני).',
    wrongAnswerFeedback: { 1: 'Ax_p = b, לא 0.', 2: 'הפתרון הכללי כולל גם את הרכיב ההומוגני.', 3: 'הקשר מרכזי — מבנה הפתרון הכללי מבוסס עליו.' },
    commonMistakeTag: 'מבנה פתרון כללי',
  },

  {
    id: 'fv-06',
    topicId: 'free-variables',
    topic: 'זיהוי משתנים חופשיים',
    difficulty: 2,
    type: 'multiple-choice',
    question: 'ב-RREF:\n[ 1  0  3  0 | 2 ]\n[ 0  0  0  1 | 5 ]\nאילו משתנים הם ציר?',
    options: ['x₁ ו-x₄', 'x₂ ו-x₃', 'x₁ ו-x₃', 'x₁, x₂, x₄'],
    correctAnswer: 0,
    explanation: 'עמודת ציר = עמודה עם ציר מוביל (1 ש-0 מסביבו). עמודה 1: ציר בשורה 1. עמודה 4: ציר בשורה 2. לכן x₁ ו-x₄ הם משתני ציר.',
    wrongAnswerFeedback: { 1: 'x₂ ו-x₃ אינם ציר — עמודות 2 ו-3 לא מכילות ציר מוביל.', 2: 'עמודה 3 אינה עמודת ציר (יש בה 3 ו-0 — לא ציר מוביל בשורה שלה).', 3: 'x₂ לא ציר — עמודה 2 כולה אפסים.' },
    commonMistakeTag: 'זיהוי עמודות ציר',
  },

  {
    id: 'fv-07',
    topicId: 'free-variables',
    topic: 'פתרון כללי',
    difficulty: 3,
    type: 'find-the-mistake',
    question: 'תלמיד כתב פתרון כללי מ-RREF:\n[ 1  2  0 | 3 ]\n[ 0  0  1 | 4 ]\nמה הטעות?',
    fauxSolution:
      'x₂ = t (חופשי)\nx₃ = 4\nx₁ = 3 − 2t\n\nפתרון: (3−2t, t, 4)',
    options: [
      'אין טעות — הפתרון נכון',
      'סימן x₁ שגוי — צריך x₁ = 3 + 2t',
      'x₃ = t היה צריך להיות המשתנה החופשי',
      'חסר פתרון פרטי מפורש',
    ],
    correctAnswer: 0,
    explanation: 'שורה 1: x₁ + 2x₂ = 3, x₂ = t → x₁ = 3 − 2t ✓. שורה 2: x₃ = 4 ✓. x₂ הוא החופשי ✓. הפתרון (3−2t, t, 4) נכון לחלוטין.',
    wrongAnswerFeedback: { 1: 'x₁ = 3 − 2t נכון: x₁ + 2t = 3 → x₁ = 3 − 2t.', 2: 'x₃ הוא ציר (עמודה 3 מכילה ציר) — x₂ הוא החופשי, נכון.', 3: 'הפתרון (3, 0, 4) בt=0 הוא פתרון פרטי — הוא כלול.' },
    commonMistakeTag: 'אימות פתרון כללי',
  },

  {
    id: 'fv-08',
    topicId: 'free-variables',
    topic: 'ספירת משתנים חופשיים',
    difficulty: 2,
    type: 'numeric-answer',
    question: 'מערכת הומוגנית עם מטריצה 3×6 שכל שלוש שורותיה בלתי-תלויות. כמה משתנים חופשיים?',
    correctAnswer: 3,
    explanation: 'rank = 3 (כל שורות בלתי-תלויות). n = 6. משתנים חופשיים = 6 − 3 = 3.',
    commonMistakeTag: 'נוסחת משתנים חופשיים',
  },

  {
    id: 'fv-09',
    topicId: 'free-variables',
    topic: 'פתרון כללי',
    difficulty: 3,
    type: 'multiple-choice',
    question: 'כתוב פתרון כללי ב-RREF:\n[ 1  -1  0 | 2 ]\n[ 0   0  1 | 3 ]\n(x₂ = t)',
    options: [
      'x = (2+t, t, 3)',
      'x = (2−t, t, 3)',
      'x = (2, t, 3+t)',
      'x = (2+t, t, 3+t)',
    ],
    correctAnswer: 0,
    explanation: 'שורה 1: x₁ − x₂ = 2, x₂ = t → x₁ = 2 + t. שורה 2: x₃ = 3. פתרון: (2+t, t, 3).',
    wrongAnswerFeedback: { 1: 'x₁ − x₂ = 2 → x₁ = 2 + x₂ = 2 + t (פלוס, כי מעביר −x₂ = +t).', 2: 'x₃ אינו תלוי ב-t — הוא ציר עם ערך 3.', 3: 'גם x₃ אינו תלוי ב-t.' },
    commonMistakeTag: 'סימן בביטוי ציר',
  },

  {
    id: 'fv-10',
    topicId: 'free-variables',
    topic: 'מרחב אפסים',
    difficulty: 4,
    type: 'conceptual',
    question: 'מהו הממד של מרחב האפסים (null space) של מטריצה 4×7 עם rank 4?',
    options: ['3', '4', '7', '1'],
    correctAnswer: 0,
    explanation: 'ממד מרחב האפסים (nullity) = n − rank = 7 − 4 = 3. זהו מספר המשתנים החופשיים, שקובעים כמה וקטורי בסיס יש למרחב הפתרונות ההומוגני.',
    wrongAnswerFeedback: { 1: 'rank = 4 הוא ממד טווח (image) — לא של kernel.', 2: 'n = 7 הוא כל המשתנים, לא ממד ה-kernel.', 3: 'nullity = n − rank = 3, לא 1.' },
    commonMistakeTag: 'משפט rank-nullity',
  },
]

// ─── Merge and export ─────────────────────────────────────────────────────────

const questionBank = [...ported, ...newQuestions]
export default questionBank
