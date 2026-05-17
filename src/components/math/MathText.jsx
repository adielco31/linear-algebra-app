import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * מציג ביטוי LaTeX inline בעזרת KaTeX.
 *
 * prop:
 *   latex {string} — מחרוזת LaTeX תקינה, ללא $...$ חיצוניים
 *
 * הכלל הקריטי: dir="ltr" על כל פלט — מתמטיקה חייבת להיות LTR
 * גם בתוך עמוד RTL, אחרת סימנים כמו x_1 ו-\frac יוצגו הפוך.
 *
 * שגיאה: אם ה-LaTeX לא תקין — מציג את הטקסט כמו שהוא
 * עם עיצוב שגיאה, ולא קורס.
 *
 * שימוש:
 *   <MathText latex="x_1 + 2x_2 = 5" />
 *   <p>כאשר <MathText latex="\det(A) \neq 0" /> המטריצה הפיכה</p>
 */
export default function MathText({ latex }) {
  if (!latex) return null

  let html
  let error = null

  try {
    html = katex.renderToString(latex, {
      throwOnError: true,
      strict: false,
    })
  } catch (err) {
    error = err.message
    // ניסיון שני עם throwOnError: false — מציג את מה שאפשר
    try {
      html = katex.renderToString(latex, {
        throwOnError: false,
        strict: false,
      })
    } catch {
      html = null
    }
  }

  // פלבק: LaTeX לא תקין ואי אפשר לרנדר בכלל
  if (error && !html) {
    return (
      <span
        dir="ltr"
        className="inline-block font-mono text-xs bg-red-50 text-red-500 border border-red-200 rounded px-1.5 py-0.5"
        title={`LaTeX error: ${error}`}
      >
        {latex}
      </span>
    )
  }

  return (
    <span
      dir="ltr"
      className="inline-block"
      // אזהרה: dangerouslySetInnerHTML בטוח כאן — KaTeX לא מריץ scripts
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
