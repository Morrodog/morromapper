/**
 * Describes an update to completion status a claim.
 *
 * (Note that this does not include changes in the scope of the claim, as these are
 * treated as discoveries of existing scope as explained in `types/claim.ts`)
 *
 * Used principally inside of `types/claim.ts`.
 */
interface ClaimUpdate {
  /**
   * Describes the claim status AFTER the change has been applied.
   */
  newClaimStatus: ClaimStatus;
  /**
   * The date of the change.
   *
   * Used to determine the order of changes, and to determine which changes have happened at a given point in time.
   */
  changeDate: string;
}

export default ClaimUpdate;
