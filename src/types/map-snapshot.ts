import BethesdaRelease from './types/bethesda-release.ts'
import Release         from './types/release.ts'

/**
 * Represents the minimal information necessary to display the correct mm-blobs of color on the mm-map.
 *
 * The cells are split into blobs according to two criteria:
 * 1. Cells of different colors must be in different blobs
 * 2. Groups of cells around which a border should be displayed should be in their own blobs.
 *
 * Borders are only shown on release areas (when they're moused over), so all of the `CellStatus`es
 * except for `VANILLA` or `RELEASED` can be represented with one `mm-blob` each (since `mm-blob`s 
 * can display multipolygons, there need not be large contiguous regions sharing a `CellStatus`.)
 *
 * It's also important to note that a given `MapSnapshot` need only contain enough to color the map, and
 * to populate tooltips for each cell. Information necessary to display the next `MapSnapshot` or the previous
 * `MapSnapshot` is not included in the `MapSnapshot` itself.
 *
 * Because populating the tooltips is part of the specification for this interface, we must explain their details here:
 * For `Release`s and `BethesdaRelease`s, the tooltip simply displays the name of the release.
 * For other `CellStatus`es, the tooltip simply displays the number of claims.
 */
interface MapSnapshot {
  bethesdaReleases: BethesdaRelease[]; // Order in the array does not matter.
  releases: Release[]; // Order in the array does not matter.
  inProgress: Object; // Each key is a `CELLSTATUS` string, and each value is `CellXY[]`.
  cellClaims: Object; // Each key is a string created by `CellXY.toObjectKey`, and each value is a list of claim IDs for retrieval on click.
}
