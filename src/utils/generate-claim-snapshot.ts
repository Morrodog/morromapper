import MapChangeType from '/src/types/map-change-type.ts'
import MapSnapshot   from '/src/types/map-snapshot.ts'
import ClaimStatus   from '/src/types/claim-status.ts'
import CellXY        from '/src/types/claim-x-y.ts'
import CellStatus    from '/src/types/cell-status.ts'
import Document      from '/src/types/document.ts'

/**
 * Given an ISO8601 string, and all of the necessary documents, produces a 
 * MapSnapshot for the given datetime.
 *
 *  `documents` should only include documents such that `date` is less than or equal to `snapshotTime`,
 *  and should only include documents of these three types:
 *  1. MapChangeType.RELEASE
 *  2. MapChangeType.BETHESDA_RELEASE
 *  3. MapChangeType.CLAIM
 */
export default function generateMapSnapshot(documents: Document[], snapshotTime: string): MapSnapshot {
  /* We must make three "pass"es over the data. The reason we can't do this in one pass is that computing
   * the `CellStatus` of a given cell cannot be done one claim at a time, so we need to collect all of the claim objects for each cell.
   * 
   * For example, for a cell to transition from `INTERIORS` to `QUESTS`, ALL of the claims of type `ClaimType.INTERIOR` must have
   * status `ClaimStatus.DONE`. With only one claim at a time, it's impossible to know whether all of the other interior claims
   * for that cell are also finished. And until all of the `documents` have been iterated over, there's no way to know that
   * any of the claims are the last claim to be discovered on a given cell, so anything to be done with the claims must be done after
   * this first pass has discovered all of the claims for each cell.
   *
   * The reason that we make a third pass is that the claim objects used to compute the `CellStatus`es need to be turned into `ID`s.
   */
  // "First pass"
  var mapSnapshot = documents.reduce((snapshot, doc) => { // "document" is a global variable, so we shorten to "doc" here.
    switch(doc.type) {
        case MapChangeType.RELEASE:
        snapshot.releases.push(doc);
        break;
        case MapChangeType.BETHESDA_RELEASE:
        snapshot.bethesdaReleases.push(doc);
        break;
        case MapChangeType.CLAIM:
        snapshot.cells.forEach((cell) => {
          var cellKey = CellXY.toObjectKey(new CellXY(cell));
          if(!snapshot.cellClaims[cellKey]) {
            snapshot.cellClaims[cellKey] = [];
          }
          snapshot.cellClaims[cellKey].push(doc.id);
        });
        break;
        default:
        /* The caller of this function is expected to filter out map snapshots.
         * This responsibility is given to the caller so that map snapshots can be filtered
         * out at the database level instead of doing so here in JS.
         */
        throw new Error(`generateClaimSnapshot invalidly given document of type \`${doc.type}\``);
    }
  }, {
    // See `MapSnapshot` for details on these fields.
    bethesdaReleases: [],
    releases [],
    inProgress: {},
    cellClaims: {}
  });
  // "Second pass"
  claimSnapshot.inProgress = Object.entries(Object.entries(firstPass.cellClaims).reduce((cellToStatus, [cellKey, claims]) => {
    cellToStatus[cellKey] = (() => {
      // If a cell's exterior work has been started, then it progresses to `EXTERIOR` from `PLANNING`.
      var exteriorClaimStatus = claimStatusFromClaims(claims, ClaimType.EXTERIOR, snapshotTime);
      if(exteriorClaimStatus === ClaimStatus.NOT_STARTED) return CellStatus.PLANNING;
      if(exteriorClaimStatus === ClaimStatus.IN_PROGRESS) return CellStatus.EXTERIOR;
      // If a cell's interior work has been started, then it progresses to `INTERIORS`.
      var interiorClaimStatus = claimStatusFromClaims(claims, ClaimType.INTERIOR, snapshotTime);
      if(interiorClaimStatus === ClaimStatus.NOT_STARTED) return CellStatus.EXTERIOR;
      if(interiorClaimStatus === ClaimStatus.IN_PROGRESS) return CellStatus.INTERIORS;
      // If a cell's interior work is complete, or if its quest work has started, then it progresses to `QUESTS`.
      // If the quest claims are all finished, then it jumps to `COMPLETED`.
      var questsClaimStatus = claimStatusFromClaims(claims, ClaimType.QUEST, snapshotTime);
      if(questsClaimStatus === ClaimStatus.NOT_STARTED) return CellStatus.QUESTS;
      if(questsClaimStatus === ClaimStatus.IN_PROGRESS) return CellStatus.QUESTS;
      if(questsClaimStatus === ClaimStatus.DONE) return  CellStatus.COMPLETED;
    })();
    return cellToStatus;
  }, {})).reduce((inProgress, [cellKey, cellStatus]) => {
    inProgress[cellStatus].push(CellXY.fromObjectKey(cellKey));
    return inProgress;
  }, {
    [CellStatus.PLANNING]:  [],
    [CellStatus.EXTERIOR]:  [],
    [CellStatus.INTERIORS]: [],
    [CellStatus.QUESTS]:    [],
    [CellStatus.COMPLETED]: []
  });
  // "Third pass"
  firstPass.cellClaims = Object.entries(firstPass.cellClaims).reduce((cellClaims, [cellKey, claimDocs]) => {
    cellClaims[cellKey] = claimDocs.map((claimDoc) => {
      return claimDoc.id;
    });
    return cellClaims;
  }, {});
  return firstPass;
}

/**
 * Determines the status of a particular phase of development of a cell. This is represented with a `ClaimStatus`.
 *
 * (The "phases" of development are represented by the `ClaimType` values.)
 *
 * The status of the given phase of development is decided by the following rules:
 * 1. If all of the claims are `CLOSED`, or if there are no claims, then development is `NOT_STARTED`.
 * 2. If all claims are `DONE`, then this phase of cell development is `DONE`.
 * 3. Otherwise, any claims are either `IN_PROGRESS` or `DONE`, then the cell is `IN_PROGRESS`
 * 4. Finally, if all claims are `NOT_STARTED`, then this phase of cell development is `NOT_STARTED`.
 */
const claimStatusFromClaims = function claimStatusFromClaims (claims, claimType, snapshotTime) {
  var claimStatuses =  claims.filter((claim) => { // First, we isolate the claims of the relevant type.
    return claim.type === claimType;
  }).map((exteriorClaim) => { // Next, we get the status of each claim at the given `snapshotTime`
    var relevantUpdates = exteriorClaim.claimUpdates.filter((update) => {
      return update.changeDate <=  snapshotTime;
    });
    if(relevantUpdates.length === 0) {
      return ClaimStatus.NOT_STARTED;
    } else {
      return relevantUpdates.slice(-1)[0];
    }
  }).filter((claimStatus) => { // Next, we filter out any `CLOSED` claims.
    return claimStatus !== ClaimStatus.CLOSED;
  });
  var allDone = claimStatuses.every((claimStatus) => {
    return claimStatus === ClaimStatus.DONE;
  });
  var someStarted = claimStatuses.some((claimStatus) => {
    return [ClaimStatus.DONE, ClaimStatus.IN_PROGRESS].includes(claimStatus);
  });
  /* Rule 1 */if(claimStatuses.length === 0) return ClaimStatus.NOT_STARTED;
  /* Rule 2 */if(allDone) return ClaimStatus.DONE;
  /* Rule 3 */if(someStarted) return ClaimStatus.IN_PROGRESS;
  /* Rule 4 */return ClaimStatus.NOT_STARTED;
};
