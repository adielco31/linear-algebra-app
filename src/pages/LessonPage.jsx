import { useParams, useNavigate } from 'react-router-dom'
import modules from '../data/modules'
import TopBar from '../components/ui/TopBar'
import MathText from '../components/math/MathText'
import MatrixDisplay from '../components/math/MatrixDisplay'

// נוסחאות KaTeX לכל שיעור — יועברו לדאטה כשישתדרג הסכמה
const LESSON_FORMULA = {
  'matrix-intro': String.raw`[A \mid b] = \left(\begin{array}{ccc|c} a_{11} & \cdots & a_{1n} & b_1 \\ \vdots & \ddots & \vdots & \vdots \\ a_{m1} & \cdots & a_{mn} & b_m \end{array}\right)`,
  'row-operations': String.raw`R_i \leftrightarrow R_j \qquad c \cdot R_i\ (c\neq 0) \qquad R_i \leftarrow R_i + c \cdot R_j`,
  'ref-rref': String.raw`\underbrace{\begin{pmatrix} \mathbf{1} & * & * \\ 0 & \mathbf{1} & * \\ 0 & 0 & \mathbf{1} \end{pmatrix}}_{\text{REF}} \xrightarrow{\text{continue}} \underbrace{\begin{pmatrix} \mathbf{1} & 0 & 0 \\ 0 & \mathbf{1} & 0 \\ 0 & 0 & \mathbf{1} \end{pmatrix}}_{\text{RREF}}`,
  'solutions-count': String.raw`\text{rank}(A) < \text{rank}([A|b]) \Rightarrow \emptyset \qquad \text{rank}(A)=n \Rightarrow \{x_0\} \qquad \text{rank}(A)<n \Rightarrow \infty`,
  'free-variables': String.raw`\mathbf{x} = \mathbf{x}_p + t_1\mathbf{v}_1 + t_2\mathbf{v}_2 + \cdots + t_k\mathbf{v}_k, \quad t_i \in \mathbb{R}`,
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  let lesson = null
  let moduleId = 'row-reduction'
  for (const mod of modules) {
    const found = mod.lessons.find(l => l.id === lessonId)
    if (found) {
      lesson = found
      moduleId = mod.id
      break
    }
  }

  if (!lesson) return <NotFound />

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar title={lesson.title} variant="close" to={`/module/${moduleId}`} />

      <main className="flex-1 px-4 py-5 space-y-4 pb-28">

        {/* 1 · כותרת + הסבר קצר */}
        <ShortExplanationSection lesson={lesson} />

        {/* 2 · תכל׳ס, מה זה אומר? */}
        <IntuitionSection content={lesson.realLifeIntuition} />

        {/* 3 · ההגדרה המתמטית */}
        <FormalSection
          content={lesson.formalExplanation}
          formula={LESSON_FORMULA[lessonId]}
        />

        {/* 4 · סרטון */}
        <VideoSection title={lesson.videoPlaceholderTitle} videoUrl={lesson.videoUrl} />

        {/* 5 · דוגמה פתורה */}
        <SolvedExampleSection example={lesson.solvedExample} />

      </main>

      {/* 6 · כפתור תרגול */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-4-safe">
        <button
          onClick={() => navigate(`/practice/${lessonId}`)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl py-3.5 text-base transition-colors"
        >
          התחל תרגול
        </button>
      </div>
    </div>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function SectionLabel({ children, color = 'text-gray-400' }) {
  return (
    <p className={`text-xs font-semibold mb-2 ${color}`}>
      {children}
    </p>
  )
}

function ShortExplanationSection({ lesson }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h1 className="text-xl font-bold text-gray-900 leading-snug">{lesson.title}</h1>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{lesson.shortExplanation}</p>
    </div>
  )
}

function IntuitionSection({ content }) {
  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
      <SectionLabel color="text-amber-600">תכל׳ס, מה זה אומר?</SectionLabel>
      <div className="flex gap-3">
        <span className="shrink-0 mt-0.5" aria-hidden>
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.6-1.4 4.9-3.5 6.2-.5.3-.5.6-.5.8v.5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-.5c0-.2 0-.5-.5-.8A7 7 0 015 9a7 7 0 017-7z" />
          </svg>
        </span>
        <p className="text-sm text-gray-800 leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

function FormalSection({ content, formula }) {
  return (
    <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5 space-y-4">
      <SectionLabel color="text-indigo-600">ההגדרה המתמטית</SectionLabel>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>

      {formula && (
        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-5 overflow-x-auto flex justify-center">
          {/* MathText תמיד LTR — חובה בעמוד RTL */}
          <MathText latex={formula} />
        </div>
      )}
    </div>
  )
}

// Parses a video URL into a normalised embed object.
// Returns null when the URL is empty or unrecognised.
function parseVideoUrl(url) {
  if (!url) return null

  // YouTube: watch?v=ID or youtu.be/ID
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (yt) return {
    type: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`,
  }

  // Vimeo: vimeo.com/ID
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return {
    type: 'vimeo',
    embedUrl: `https://player.vimeo.com/video/${vm[1]}?color=2563eb&title=0&byline=0`,
  }

  // Direct file (mp4, webm, mov)
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return {
    type: 'direct',
    embedUrl: url,
  }

  return null
}

function VideoSection({ title, videoUrl }) {
  const parsed = parseVideoUrl(videoUrl)

  if (!parsed) return <VideoPlaceholder title={title} />

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {parsed.type === 'direct' ? (
        <video
          src={parsed.embedUrl}
          controls
          playsInline
          className="w-full aspect-video"
        />
      ) : (
        <div className="relative w-full aspect-video">
          <iframe
            src={parsed.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      )}
      <div className="px-4 py-3 bg-gray-800">
        <p className="text-white text-sm font-medium leading-snug">{title}</p>
      </div>
    </div>
  )
}

function VideoPlaceholder({ title }) {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white translate-x-0.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        <div>
          <p className="text-white font-semibold text-base leading-snug">{title}</p>
          <p className="text-gray-400 text-xs mt-1">הסרטון יהיה זמין בקרוב</p>
        </div>

        <button
          disabled
          className="bg-white/10 text-gray-300 text-xs font-medium px-5 py-2 rounded-full cursor-not-allowed"
        >
          בקרוב
        </button>
      </div>

      <div className="bg-gray-800 px-4 py-3 flex items-center gap-3">
        <span className="text-gray-500 text-xs">0:00</span>
        <div className="flex-1 h-1 bg-gray-700 rounded-full" />
        <span className="text-gray-500 text-xs">—:——</span>
      </div>
    </div>
  )
}

function SolvedExampleSection({ example }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header + problem */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-5 pt-5 pb-4">
        <SectionLabel color="text-emerald-600">דוגמה פתורה</SectionLabel>
        <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-line">
          {example.problem}
        </p>
        {example.problemMatrix && (
          <MatrixDisplay
            rows={example.problemMatrix.rows}
            augmented={example.problemMatrix.augmented}
            block
            className="mt-3 text-gray-800"
          />
        )}
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-100">
        {example.steps.map((step, i) => (
          <Step key={i} index={i + 1} action={step.action} result={step.result} resultMatrix={step.resultMatrix} />
        ))}
      </div>

      {/* Conclusion */}
      <div className="bg-emerald-50 border-t border-emerald-100 px-5 py-4">
        <p className="text-sm leading-relaxed text-gray-800">
          <span className="font-bold text-emerald-700">מסקנה: </span>
          {example.conclusion}
        </p>
      </div>

    </div>
  )
}

function Step({ index, action, result, resultMatrix }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="text-xs font-semibold text-gray-500">{action}</p>
      </div>
      {resultMatrix ? (
        <div className="bg-gray-50 rounded-xl px-4 py-3 overflow-x-auto">
          <MatrixDisplay
            rows={resultMatrix.rows}
            augmented={resultMatrix.augmented}
            block
            className="text-gray-800"
          />
        </div>
      ) : (
        <pre
          dir="ltr"
          className="text-sm font-mono bg-gray-50 text-gray-800 rounded-xl px-4 py-3 overflow-x-auto leading-relaxed"
        >
          {result}
        </pre>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3 text-center px-6">
      <p className="text-lg font-semibold text-gray-900">השיעור לא נמצא</p>
      <p className="text-sm text-gray-400">ייתכן שהקישור שגוי</p>
    </div>
  )
}
