import ClaimDefinition from '/src/types/claim-definition.ts'
import MapStateChange  from '/src/types/release.ts'
import ClaimUpdate     from '/src/types/claim-update.ts'
import ClaimStatus     from '/src/types/claim-status.ts'
import CellStatus      from '/src/types/cell-status.ts'
import Unrelease       from '/src/types/unrelease.ts'
import Release         from '/src/types/release.ts'
import CellXY          from '/src/types/cell-x-y.ts'

/**
 * Describes the state of the current map as a table using cells as keys and associated `CellState`s as values.
 *
 * Cells are used as keys by using `CellXY.toObjectKey`, and using the resulting strings as keys.
 *
 * TODO: Find a cleaner way of providing the claimDefinitions to the MapState, as the claim definitions are meant to be applicable to ALL MapStates.
 */
function MapState(changes: MapStateChange[], date: string, claimDefinitions: Map<string, ClaimDefinition) {
  this.date = date; // TODO: Should maybe be made private?
  this.cells = Map<string, CellInfo>(); 

  this.applyChange = function applyChange(change: MapStateChange) {
    var changedCells: CellXY[] = ((): CellXY[] => {
      switch(change.constructor) {
          case Release:
          return change.releasedCells;

          case Unrelease: 
          return change.unreleasedCells;

          case ClaimUpdate: 
          return claimDefinitions.get(change.claimId).cells;

          default:
          throw new Error("Invalid MapStateChange given to applyChange method of MapState class.");
      }
    })();
    //TODO: CONTINUE FROM HERE!
    //TODO: ACCOUNT FOR DATES! (though probably not here. Maybe a setDate function? )
    //TODO: How would I remove changes without reconstructing the whole MapState from the beginning? There isn't enough information in a MapStateChange to do it without something else. (For example, a claim update to `DONE` could be from `IN_PROGRESS` or `NOT_STARTED`)
    //TODO: Vuex is actually kind of tempting for its time-machine abilities (in which scenario, I'd keep a single MapState in the Vuex store). I'd prefer something a bit leaner, though.
  }
}

interface CellInfo {
  /**
   * Named in order to avoid the `status` reserved word, and to be distinct from `claimStatus` in ClaimSnapshot.
   */
  cellStatus: CellStatus;
  claims: ClaimSnapshot[];
}

/**
 * Represents a claim (both its definition and status) at a given point in time.
 */
interface ClaimSnapshot {
  /**
   * Like `cellStatus` in `CellInfo`, this is named to avoid the `status` keyword.
   */
  claimStatus: ClaimStatus;
  /**
   * To remain consistent with `claimStatus`, this has been named
   * `claimDefinition` instead of the more concise `definition`.
   */
  claimDefinition: ClaimDefinition
}
