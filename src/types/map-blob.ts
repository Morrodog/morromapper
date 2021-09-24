import CellStatus from '/src/types/cell-status.ts'
import CellXY     from '/src/types/cell-x-y.ts'

/*
 * Models a blob of same-colored cells for the purpose of MapSnapshot.
 * Note that this is named `MapBlob` instead of `cellBlob` to make it clear that
 * `mm-blob`'s interface should not be changed to take these as props.
 */
interface MapBlob {
  cells: CellXY[]
  cellStatus: CellStatus
}
