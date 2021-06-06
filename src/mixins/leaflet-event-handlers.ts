import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

import CellXY from '/src/types/cell-x-y.ts'

/**
 * Intended for use with components representing and managing the lifecycle of Leaflet objects.
 *
 * Its principle use is to call `addEventListenersToEvented`.
 * `L.Evented` is Leaflet's top-level `L.Class` for objects that emit events, so it's the appropriately generic type to use. 
 * There are three event listeners added:
 * 1. `mouseover`, which emits a `CellXY` every time the user's mouse enters the area of a new cell.
 * 2. `mouseout`, which emits `null` every time the user's mouse leaves the `L.Evented`.
 * 3. `click`, which emits the `CellXY` corresponding to the location of the click.
 */
export default {
  data() {
    return {
      mouseingOver: false,
      lastEmittedCell: null
    };
  },
  methods: {
    /**
     * Leaflet's nomenclature is slightly weird here; `L.Evented` is the class
     * that generically contains all Leaflet objects that can emit events.
     */
    addEventListenersToEvented(evented: L.Evented) {
      this.addMouseoverListenersToEvented(evented);
      this.addClickListenersToEvented(evented);
      this.addMouseoutListenersToEvented(evented);
    },
    /**
     * Creates a CellXY containing the given `L.Latlng`.
     */
    cellFromLeafletPoint(latlng) {
      var leafletRasterRatioY = BACKGROUNDMAP_BOUND_LENGTH/this.backgroundmapMetadata.heightPixels;
      var leafletRasterRatioX = BACKGROUNDMAP_BOUND_LENGTH/this.backgroundmapMetadata.widthPixels;
      var cellSize = this.backgroundmapMetadata.borderWidth + this.backgroundmapMetadata.cellSideLength;
      var leafletY = latlng.lat;
      var leafletX = latlng.lng;
      var rasterY = leafletY/leafletRasterRatioY
      var rasterX = leafletX/leafletRasterRatioX
      var pixelsFromOriginY = rasterY - this.backgroundmapMetadata.originCellTopBorderY
      var pixelsFromOriginX = rasterX - this.backgroundmapMetadata.originCellRightBorderX
      /**
       * We add 1 to these calculations because the origin coordinates are of the top-right corner of the origin cell,
       * so any distance up or right puts you in a new cell.
       * For example, the bottom row of pixels in cell `{x:0, y:1}` is at `originCellTopBorderY + 1`,
       * which is `0` full `cellSize`s away from the origin.
       * The origin cell itself is mostly below and to the left of its top-right corner, so after `Math.floor`, it's at (-1, -1).
       */
      var cellsFromOriginY = Math.floor(pixelsFromOriginY/cellSize) + 1;
      var cellsFromOriginX = Math.floor(pixelsFromOriginX/cellSize) + 1;
      return new CellXY({
        x: cellsFromOriginX,
        y: cellsFromOriginY
      });
    },
    /**
     * This adds listeners for `mouseover` events, which emit a `CellXY`
     * every time the user's mouse enters the area of a new cell.
     *
     * `mousemove` is also used to emit `mouseover` events so that in `L.Evented`s that cover
     * multiple cells, events are more likely be fired after crossing the cell boundary
     * These events can lag behind someone moving the mouse cursor quickly, 
     * so one should be careful when using them to get the location of the user's mouse cursor.
     *
     * These listeners use `this.lastEmittedCell` to avoid emitting the same cell twice consecutively,
     * but you can get two matching consecutive `mouseover` cells if there's a `mouseout` event in between.
     */
    addMouseoverListenersToEvented(evented: L.Evented) {
      /**
       * Given a cell, will emit a `'mouseover'` event containing that cell if
       * the previous `'mouseover'` event did not also do so. Idempotent.
       */
      var mouseoverCell = (cell) => {
        if(!this.cellsMatch(cell, this.lastEmittedCell)) {
          this.lastEmittedCell = cell;
          this.$emit('mouseover', cell);
        }
      };
      evented.on('mouseover', (e) => {
        this.mouseingOver = true;
        mouseoverCell(this.cellFromLeafletPoint(e.latlng));
      });
      evented.on('mousemove', (e) => {
        mouseoverCell(this.cellFromLeafletPoint(e.latlng));
      });
    },
    /**
     * Emits the `CellXY` corresponding to the location of the click.
     *
     * Unlike `'mouseover'` or `'mouseout'`, the same cell can be emitted many times.
     *
     * If the user drags the map for less than a 300 milliseconds, it's considered a 'click', and 
     * an event is fired accordingly. This is because, when clicking cells quickly, it's easy to accidentally
     * drag the map.
     */
    addClickListenersToEvented(evented: L.Evented) {
      evented.on('click', (e) => {
        // This event handler determines its own cell instead of using `this.lastEmittedCell` because
        // the `'mousemove'` event sometimes lags behind the mouse cursor, which enables the user to click a cell
        // before the `'mousemove'` event for that cell has emitted.
        this.mouseingOver = true;
        this.$emit('click', this.cellFromLeafletPoint(e.latlng));
      });
    },
    addMouseoutListenersToEvented(evented: L.Evented) {
      evented.on('mouseout', () => {
        this.mouseingOver = false;
        this.lastEmittedCell = null;
        this.$emit('mouseout', null);
      });
    },
    /**
     * Determines whether 2 CellXY objects have the same X and Y.
     */
    cellsMatch(cell1, cell2) {
      if ((!cell1 && !!cell2) || (!!cell1 && !cell2)) return false;
      return cell1.x === cell2.x && cell1.y === cell2.y;
    },
  }
}
