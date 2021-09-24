import ClaimStatus   from '/src/types/claim-status.ts'
import ClaimType     from '/src/types/claim-type.ts'
import CellStatus    from '/src/types/cell-status.ts'
import Document      from '/src/types/document.ts'

import { statusForClaim } from '/src/utils/status-for-claim.ts'

// Contains the fundamental logic for deciding what color a cell should be.
// Separate from statusForCellFromDocuments because this is used in `generateMapSnapshot` in a context where
// it would be redundant for the statusForCell function to iterate over a cell's documents.
export function statusForCell(hasExteriors, hasInteriors, noUnfinishedInteriors, noUnfinishedExteriors, hasCompletedQuests) {
  if(!hasExteriors) return CellStatus.HAS_NO_EXTERIOR;
  if(!noUnfinishedExteriors) return CellStatus.HAS_NO_EXTERIOR;
  // From this point forward, it can be assumed that the exterior is finished.
  if(hasInteriors) {
    if(hasCompletedQuests) {
      if(noUnfinishedInteriors) {
        // Has finished interiors and quests
        return CellStatus.HAS_QUESTS;
      } else {
        // Has unfinished interiors; quests are ignored.
        return CellStatus.EXTERIOR_FINISHED;
      }
    } else {
      if(noUnfinishedInteriors) {
        // Has finished interiors and no quests
        return CellStatus.INTERIORS_FINISHED;
      } else {
        // Has unfinished interiors and no quests
        return CellStatus.EXTERIOR_FINISHED;
      }
    }
  } else {
    if(hasCompletedQuests) {
      // Has no interiors, and has quests
      return CellStatus.HAS_QUESTS;
    } else {
      // Has no interiors or quests
      return CellStatus.EXTERIOR_FINISHED;
    }
  }
}

// Returns true when given 0 claims.
export function noUnfinishedClaimStatuses(claimStatuses, snapshotTime) {
  return claimStatuses.every((claimStatus) => {
    return claimStatus === ClaimStatus.DONE;
  });
}

// To be used primarily by the frontend. For when you don't have any other need to iterate
// over the cell's documents.
export function statusForCellFromDocuments(cellDocuments, snapshotTime) {
  var claimStatuses = {
    [ClaimType.EXTERIOR]: [],
    [ClaimType.INTERIOR]: [],
    [ClaimType.CONCEPT]:  [],
    [ClaimType.QUEST]:    [],
    [ClaimType.ASSET]:    [],
  };
  var finishedReleases = [];
  var ongoingReleases = [];
  cellDocuments.forEach((doc) => {
    switch(doc.type) {
        case "RELEASE":
        // Ignore releases that haven't started work at the time of the snapshot.
        if(snapshotTime >= doc.startDate) {
          if(doc.releaseDate <= snapshotTime) {
            finishedReleases.push(doc);
          } else {
            ongoingReleases.push(doc);
          }
        }
        break;
        case "CLAIM":
        claimStatuses[doc.claimType].push(statusForClaim(doc, snapshotTime));
        break;
        default:
        throw new Error(`\`Document\` of unexpected type \`${doc.type}\` found in cellDocuments argument of \`statusForCell\`.`);
    }
  });

  var hasExteriors = claimStatuses[ClaimType.EXTERIOR].length > 0;
  var hasInteriors = claimStatuses[ClaimType.INTERIOR].length > 0;
  var noUnfinishedInteriors = noUnfinishedClaimStatuses(claimStatuses[ClaimType.INTERIOR]);
  var noUnfinishedExteriors = noUnfinishedClaimStatuses(claimStatuses[ClaimType.EXTERIOR]);
  var hasCompletedQuests = claimStatuses[ClaimType.QUEST].filter((questStatus) => {
    return questStatus === ClaimStatus.DONE;
  }).length > 0;
  return statusForCell(hasExteriors, hasInteriors, noUnfinishedInteriors, noUnfinishedExteriors, hasCompletedQuests);
}
