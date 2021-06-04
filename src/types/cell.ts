import CellStatus from '/src/types/cell-status.ts'
import CellXY     from '/src/types/cell-x-y.ts'

/**
 * Captures the minimum information necessary to display a cell.
 *
 * Of note is that this is a "second class" type:
 * 1. Its primary use is to facilitate the caching of data from `Claims` such that
 *    the browser does not need to fetch every single claim to check for
 *    the membership of a given cell in its `cells`.
 * 2. Where `claimIds` contradicts something in a `Claim`, `Release`, or `Unrelease`,
 *    `claimIds` is considered the less authoritative source.
 * 3. `Cell`s are never directly manipulated in the API
 */
interface Cell {
  /**
   * Locates and identifies the `Cell`
   *
   * When constructing a `Cell`, this is used as an identifier
   * referenced by the `cells` field in `Claim`s.
   */
  cellXY: CellXY;
  /**
   * An record of every time the cell's CellStatus has changed.
   *
   * Code elsewhere expects these changes to be ordered by date ascending.
   *
   * This is used to determine the current state of a given cell at a given time.
   * To determine the state of a cell at a given time, all that is necessary is to find the
   * `CellStatusChange` immediately before the currently displayed date/time.
   *
   * This approach has the following benefits:
   * 1. The `statusChanges` can be precomputed on the server side, which
   *    saves the browser a lot of work when there are many cells.
   * 2. Doing it this way makes it possible to retrieve claim information lazily, 
   *    which saves the client from storing potentially tens of thousands of claims.
   * 3. Because of (2), this makes it more practical to put the `Cell` for every
   *    rendered cell into `window.localStorage`.
   *
   * Note that, for dates before the first `CellStatusChange`, the cell should not be rendered at all.
   */
  statusChanges: CellStatusChange[]
  claimIds: string[]
}

interface CellStatusChange {
  changeTime: string;
  cellStatus: CellStatus;
}

export default Cell
