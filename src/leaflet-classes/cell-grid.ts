import { Bounds, LatLng, LatLngBounds, Util, DomUtil, Layer } from 'leaflet';
import * as Bowser                                            from 'bowser'

import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'
import HOVER_CELL_COLOR           from '/src/constants/hover-cell-color.ts'

import CellXY from '/src/types/cell-x-y.ts'

/**
 * `DEBUG` will cause the cells to be shown in checkerboarded blue and green.
 */
const DEBUG = false;

// The Z-index for polygons in Leaflet is 400 by default, and we want this to be just in front of the polygons
// so that none of them catch the mouse in front of the cellgrid.
const Z_INDEX = 401;

/**
 * The impetus for creating this class was that creating an `L.Layer` subclass used for 
 * each cell caused performance issues when moving the map, and the bottleneck was Leaflet's
 * recalculation of the CSS that places each cell on the map. So the idea is that this 
 * single grid-layer will be the only thing that Leaflet needs to reposition, and that its
 * child `div`s will move with it according to grid CSS.
 *
 * Of note is that this class highlights the user's currently hovered cell.
 *
 * `CellGrid`s emit two events:
 * 1. 'click' when a cell is clicked
 * 2. 'cellhover' when the user's mouse cursor enters a cell
 *
 * For both events, the event object has a `cell` property that contains the CellXY for that cell.
 */
var CellGrid = Layer.extend({
  /**
   * The initialization of the CellGrid does two things:
   * 1. It makes the backgroundmapMetadata available on the instance as `this._bm`.
   * 2. It calculates the Leaflet bounds of the grid overlay, and makes them available as `this._bounds`.
   */
	initialize(backgroundmapMetadata: RasterBackgroundmapMetadata) { // ( L.LatLngBounds)
    var bm = this._bm = backgroundmapMetadata;
    // Determine the bounds of the grid
    var ratioX       = BACKGROUNDMAP_BOUND_LENGTH/bm.widthPixels,
        ratioY       = BACKGROUNDMAP_BOUND_LENGTH/bm.heightPixels,
        rasterBounds = bm.gridBounds;
    this._bounds = new LatLngBounds([
      new LatLng(rasterBounds[1][0]*ratioY, rasterBounds[0][1]*ratioX),//bottom left
      new LatLng(rasterBounds[0][0]*ratioY, rasterBounds[1][1]*ratioX),//top right
    ]);
	},
	onAdd() {
    this._map.on('movestart', () => {
      this._grid.style.display = "none";
    });
    this._map.on('moveend', () => {
      this._grid.style.display = "grid";
    });
    // Creating the overlay...
    var overlay = this._overlay = DomUtil.create('div');
    DomUtil.addClass(overlay, 'leaflet-image-layer');// If this class is removed, the grid does not appear at all
    DomUtil.addClass(overlay, 'leaflet-interactive');// If this class is removed, elements under this._overlay no longer fire events
    overlay.style.zIndex = Z_INDEX;
    // Adding the grid...
    this._grid = this._createGrid();
    this._overlay.appendChild(this._grid);
    // Putting the overlay into the Leaflet container...
		this.getPane().appendChild(this._overlay);
    this._positionOverlay();
	},
  _createGrid() {
    // Aliases
    var bm           = this._bm,
        borderWidth  = bm.borderWidth,
        rasterBounds = bm.gridBounds;
    // Calculations
    var rasterCellSize   = bm.cellSideLength + bm.borderWidth,
        rasterPixelsTall = rasterBounds[0][0] - rasterBounds[0][1],// top - bottom
        rasterPixelsWide = rasterBounds[1][1] - rasterBounds[0][1],// right - left
        cellsWide        = (rasterPixelsWide - borderWidth)/rasterCellSize,
        cellsTall        = (rasterPixelsTall - borderWidth)/rasterCellSize,
        topCellRow       = (rasterBounds[0][0] - borderWidth - bm.originCellTopBorderY)/rasterCellSize,
        leftCellColumn   = (rasterBounds[0][1] -               bm.originCellRightBorderX)/rasterCellSize;
    // Quick validation of the backgroundmap bounds
    if(cellsWide%1 > 0.00001) throw new Error("Width of backgroundmap gridBounds is not a whole number of cells");
    if(cellsTall%1 > 0.00001) throw new Error("Height of backgroundmap gridBounds is not a whole number of cells");
    // Now that the necessary calculations have been done, we can create the element for the grid.
    var grid = DomUtil.create('div');
    Object.assign(grid.style, {
      "display": "grid",
      "grid-template-columns": `repeat(${cellsWide}, 1fr)`,
      "grid-template-rows": `repeat(${cellsTall}, 1fr)`,
      "grid-gap": "0px",
      "gap": "0px",
      "height": "100%",
      "width": "100%"
    });
    // Creating the cells...
    var cells = new DocumentFragment();
    for(var rowsFromTop = 0; (cellsTall - rowsFromTop) > 0; rowsFromTop++) {
      for(var columnsFromLeft = 0; (cellsWide - columnsFromLeft) > 0; columnsFromLeft++) {
        ((rowsFromTop, columnsFromLeft) => {
          var gridCell = DomUtil.create('div');
          var cellColor = (DEBUG)?((rowsFromTop%2 === columnsFromLeft%2)?"blue":"green"):"#00000000";
          // CSS Grid rows and columns are 1-based, and inclusive of the start track.
          Object.assign(gridCell.style, {
            "grid-column-start": columnsFromLeft + 1,
            "grid-column-end":   columnsFromLeft + 2,
            "grid-row-start":    rowsFromTop + 1,
            "grid-row-end":      rowsFromTop + 2,
            "background-color":  cellColor
          });
          this._addEventListenersToCell(gridCell, cellColor, new CellXY({
            y: topCellRow - rowsFromTop,
            x: leftCellColumn + columnsFromLeft + 1
          }));
          cells.appendChild(gridCell)
        })(rowsFromTop, columnsFromLeft);
      }
    }
    grid.appendChild(cells);
    return grid;
  },
  /**
   * The event listeners attached to each cell have three roles:
   * 1. Emit "click" events containing the clicked CellXY
   * 2. Emit "cellhover" events containing the hovered-over cell
   * 3. Highlight the cell when the user's mouse cursor is in it.
   *
   * In all of these event listeners, the cellXY is in the "cell" property of the emitted 
   * object because the CellXY gets contaminated by Leaflet event properties if it's emitted directly.
   */
  _addEventListenersToCell(gridCell, cellColor, cellXY) {
    gridCell.addEventListener('click', () => {
      this.fire('click', {
        cell: cellXY
      });
    });
    gridCell.addEventListener('mouseenter', () => {
      // While it would be slightly tidier to register a second 'mouseenter' listener for
      // the hoverCell color change, performance is of the essence.
      gridCell.style.backgroundColor = HOVER_CELL_COLOR;
      this.fire('cellhover', {
        cell: cellXY
      });
    });
    gridCell.addEventListener('mouseleave', () => {
      gridCell.style.backgroundColor = cellColor;
    });
  },
  /**
   * Positions `this._overlay` atop the Leaflet container independently of any previous position.
   *
   * Called on zoom, viewreset, and initialization.
   */
	_positionOverlay() {
		var bounds = new Bounds(
      this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
      this._map.latLngToLayerPoint(this._bounds.getSouthEast())
    );
    var size = bounds.getSize();
		DomUtil.setPosition(this._overlay, bounds.min);
		this._overlay.style.width  = size.x + 'px';
		this._overlay.style.height = size.y + 'px';
	},
  // Called by Leaflet
	onRemove() {
		DomUtil.remove(this._overlay);
	},
  // Called by Leaflet
	getEvents() {
		var events = {
			zoom:      this._positionOverlay,
			viewreset: this._positionOverlay
		};
    if(this._zoomAnimated) {
      events.zoomanim = (e) => {
        var scale  = this._map.getZoomScale(e.zoom);
        var offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;
        DomUtil.setTransform(this._overlay, offset, scale);
      };
    }
		return events;
	},
  // Called by Leaflet
	getElement() {
		return this._overlay;
	}
});

export default CellGrid
