import MapChangeType from '/src/types/map-change-type.ts'
import MapSnapshot   from '/src/types/map-snapshot.ts'
import ClaimStatus   from '/src/types/claim-status.ts'
import ClaimType     from '/src/types/claim-type.ts'
import CellXY        from '/src/types/cell-x-y.ts'
import CellStatus    from '/src/types/cell-status.ts'
import Document      from '/src/types/document.ts'

import statusForClaim from '/src/utils/status-for-claim.ts'
import statusForCell  from '/src/utils/status-for-cell.ts'

/**
 * Given an ISO8601 string, and all of the releases and claims in the database, produces a 
 * MapSnapshot for the given datetime.
 *
 *  `documents` should only include documents of these two types:
 *  1. RELEASE
 *  2. CLAIM
 */
export default function generateMapSnapshot(documents: Document[], snapshotTime: string): MapSnapshot {
  /*
   * The snapshot is generated in these steps:
   * 1. Identify cells
   *    A mapping is made from cells to the documents that contain them.
   *    Exterior claims and releases are also identified in this step to avoid
   *    iterating over all of the documents twice.
   * 2. Iterate over cells
   *    The exteriors and releases from earlier are used to compute the `borderBlobs`.
   *    During this step, claims and releases for each cell are also distinguished.
   * 3. The remaining cells are put in `statusBlobs` according to their `CellStatus`es.
   */
  const mapSnapshot = {
    borderBlobs: [],  // Replaced in step 2
    cellReleases: {}, // Replaced in step 2
    cellClaims: {},   // Replaced in step 2
    // Populated in step 3
    statusBlobs: {
      [CellStatus.RELEASED]:           [],
      [CellStatus.VANILLA]:            [],
      [CellStatus.BLANK]:              [],
      [CellStatus.UNDER_REVISION]:     [],
      [CellStatus.HAS_NO_EXTERIOR]:    [],
      [CellStatus.EXTERIOR_FINISHED]:  [],
      [CellStatus.INTERIORS_FINISHED]: [],
      [CellStatus.HAS_QUESTS]:         [],
    },
  };

  // Step 1
  var cellsToDocuments = {};
  var exteriorClaims = [];
  var releases = [];
  var releaseCells = []; 
  documents.forEach((doc) => {
    if(doc.docCreatedDate > snapshotTime) return;
    var cells;
    switch(doc.type) {
        case "CLAIM":
        cells = doc.cells;
        if(doc.claimType === ClaimType.EXTERIOR) exteriorClaims.push(doc);
        break;
        case "RELEASE":
        cells = doc.releasedCells
        releases.push(doc);
        break;
        default:
        throw new Error(`Document of invalid type ${doc.type} given to generateMapSnapshot`);
    }
    cells.map(CellXY.toObjectKey).forEach((cellKey) => {
      if(!cellsToDocuments.hasOwnProperty(cellKey)) {
        cellsToDocuments[cellKey] = [];
      }
      cellsToDocuments[cellKey].push(doc);
    });
  });

  // Step 2
  /*
   * The `borderBlobs` logic is as follows:
   * Cells that only belong to one finished release go to that release's blob.
   * Cells that belong to an unfinished release AND a finished release go into the unfinished release's blob.
   * Cells that belong only to an unfinished release are not blobbed according to release logic.
   *
   * Exterior claims recieve their own border blobs if:
   * 1. The claim is unfinished
   * 2. The claim does not overlap with other exterior claims
   * 3. The claim does not overlap with any finished releases
   *
   * Cells outside of any blobs are added to the `cellStatuses` object for usage in step 3.
   */
  var unblobbedCells = Object.keys(cellsToDocuments);
  // The releaseBlobs are not purely blobs of cells; some metadata is attached so that
  // CellStatus can be correctly assigned later.
  var releaseBlobs = releases.reduce((releaseBlobs, release) => {
    releaseBlobs[release.id] = {
      // The "BETHESDA" creator recieves special treatment, so we need to keep track of this.
      creator: release.creator,
      // Released and unreleased releases are colored differently
      released: !!release.releaseDate,
      // When releases overlap, each of the overlapped cells goes to only one of its releases, 
      // so we don't know which cells go to which releases yet.
      cells: []
    };
    return releaseBlobs;
  }, {});
  // We eliminate exterior blobs as we go. This enables us to keep things on one iteration.
  // Like the releaseBlobs, these blobs also have some metadata attached for CellStatus determination.
  var exteriorBlobs = exteriorClaims.reduce((exteriorBlobs, exteriorClaim) => {
    exteriorBlobs[exteriorClaim.id] = {
      claimStatus: statusForClaim(exteriorClaim, snapshotTime),
      // Unlike releases, overlapping exterior claims cause both claims to not recieve a border, so
      // we do have enough information here to know which cells an exterior border blob will have.
      cells: exteriorClaim.cells.map(CellXY.toObjectKey)
    };
    return exteriorBlobs;
  }, {});
  // Maps from cellKey to CellStatus. Used later for `statusBlobs`.
  var cellStatuses = {};
  const cellsToReleaseIds = {};
  const cellsToClaimIds = {};

  // Returns true when given 0 claims.
  const noUnfinishedClaimStatuses = (claimStatuses, snapshotTime) => {
    return claimStatuses.every((claimStatus) => {
      return claimStatus === ClaimStatus.DONE;
    });
  }
  unblobbedCells.forEach((cell) => {
    cellsToReleaseIds[cell] = [];
    cellsToClaimIds[cell] = [];
    var { finishedReleases, unfinishedReleases, exteriorClaims, interiorClaims, questClaims, otherClaims } = cellsToDocuments[cell].reduce((cellDocumentsByType, doc) => {
      switch(doc.type) {
          case "RELEASE":
          cellsToReleaseIds[cell].push(doc.id);
          if(!doc.releaseDate) {
            cellDocumentsByType.unfinishedReleases.push(doc);
          } else {
            if(doc.releaseDate > snapshotTime) {
              cellDocumentsByType.unfinishedReleases.push(doc);
            } else {
              cellDocumentsByType.finishedReleases.push(doc);
            }
          }
          break;
          case "CLAIM":
          cellsToClaimIds[cell].push(doc.id);
          if(statusForClaim(doc, snapshotTime) === ClaimStatus.CLOSED) break; // Closed claims are ignored for cell coloring purposes.
          if(doc.claimType === ClaimType.EXTERIOR) {
            cellDocumentsByType.exteriorClaims.push(doc);
          } else if(doc.claimType === ClaimType.INTERIOR) {
            cellDocumentsByType.interiorClaims.push(doc);
          } else if(doc.claimType === ClaimType.QUEST) {
            cellDocumentsByType.questClaims.push(doc);
          } else {
            cellDocumentsByType.otherClaims.push(doc);
          }
          break;
      }
      return cellDocumentsByType;
    }, {
      finishedReleases: [],
      unfinishedReleases: [],
      exteriorClaims: [],
      interiorClaims: [],
      questClaims: [],
      otherClaims: []
    });

    var containedByRelease = (finishedReleases.length > 0)
    var inBorderBlob = false;

    // Exterior blobs logic
    var breaksExteriorBlobs = [
      // Overlaps with release
      containedByRelease,
      // Overlaps with another exterior claim
      (exteriorClaims.length > 1),
      // Exterior claim cannot be finished
      (exteriorClaims.length > 0 && (statusForClaim(exteriorClaims[0], snapshotTime) === ClaimStatus.DONE))
    ].some((a) => a);
    if(breaksExteriorBlobs) {
      exteriorClaims.forEach((brokenExteriorClaim) => {
        delete exteriorBlobs[brokenExteriorClaim.id];
      });
    }
    // Note that we do not set inBorderBlob to true here because the other cells in the blob may 
    // have been non-breaking, and already passed through to cellStatuses. For this reason, we need to filter
    // borderblobbed cells from exteriors after this iteration, since we don't know which blobs are broken until
    // the iteration is over.

    // Release blobs logic
    if(finishedReleases.length > 0) {
      var latestReleaseContainingCell = (finishedReleases.concat(unfinishedReleases)).reduce((release, otherRelease) => {
        if(release.releaseDate > otherRelease.releaseDate) {
          return release;
        } else {
          return otherRelease;
        }
      }).id;
      if(containedByRelease) {
        releaseBlobs[latestReleaseContainingCell].cells.push(cell);
        inBorderBlob = true;
      }
    }

    // Storing the status of un-borderblobbed cells for step 3.
    if(!inBorderBlob) {
      let hasClaims = (exteriorClaims.length + interiorClaims.length + questClaims.length + otherClaims.length) > 0;
      let hasExteriors = exteriorClaims.length > 0;
      let hasInteriors = interiorClaims.length > 0;
      let noUnfinishedInteriors = noUnfinishedClaimStatuses(interiorClaims.map((interiorClaim) => {
        return statusForClaim(interiorClaim, snapshotTime);
      }));
      let noUnfinishedExteriors = noUnfinishedClaimStatuses(exteriorClaims.map((exteriorClaim) => {
        return statusForClaim(exteriorClaim, snapshotTime);
      }));
      let hasCompletedQuests = questClaims.filter((questClaim) => {
        return statusForClaim(questClaim, snapshotTime) === ClaimStatus.DONE;
      }).length > 0;
      cellStatuses[cell] = statusForCell(hasExteriors, hasInteriors, noUnfinishedInteriors, noUnfinishedExteriors, hasCompletedQuests, false, false, hasClaims);
    }
  });
  mapSnapshot.cellReleases = cellsToReleaseIds;
  mapSnapshot.cellClaims = cellsToClaimIds;

  // Removing cells in borderBlobbed exteriors
  var exteriorBlobCells = Object.values(exteriorBlobs).map((exteriorBlob) => {
    return exteriorBlob.cells;
  }).flat();
  cellStatuses = Object.fromEntries(Object.entries(cellStatuses).filter(([cellKey, cellStatus]) => {
      return !exteriorBlobCells.includes(cellKey);
  }));
  mapSnapshot.borderBlobs = Object.values(exteriorBlobs).map((exteriorBlob) => {
    return {
      cells: exteriorBlob.cells.map(CellXY.fromObjectKey),
      cellStatus: {
        [ClaimStatus.NOT_STARTED]: CellStatus.HAS_NO_EXTERIOR,
        [ClaimStatus.IN_PROGRESS]: CellStatus.HAS_NO_EXTERIOR,
        [ClaimStatus.CLOSED]: CellStatus.BLANK,
        [ClaimStatus.DONE]: CellStatus.EXTERIOR_FINISHED
      }[exteriorBlob.claimStatus]
    };
  }).concat(Object.values(releaseBlobs).map((releaseBlob) => {
    return {
      cells: releaseBlob.cells.map(CellXY.fromObjectKey),
      cellStatus: (() => {
        if(!releaseBlob.released) return CellStatus.UNDER_REVISION;
        if(releaseBlob.creator === "BETHESDA") return CellStatus.VANILLA;
        return CellStatus.RELEASED;
      })()
    }
  }));

  // Step 3
  Object.entries(cellStatuses).forEach((statusBlobEntry) => {
    mapSnapshot.statusBlobs[statusBlobEntry[1]].push(CellXY.fromObjectKey(statusBlobEntry[0]));
  });

  return mapSnapshot;
}
