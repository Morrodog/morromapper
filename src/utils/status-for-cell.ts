import ClaimStatus   from '/src/types/claim-status.ts'
import CellStatus    from '/src/types/cell-status.ts'

import statusForClaim from '/src/utils/status-for-claim.ts'

// Determines which `CellStatus` is appropriate for a cell.
export default function statusForCell(hasExteriors, hasInteriors, noUnfinishedInteriors, noUnfinishedExteriors, hasCompletedQuests, inFinishedRelease, inOngoingRelease, hasClaims) {
  // Release logic takes priority
  if(inFinishedRelease) {
    if(inOngoingRelease) {
      return CellStatus.UNDER_REVISION;
    } else {
      return CellStatus.RELEASED
    }
  }

  // If the cell has no claims, and is not in any releases, then it should be blank.
  if(!inFinishedRelease && !inOngoingRelease && !hasClaims) {
    return CellStatus.BLANK
  }


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
