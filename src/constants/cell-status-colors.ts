import CellStatus from '/src/types/cell-status.ts'

/**
 * See `'/src/types/cell-status.ts'`
 */
export default {
  [CellStatus.RELEASED]:  "#00ff00", // Blue
  [CellStatus.VANILLA]:   "#00ff00", // Dark Gray
  [CellStatus.BLANK]:     "#ffffff", // White, but this color should never appear
  [CellStatus.PLANNING]:  "#ff0000", // Red
  [CellStatus.EXTERIOR]:  "#ff9933", // Orange
  [CellStatus.INTERIORS]: "#fdbb77", // Macaroni
  [CellStatus.QUESTS]:    "#ffff00", // Yellow
  [CellStatus.COMPLETED]: "#00ff00", // Green
}

