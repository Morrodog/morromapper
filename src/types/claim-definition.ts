import CellXY from '/src/types/cell-x-y.ts'

/**
 * Represents a claim in Tamriel Rebuilt or Project: Tamriel. 
 *
 * The fields of this type include only the TIME-INSENSITIVE fields describing the claim. 
 * More specifically, if a field in a claim either:
 * 1. Never changes
 * 2. Applies retroactively if changed
 * then the field qualifies as "TIME-INSENSITIVE".
 *
 * Note that the existence of any `ClaimDefinition` is itself treated as time-insensitive.
 * This means that if you were to, say, add a new quest claim to a cell that had a claim status of `COMPLETED`,
 * then the map will treat the cell as though it had never been completed.
 * In essence, new claims are treated as discoveries about the scope of work for a given cell
 * instead of expansions of that scope.
 * This is a somewhat arbitrary design decision, but this is done for two reasons:
 * 1. It's slightly simpler to implement.
 * 2. This minimizes the impression that progress moves "backwards" every time a new claim is added.
 */
interface ClaimDefinition {
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
   * The human-read name of the claim for display purposes.
   */
  name: string;
  /**
   * The cells to which the claim applies.
   */
  cells: CellXY[];
}

export default ClaimDefinition
