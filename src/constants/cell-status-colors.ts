import CellStatus from '/src/types/cell-status.ts'

/**
 * See `'/src/types/cell-status.ts'`
 */
export default {
  [CellStatus.RELEASED]:             "#0000ff80", // Blue
  [CellStatus.VANILLA]:              "#55555580", // Dark Gray
  [CellStatus.BLANK]:                "#ffffff00", // White, but this color should never appear
  [CellStatus.PLANNING]:             "#ff000080", // Red
  [CellStatus.EXTERIOR]:             "#ff993380", // Orange
  [CellStatus.INTERIORS]:            "#fdbb7780", // Macaroni
  [CellStatus.QUESTS]:               "#ffff0080", // Yellow
  [CellStatus.COMPLETED]:            "#00ff0080", // Green
  [CellStatus.UNDER_REVISION]:       "#ff00ff80", // Purple
  [CellStatus.TENTATIVELY_COMPLETE]: "#66ff0080", // Not quite green
}

