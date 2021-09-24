import CellStatus from '/src/types/cell-status.ts'

/**
 * See `'/src/types/cell-status.ts'`
 */
export default {
  [CellStatus.BLANK]:              "#ffffff00", // Transparent
  [CellStatus.RELEASED]:           "#1111ee80", // Blue
  [CellStatus.VANILLA]:            "#33333380", // Dark Gray
  [CellStatus.UNDER_REVISION]:     "#9911ee80", // Purple. Meant to look like RELEASED tinted red slightly
  [CellStatus.HAS_NO_EXTERIOR]:    "#dd000080", // Red
  [CellStatus.EXTERIOR_FINISHED]:  "#dd771180", // Orange
  [CellStatus.INTERIORS_FINISHED]: "#dddd0080", // Yellow
  [CellStatus.HAS_QUESTS]:         "#00dd0080", // Green
}

