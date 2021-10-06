import ClaimUpdate from '/src/types/claim-update.ts'
import ClaimType   from '/src/types/claim-type.ts'
import CellXY      from '/src/types/cell-x-y.ts'

/**
 * Represents a claim in Tamriel Rebuilt or Project: Tamriel. 
 *
 * The fields outside of `updates` are considered time-insensitive.
 * They are expected to either:
 * 1. Never change
 * 2. Apply retroactively if changed
 *
 * Note that the creation of `Claim`s applies retroactively.
 * For example, if there were a cell with no claims, it would be blank on the map.
 * If you were to then include it in a claim, say, an exterior claim, on 2021-07-08, then
 * it would appear in the color specified by `CellStatus.EXTERIOR` even if the user moved the
 * timeline slider to 2021-07-07.
 * 
 * A subtle benefit of this is that it minimizes the impression
 * that progress cells are moving "backwards" every time a new claim is added.
 */
interface Claim extends Document {
  type: "CLAIM";
  /**
   * The ID is intended to be a UUID used as a database key.
   *
   * It is used in `MapStateChange`s to reference the claim whose `ClaimState` changed.
   */
  id: string;
  /**
   * This URL is meant to be visited by a user who wants to learn more about a claim.
   *
   * In the case of Tamriel Rebuilt, for example, it would be a link to this claim in their claim tracker.
   */
  url: string;
  /**
   * The type of the claim.
   *
   * Used to determine how the `Claim`'s `updates` should affect the `CellState`s of the `Claim`'s `cells`.
   */
  claimType: ClaimType;
  /**
   * The human-read name of the claim for display purposes.
   */
  name: string;
  /**
   * The cells to which the claim applies.
   */
  cells: CellXY[];
  /**
   * An array of claim updates ordered by date ascending.
   *
   * Note that the `ClaimStatus` of the claim is the `newClaimStatus` of the last member of `updates`.
   */
  updates: ClaimUpdate[];
}

export default Claim
