import Document from '/src/types/document.ts'
import CellXY   from '/src/types/cell-x-y.ts'

/**
 * A `Redo` represents a decision by Tamriel Rebuilt to redo a previously released area.
 *
 * Its effect is to force a given set of cells to the `BLANK` cell status from whatever status they had before.
 */
interface Redo extends Document {
  redoneCells: CellXY[];
}

export default Redo;
