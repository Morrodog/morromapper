import Release         from './types/release.ts'
import MapBlob         from './types/map-blob.ts'

/**
 * Represents the minimal information necessary to display the correct mm-blobs of color on the mm-map.
 *
 * `MapSnapshot`s contain the bare minimum information necessary for three functions:
 * 1. To appropriately group cells together for blob borders (such groups are hereafter called "borderblobs").
 * 2. To give all of the cells the correct colors
 * 3. To retrieve further information when the user clicks a cell.
 *
 * GROUPING THE CELLS TOGETHER:
 * The cells are split into borderblobs according to two criteria:
 * 1. Cells of different colors must be in different blobs
 * 2. Groups of cells around which a border should be displayed should be in their own blobs.
 *
 * Groups of cells require borders under these circumstances:
 * 1. Releases get their own blobs.
 * 2. Exterior claims with no interior or quest claims within any of their cells get their own blobs.
 * (Note that `mm-blob`s need not be contiguous.)
 *
 * GIVING ALL OF THE CELLS THE CORRECT COLORS
 * Not all cells are colored individually. This is because the cells are colored by `mm-blob` components,
 * and the cells in borderblobs (as discussed in the previous section) all need to be in the same blobs.
 * The cells are _aren't_ in borderblobs can share a single `mm-blob` with all of the other cells of the same
 * color.
 *
 * These two situations are represented in the type as the `borderBlobs` property for blobs that need borders,
 * and `statusBlobs` for the remaining cells that can all be blobbed by status alone.
 *
 * RETRIEVING FURTHER INFORMATION
 * To retrieve further information for a cell, the user of the `MapSnapshot` needs to know the following:
 * 1. Which claims (if any) contain the cell
 * 2. Which releases (if any) contain the cell
 *
 * To accomplish this, MapSnapshot contains a list of all of the colored cells on the map, and each is given a list of IDs.
 * These are IDs may be of claim documents or release documents.
 */
interface MapSnapshot {
  borderBlobs: MapBlob[];
  statusBlobs: Object;  // Each key is a CellStatus, and each value are all of the non-borderblob cells that share that status.
  cellDocuments: Object;// Each key is a string created by `CellXY.toObjectKey`, and each value is a list of document IDs for retrieval on click.
}
