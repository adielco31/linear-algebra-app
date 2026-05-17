import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * מרנדר ביטוי LaTeX בעזרת KaTeX.
 * תמיד מוגדר כ-LTR כדי שמתמטיקה תוצג נכון בתוך עמוד RTL.
 *
 * שימוש:
 *   <MathDisplay>{String.raw`x^2 + y^2 = r^2`}</MathDisplay>
 *   <MathDisplay block>{String.raw`\frac{a}{b}`}</MathDisplay>
 */
export default function MathDisplay({ children, block = false, className = '' }) {
  let html
  try {
    html = katex.renderToString(children, {
      throwOnError: false,
      displayMode: block,
      strict: false,
    })
  } catch {
    // fallback: plain text if KaTeX fails
    html = `<span class="font-mono text-sm">${children}</span>`
  }

  return (
    <span
      dir="ltr"
      className={`inline-block ${block ? 'w-full overflow-x-auto text-center py-1' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
