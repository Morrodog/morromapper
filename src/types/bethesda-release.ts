import Document from '/src/types/document.ts'
import CellXY   from '/src/types/cell-x-y.ts'

/**
 * A `BethesdaRelease` represents an official release by Bethesda
 *
 * Its effect is to force a given set of cells to the `VANILLA` cell status from whatever status they had before.
 */
interface BethesdaRelease extends Document {
  releasedCells: CellXY[];
}
