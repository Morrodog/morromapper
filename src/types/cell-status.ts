/**
 * Gives the status of a cell in terms of how completed it is.
 *
 * These statuses are based loosely on Tamriel Rebuilt's claim pipeline available on
 * https://www.tamriel-rebuilt.org/content/pipeline
 *
 * Each status corresponds to a color. Cells of a given status will be rendered in its color.
 * As the status goes up the pipeline from `PLANNING` to `COMPLETED`, it transitions from red to green.
 *
 * Not be confused with `ClaimStatus`.
 */
enum CellStatus {
  /**
   * A `RELEASED` cell has been included in a public release.
   */
  RELEASED = "#0000ff",
  /**
   * A `COMPLETED` cell has a completed exterior, completed interiors, and has been fully NPC'd and quested. 
   * Of note: The word "completed" was chosen instead of "done" because this is not meant to imply that a cell will never be touched again;
   * just that nothing is currently known to block its inclusion in a release.
   */
  COMPLETED = "#00ff00",
  /**
   * A `VANILLA` cell was included in the original release of TESIII, and is therefore out of scope for any province mods.
   */
  VANILLA = "#777777",
  /**
   * A `QUESTS` cell has complete interiors, but is missing some NPCs and/or quests.
   * The processes of "people"ing the cell and of making quests for it have been put into a single step because
   * there are already a few too many colors to be easily distinguishable, and lumping these two together does not 
   * seem like it would cause problems.
   */
  QUESTS = "#ffff00",
  /**
   * An `INTERIORS` cell is missing interiors for its buildings/caves/etc.
   *
   * The color is macaroni.
   */
  INTERIORS = "#fdbb77",
  /**
   * An `EXTERIORS` cell does not have a completed exterior yet.
   *
   * The color is orange
   */
  EXTERIOR = "#ff9933",
  /**
   * An `ASSETS` cell is not ready for exterior work yet because it's waiting on necessary assets.
   *
   * The color is red-orange.
   */
  ASSETS = "#ff5349",
  /**
   * A cell in `PLANNING` is not even ready for asset work to begin.
   */
  PLANNING = "#ff0000",
}

export default CellStatus
