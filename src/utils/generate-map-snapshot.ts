import MapChangeType from '/src/types/map-change-type.ts'
import MapSnapshot   from '/src/types/map-snapshot.ts'
import ClaimStatus   from '/src/types/claim-status.ts'
import ClaimType     from '/src/types/claim-type.ts'
import CellXY        from '/src/types/cell-x-y.ts'
import CellStatus    from '/src/types/cell-status.ts'
import Document      from '/src/types/document.ts'

/**
 * Given an ISO8601 string, and all of the necessary documents, produces a 
 * MapSnapshot for the given datetime.
 *
 *  `documents` should only include documents such that `date` is less than or equal to `snapshotTime`,
 *  and should only include documents of these two types:
 *  1. MapChangeType.RELEASE
 *  2. MapChangeType.CLAIM
 */
export default function generateMapSnapshot(documents: Document[], snapshotTime: string): MapSnapshot {
  /*
   * The snapshot is generated in four steps:
   * 1. A mapping is made from cells to the documents that contain them.
   *    Exterior claims and releases are also identified in this step to avoid
   *    iterating over all of the documents twice.
   * 2. The exteriors and releases from earlier are used to compute the `borderBlobs`.
   * 3. The remaining cells are put in `statusBlobs` according to their `CellStatus`es.
   * 4. The mapping from cells to documents is turned into a mapping from cells to document IDs,
   * and that becomes `cellDocuments`.
   *
   * TODO? change cellsToDocuments to a Map of `CellXY` to array of `Document`s
   * TODO Figure out how to treat releases (especially the claims within them) when the snapshotTime predates their startDate.
   *      Cells that are TENTATIVELY_COMPLETE should be COMPLETE if their is a released release whose start date is after the current snapshot.
   */
  var mapSnapshot = {
    borderBlobs: [],  // Replaced in step 2

    // Populated in step 3
    statusBlobs: {
      [CellStatus.RELEASED]:             [],
      [CellStatus.VANILLA]:              [],
      [CellStatus.BLANK]:                [],
      [CellStatus.PLANNING]:             [],
      [CellStatus.EXTERIOR]:             [],
      [CellStatus.INTERIORS]:            [],
      [CellStatus.QUESTS]:               [],
      [CellStatus.COMPLETED]:            [],
      [CellStatus.UNDER_REVISION]:       [],
      [CellStatus.TENTATIVELY_COMPLETE]: [],
    },
    cellDocuments: [] // Replaced in step 4
  };

  // Step 1
  var cellsToDocuments = {};
  var exteriorClaims = [];
  var releaseCells = []; 
  documents.forEach((doc) => {
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
   * 1. Their cells contain no claims of further types (interior or quest)
   * 2. They don't overlap with other exterior claims
   * 3. They are not in any finished releases
   *
   * Cells outside of any blobs are added to the `cellStatuses` object for usage in step 3.
   */
  var unblobbedCells = Object.keys(cellsToDocuments);
  var releaseBlobs = releases.reduce((releaseBlobs, release) => {
    releaseBlobs[release.id] = {
      // The "BETHESDA" creator recieves special treatment, so we need to keep track of this.
      creator: release.creator,
      // Released and unreleased releases are colored differently
      released: !!release.releaseDate,
      cells: []
    };
    return releaseBlobs;
  }, {});
  // We eliminate exterior blobs as we go. This enables us to keep things on one iteration.
  var exteriorBlobs = exteriorClaims.reduce((exteriorBlobs, exteriorClaim) => {
    exteriorBlobs[exteriorClaim.id] = exteriorClaim.cells.map(CellXY.toObjectKey);
    return exteriorBlobs;
  }, {});
  // Maps from cellKey to CellStatus. Used later for `statusBlobs`.
  var cellStatuses = {};

  unblobbedCells.forEach((cell) => {
    var { finishedReleases, futureReleases, unfinishedReleases, exteriorClaims, interiorClaims, questClaims } = cellsToDocuments[cell].reduce((cellDocumentsByType, doc) => {
      switch(doc.type) {
          case "RELEASE":
          if(!!doc.releaseDate) {
            if(doc.startDate > snapshotTime) {
              cellDocumentsByType.futureReleases.push(doc);
            } else {
              cellDocumentsByType.finishedReleases.push(doc);
            }
          } else {
            cellDocumentsByType.unfinishedReleases.push(doc);
          }
          break;
          case "CLAIM":
          if(claimStatus(doc) === ClaimStatus.CLOSED) break; // Closed claims are ignored for cell coloring purposes.
          if(doc.claimType === ClaimType.EXTERIOR) {
            cellDocumentsByType.exteriorClaims.push(doc);
          } else if(doc.claimType === claimType.INTERIOR) {
            cellDocumentsByType.interiorClaims.push(doc);
          } else if(doc.claimType === claimType.QUEST) {
            cellDocumentsByType.questClaims.push(doc);
          }
          break;
      }
      return cellDocumentsByType;
    }, {
      finishedReleases: [],
      unfinishedReleases: [],
      futureReleases: [],
      exteriorClaims: [],
      interiorClaims: [],
      questClaims: []
    });
    var containedByRelease = (finishedReleases.length > 0)
    var inBorderBlob = false;

    // Exterior blobs logic
    var breaksExteriorBlobs = [containedByRelease, ((interiorClaims.length + questClaims.length) > 0), (exteriorClaims.length > 1)].some((a) => a);
    if(breaksExteriorBlobs) {
      exteriorClaims.forEach((brokenExteriorClaim) => {
        delete exteriorBlobs[brokenExteriorClaim.id];
      });
    } else {
      inBorderBlob = true;
    }

    // Release blobs logic
    var latestReleaseContainingCell = finishedReleases.reduce((release, otherRelease) => {
      if(release.releaseDate > otherRelease.releaseDate) {
        return release;
      } else {
        return otherRelease;
      }
    });
    if(containedByRelease) {
      releaseBlobs[latestReleaseContainingCell].cells.push(cell);
      inBorderBlob = true;
    }
    if(!inBorderBlob) {
      cellStatuses[cell] = statusForCell(finishedReleases, unfinishedReleases, futureReleases, exteriorClaims, questClaims, interiorClaims);
    }
  });
  mapSnapshot.borderBlobs = Object.values(exteriorBlobs).map((cellKeys) => {
    return {
      cells: cellKeys.map(CellXY.fromObjectKey),
      cellStatus: CellStatus.EXTERIOR
    };
  }).concat(Object.values(releaseBlobs).map((releaseBlob) => {
    return {
      cells: releaseBlob.cells.map(CellXY.fromObjectKey);
      cellStatus: (() => {
        if(!release.released) return CellStatus.UNDER_REVISION;
        if(releaseBlob.creator === "BETHESDA") return CellStatus.VANILLA;
        return CellStatus.RELEASED;
      })()
    }
  }));

  // Step 3
  Object.entries(cellStatuses).forEach((statusBlobEntry) => {
    mapSnapshot.statusBlobs[statusBlobEntry[1]].push(statusBlobEntry[0]);
  });

  // Step 4
  mapSnapshot.cellDocuments = Object.fromEntries(Object.toEntries(cellsToDocuments).map((entry) => {
    return [entry[0], entry[1].id];
  }));

  return mapSnapshot;
}

function statusForCell(finishedReleases, unfinishedReleases, futureReleases, exteriorClaims, questClaims, interiorClaims) {
  // If the cell is in a finished release, then its color will
  // be decided by the color of the release blob, not the individual cell's color
  if(finishedReleases.length > 0) return CellStatus.BLANK;

  var hasExteriorClaims = exteriorClaims.length > 0;
  var hasInteriorClaims = interiorClaims.length > 0;
  var hasQuestClaims    = questClaims.length > 0;

  var exteriorStarted = exteriorClaims.every((exteriorClaim) => {
    return claimStatus(exteriorClaim) === ClaimStatus.NOT_STARTED;
  }) && exteriorClaims.length > 0;

  var exteriorFinished  = exteriorClaims.every(claimFinished) && exteriorClaims.length > 0;
  var interiorsFinished = interiorClaims.every(claimFinished) && interiorClaims.length > 0;
  var questsFinished    = questClaims.every(claimFinished) && questClaims.length > 0;

  // If the cell is in a release that has already happened, then its list of claims can be considered complete.
  // If the list of claims cannot be considered complete, then we just guess that if the claims list
  // includes quests, then it's complete. It's not great, but I think it's the best heuristic so that some of the
  // map gets `COMPLETE` before a release.
  var allClaimsAreKnown = (futureReleases.length > 1) || hasQuestClaims;

  if(allClaimsAreKnown) {
    if(!exteriorStarted) return CellStatus.PLANNING;
    if(!exteriorFinished) return CellStatus.EXTERIOR;
    if(!interiorsFinished) return CellStatus.INTERIORS;
    if(!questsFinished) return CellStatus.QUESTS;
    return CellStatus.COMPLETE;
  } else {
    if(!exteriorStarted) return CellStatus.PLANNING;
    if(!exteriorFinished) return CellStatus.EXTERIOR;
    if(exteriorFinished && !hasInteriorClaims) return CellStatus.TENTATIVELY_COMPLETE;
    if(hasInteriorClaims && !interiorsFinished) return CellStatus.INTERIORS;
    return CellStatus.TENTATIVELY_COMPLETE;
  }
}

function claimStatus(claim) {
  return claim.updates(-1)[0].newClaimStatus;
}

function claimFinished(claim) {
  return claimStatus(claim) === ClaimStatus.DONE;
}

function releaseIsFinished(release, date) {
  return (!!release.releaseDate && release.releaseDate > date);
}
