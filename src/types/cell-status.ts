/**
 * Represents the status of a cell based on how it should be colored on the map.
 * The coloration on the map is based on how much has been done in the cell, _not_ how close it is to completion.
 * This is slightly counterintuitive, given that this is a progress map, but consider the following scenario:
 *
 * Given two cells:
 * 1. A cell with a complete exterior claim and some (but not all) interior claims complete.
 * 2. A cell with a complete exterior claim and no interior claims.
 *
 * Cell 2 is more complete, but cell 1 contains more work, so we consider cell 1 "further along".
 * This has at least these desirable effects:
 * 1. Cells in the same completed exterior will not be put behind other cells in the same
 *    exterior because they have interiors and the other cells don't.
 * 2. Adding new claims to a cell will cause it to "lose progress" on the map less often.
 *    (Adding a new interior claim after quests have been finished will still move the status backward.)
 * 3. When a release finishes, and you're looking at the released cells at a snapshot before
 *    the `releaseDate`, the colors of the cells will be the same as they were before the release happened.
 *    
 *    The reason they would change under a completeness paradigm is that the map would have a comprehensive list of
 *    exactly which claims "belonged" to the release only once the release was finished, since somebody can make a new 
 *    claim for an unfinished release at any time. So you have new information about the completeness of cells at
 *    those older points in time once the release has happened, so they must change.
 *
 * Each status corresponds to a color defined in `'/src/constants/cell-status-colors.ts'`.
 * Cells of a given status will be rendered in the color of that status.
 * As the status goes up the pipeline from `HAS_NO_EXTERIOR` to `HAS_QUESTS`, it transitions from red to green.
 *
 * Not be confused with `ClaimStatus`.
 */
enum CellStatus {
  /**
   * A `BLANK` cell has been explicitly marked blank, and will look the same as a cell that is not 
   * in any releases or claims.
   * 
   * This primarily exists as a utility status, rather than an intended status for a given cell.
   */
  BLANK = "BLANK",
  /**
   * A `RELEASED` cell has been included in releases, and the most recent release in which it is included is finished.
   */
  RELEASED = "RELEASED",
  /**
   * `VANILLA` is a special color to represent the cells released by Bethesda.
   *
   * Note that Bethesda releases are stored as `release` documents just like other releases.
   */
  VANILLA = "VANILLA",
  /**
   * A cell that is `UNDER_REVISION` is in a finished release and also in a more recent unfinished release.
   *
   * In the future, this may change to be cells that are in a finished release and have
   * more recent IN_PROGRESS claims.
   */
  UNDER_REVISION = "UNDER_REVISION",
  /**
   * An `EXTERIOR_NOT_FINISHED` cell either has no exterior claims, or not all of its exterior claims are `ClaimStatus.DONE`.
   *
   * These cells may contain any quantity of completed claims of any other types, but their status (and color)
   * does not progress until the cell has a finished exterior.
   */
  HAS_NO_EXTERIOR = "HAS_NO_EXTERIOR",
  /**
   * An `EXTERIOR_FINISHED` cell must have its exterior finished.
   *
   * Whether the cell has interior or quest claims is ignored; it will stay at this status until
   * all of its interiors (or quests) are finished (provided that there are more than 0 interiors or quests to finish).
   */
  EXTERIOR_FINISHED = "EXTERIOR_FINISHED",
  /**
   * An `INTERIORS_FINISHED` cell satisfies two criteria:
   * 1. The cell has more than 0 interior claims
   * 2. All of the cell's interior claims are finished.
   */
  INTERIORS_FINISHED = "INTERIORS_FINISHED",
  /**
   * A `HAS_QUESTS` cell:
   * 1. Has more than 0 exterior claims, all of which are complete.
   * 2. Has 0 incomplete non-`ClaimStatus.CLOSED` interior claims (may have 0 interior claims)
   * 3. Has more than 0 `ClaimStatus.Done` quest claims
   *
   * Note that incomplete quests do not prevent the cell from getting this status.
   * This is so that cells do not "go backwards" when new quest claims are added.
   *
   * In the future, this status may be split into two statuses
   * based on which cells have more than 0 interior claims.
   */
  HAS_QUESTS = "HAS_QUESTS"
}

export default CellStatus
