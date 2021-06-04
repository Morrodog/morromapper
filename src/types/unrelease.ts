/**
 * An `Unrelease` represents an instance where Tamriel Rebuilt decides to redo an area, so a previously-released area now needs its changes tracked again.
 *
 * This scenario is likely to happen eventually, as much of the currently released territory is planned to be redone. 
 *
 * Any cell that is "unreleased" is simply removed from the `MapState` table completely, and will only reappear there if new claims are made or updated that include those cells.
 *
 * An ES6 class is used instead of a constructor function so that the MapStateChange interface could be implemented.
 */
class Unrelease implements MapStateChange {
  unreleasedCells: CellXY[];
}

export default Unrelease
