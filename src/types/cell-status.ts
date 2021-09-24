/**
 * Gives the status of a cell in terms of how completed it is.
 *
 * These statuses are based loosely on Tamriel Rebuilt's claim pipeline available on
 * https://www.tamriel-rebuilt.org/content/pipeline
 *
 * Each status corresponds to a color defined in `'/src/constants/cell-status-colors.ts'`.
 * Cells of a given status will be rendered in the color of that status.
 * As the status goes up the pipeline from `PLANNING` to `COMPLETED`, it transitions from red to green.
 *
 * Not be confused with `ClaimStatus`.
 *
 * Of note is that the situation of a cell being blocked by unfinished assets
 * is NOT captured here. This is because an asset can block a claim (and thus, 
 * the claim's cells) at any stage of development. 
 * The intention is that a missing asset will cause another claim to remain in
 * `ClaimStatus.IN_PROGRESS` or `ClaimStatus.NOT_STARTED`.
 */
enum CellStatus {
  /**
   * A `RELEASED` cell has been included in a public release.
   */
  RELEASED = "RELEASED",
  /**
   * A `COMPLETED` cell has a completed exterior, completed interiors, and has been fully NPC'd and quested. 
   * Of note: The word "completed" was chosen instead of "done" because this is not meant to imply that a cell will never be touched again;
   * just that nothing is currently known to block its inclusion in a release.
   */
  COMPLETED = "COMPLETED",
  /**
   * A `BLANK` cell has been explicitly marked blank, and will look the same as a cell that does not exist.
   * 
   * This primarily exists to cleanly enable `Redo`s.
   */
  BLANK = "BLANK",
  /**
   * A `VANILLA` cell was included in the original release of TESIII, and is therefore out of scope for any province mods.
   */
  VANILLA = "VANILLA",
  /**
   * A `QUESTS` cell has complete interiors, but is missing some NPCs and/or quests.
   *
   * The processes of "people"ing the cell and of making quests for it have been put into a single step because
   * having fewer colors would make them more distinguishable, and because lumping these two together does not 
   * seem like it would cause problems.
   */
  QUESTS = "QUESTS",
  /**
   * An `INTERIORS` cell is missing interiors for its buildings/caves/etc.
   */
  INTERIORS = "INTERIORS",
  /**
   * An `EXTERIORS` cell does not have a completed exterior yet.
   */
  EXTERIOR = "EXTERIOR",
  /**
   * A cell in `PLANNING` is not yet ready for exterior work to begin.
   */
  PLANNING = "PLANNING",
  /**
   * A cell that is `UNDER_REVISION` was in a previous finished release, and is currently in a more recent unfinished release.
   */
  UNDER_REVISION = "UNDER_REVISION",
  /**
   * A cell that is `TENTATIVELY_COMPLETE` has all of its exterior and/or interior claims finished, but the remaining claim categories
   * have no claims, so it's unclear whether the claims haven't been made yet, or whether there are no claims to make beyond those that
   * are already complete.
   *
   * If all of the claims that went into a release are complete, then even if there are no quests and/or interiors, the
   * cell should be marked `COMPLETE` instead when time traveling back to the time before the release was finished.
   */
  TENTATIVELY_COMPLETE = "TENTATIVELY_COMPLETE"
}

export default CellStatus
