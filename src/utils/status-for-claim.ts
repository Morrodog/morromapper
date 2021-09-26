import ClaimStatus   from '/src/types/claim-status.ts'

export default function statusForClaim(claim, snapshotTime) {
  // `CLOSED` status applies retroactively, so we should check for it before checking the status as of the snapshotTime.
  // (If a non-`CLOSED` update has happened since the issue was closed, then it's assumed that it was reopened.
  if(claim.updates.slice(-1)[0].newClaimStatus === ClaimStatus.CLOSED) return ClaimStatus.CLOSED;
  // A claim should always have at least one update.
  if(claim.updates.length === 0) throw new Error(`Invalid claim given as argument to claimStatus: Claim has 0 updates. A new claim should have at least one.`);

  // Ignore changes that have not happened yet according to the `snapshotTime`.
  return claim.updates.filter((update) => {
    return update.changeDate <= snapshotTime;
  }).slice(-1)[0].newClaimStatus;
}
