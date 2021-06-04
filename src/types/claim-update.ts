/**
 * Describes an update to completion status a claim.
 *
 * (Note that this does not include changes in the scope of the claim, as these are
 * treated as discoveries of existing scope as explained in `types/claim-definition.ts`)
 *
 * An ES6 class is used instead of a constructor function so that the MapStateChange interface could be implemented.
 */
class ClaimUpdate implements MapStateChange {
  /**
   * A UUID matching the ID of a claim.
   */
  claimID: string; 
  /**
   * Describes the claim status AFTER the change has been applied.
   */
  newClaimStatus: ClaimStatus;
}

export default ClaimUpdate;
