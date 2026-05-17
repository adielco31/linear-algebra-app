import TopBar from '../components/ui/TopBar'
import RowReductionEditor from '../components/exercise/RowReductionEditor'

// Classic 3×4 augmented matrix — Gaussian elimination example
// Solution: x=2, y=3, z=-1
const DEMO_MATRIX = [
  [ '2',  '1', '-1',  '8'],
  ['-3', '-1',  '2', '-11'],
  ['-2',  '1',  '2', '-3'],
]

export default function RowEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="תרגול דירוג שורות" variant="back" />

      <main className="px-4 pt-5 pb-12 max-w-lg mx-auto">
        <p className="text-sm text-gray-500 text-center mb-5">
          בחר פעולת שורה, הגדר פרמטרים, ולחץ "החל פעולה"
        </p>
        <RowReductionEditor initialMatrix={DEMO_MATRIX} augmented={3} />
      </main>
    </div>
  )
}
