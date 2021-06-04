/**
 * The type of a given claim.
 *
 * Some types block progress through the `ClaimStatus` stages, and others do not. The details of this will be specified on each ClaimType.
 *
 * Strings are used for the enum values for better JSON readability when looking at a `Claim` in a database.
 */
enum ClaimType {
  /**
   * `CONCEPT` claims are not required by any `CellStatus`, but will cause a cell to appear
   * with `PLANNING` `CellStatus` if the cell had no claims before.
   */
  CONCEPT  = "CONCEPT",
  /**
   * `ASSET` claims are not required by any `CellStatus`, but will cause a cell to appear
   * with `PLANNING` `CellStatus` if the cell had no claims before.
   */
  ASSET    = "ASSET"
  /**
   * `EXTERIOR` claims must be completed to pass from the `EXTERIOR` `CellStatus` to the `INTERIOR` `CellStatus`. 
   */
  EXTERIOR = "EXTERIOR",
  /**
   * `INTERIOR` claims must be completed to pass from the `INTERIORS` `CellStatus` to the `QUESTS` `CellStatus`. 
   */
  INTERIOR = "INTERIOR",
  /**
   * `QUEST` claims must be completed to pass from the `QUESTS` `CellStatus` to the `COMPLETED` `CellStatus`. 
   */
  QUEST    = "QUEST",
}
