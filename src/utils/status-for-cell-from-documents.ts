/*
 * Convenience wrapper around `statusForCell`.
 */

import statusForClaim from '/src/utils/status-for-claim.ts'
import statusForCell  from '/src/utils/status-for-cell.ts'

import ClaimStatus from '/src/types/claim-status.ts'
import ClaimType   from '/src/types/claim-type.ts'
import Document    from '/src/types/document.ts'

// Returns true when given 0 claims.
const noUnfinishedClaimStatuses = (claimStatuses, snapshotTime) => {
  return claimStatuses.every((claimStatus) => {
    return claimStatus === ClaimStatus.DONE;
  });
}

export default function statusForCellFromDocuments(cellDocuments, snapshotTime) {
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
  var inFinishedReleases = finishedReleases.length > 0;
  var inOngoingReleases = ongoingReleases.length > 0;
  var hasClaims = Object.values(claimStatuses).reduce((claimTypes, claimType) => {
    return claimTypes.concat(claimType);
  }).length > 0;
  var hasCompletedQuests = claimStatuses[ClaimType.QUEST].filter((questStatus) => {
    return questStatus === ClaimStatus.DONE;
  }).length > 0;
  return statusForCell(hasExteriors, hasInteriors, noUnfinishedInteriors, noUnfinishedExteriors, hasCompletedQuests, inFinishedReleases, inOngoingReleases, hasClaims);
}
