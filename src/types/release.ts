import Document from '/src/types/document.ts'
import CellXY   from '/src/types/cell-x-y.ts'

/**
 * A `Release` represents a public release of Tamriel Rebuilt.
 *
 * Its effect is to force a given set of cells to the `RELEASED` cell status from whatever status they had before.
 * Although the status of every cell immediately before release would ideally be `COMPLETED`, if this is not the
 * case, then this will be represented accurately.
 */
interface Release extends Document {
  releasedCells: CellXY[];
}

export default Release;
