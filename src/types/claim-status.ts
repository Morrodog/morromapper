/**
 * Describes the current status of a claim.
 *
 * Very loosely based on the stages a claim goes through on Tamriel Rebuilt's claim tracker.
 * For convenience, here they are:
 * - Design
 * - Unclaimed
 * - Claim Pending
 * - In Development
 * - Pending Review
 * - Under Review
 * - Ready to Merge
 * - Merged
 * - Closed
 *
 * Not to be confused with `CellStatus`.
 *
 * Strings are used for the values to make `Claim`
 * documents more readable when shown as plain JSON.
 */
enum ClaimStatus {
  /**
   * Named `DONE` instead of `COMPLETED` to help keep it distinct from `COMPLETED` in `CellStatus`.
   *
   * Corresponds to the "Merged" status on Tamriel Rebuilt's claim tracker.
   */
  DONE = "DONE",
  /**
   * Corresponds to the following statuses on Tamriel Rebuilt's claim tracker:
   * - Claim Pending
   * - In Development
   * - Pending Review
   * - Under Review
   * - Ready to Merge
   *
   * For our purposes, such fine distinctions are not necessary;
   * all the user needs to know is that the claim isn't done, but that it's 
   * being worked on.
   */
  IN_PROGRESS = "IN_PROGRESS",
  /**
   * Corresponds to the "Unclaimed" status in Tamriel Rebuilt's bug tracker.
   */
  NOT_STARTED = "NOT_STARTED",
  /**
   * Corresponds to the "Closed" status in Tamriel Rebuilt's bug tracker.
   */
  CLOSED = "CLOSED"
}

export default ClaimStatus
