/**
 * Specifies the location of a cell in Morrowind gameworld space. Note that the two `number`s should always be integers.
 *
 * Structured as an object with `x` and `y` properties even though it's normally presented as "[x, y]" in communication between people.
 * This structure was chosen because it's slightly more explicit (no lng/lat vs. lat/lng confusion), and because it's a bit more readable (`.y` versus `[1]`).
*/
function CellXY(unboxedCellXY) {
  this.x = unboxedCellXY.x;
  this.y = unboxedCellXY.y;
  CellXY.validate(this);
}
CellXY.validate = function validate(unboxedCellXY) {
  if(unboxedCellXY.x%1 !== 0) {
    throw new Error("Non-integer X value given for a CellXY.");
  }
  if(unboxedCellXY.y%1 !== 0) {
    throw new Error("Non-integer Y value given for a CellXY.");
  }
}

export default CellXY;
