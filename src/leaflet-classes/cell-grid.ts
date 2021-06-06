import { Bounds, LatLng, LatLngBounds, Util, DomUtil, Layer } from 'leaflet';

import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

import CellXY from '/src/types/cell-x-y.ts'

const Z_INDEX = 30;

const range = (start, end) => {
  return (new Array(end - start + 1)).fill().map((x, i) => {
    return start+i
  });
}

const getLeafletRasterRatioY = function getLeafletRasterRatio(backgroundmapMetadata) {
  return BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.widthPixels;
};
const getLeafletRasterRatioX = function getLeafletRasterRatio(backgroundmapMetadata) {
  return BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.heightPixels;
};
const getGridBounds = function getGridBounds(backgroundmapMetadata) {
  var ratioX = getLeafletRasterRatioX(backgroundmapMetadata);
  var ratioY = getLeafletRasterRatioY(backgroundmapMetadata);
  var rasterBounds = backgroundmapMetadata.gridBounds;
  return new LatLngBounds([
    new LatLng(rasterBounds[1][0]*ratioY, rasterBounds[0][1]*ratioX),//bottom left
    new LatLng(rasterBounds[0][0]*ratioY, rasterBounds[1][1]*ratioX),//top right
  ]);
};

/**
 * The impetus for creating this class was that creating an `L.Layer` subclass used for 
 * each cell caused performance issues when moving the map, and the bottleneck was Leaflet's
 * recalculation of the CSS that places each cell on the map. So the idea is that this 
 * single grid-layer will be the only thing that Leaflet needs to reposition, and that its
 * child `div`s will move with it, since positions of the cells relative to eachother never changes.
 *
 * Doing it this way also enables us to position the cell divs with basic CSS
 * instead of grid-specific logic. The idea is that each cell gets a square `div` with
 * `display: inline-block`, and then they all simply get added to the container div:
 * And they wrap when they reach the end of the div just like a normal HTML element.
 */
var CellGrid = Layer.extend({
	initialize: function (backgroundmapMetadata: RasterBackgroundmapMetadata) { // ( L.LatLngBounds)
    this._bm = backgroundmapMetadata;
		this._bounds = getGridBounds(backgroundmapMetadata);
	},

	onAdd: function () {
		if (!this._overlay) {
			this._init();
		}
    this._scaleCellsToZoomLevel(this._map.getZoom());
    this._map.on('zoomend', () => {
      this._scaleCellsToZoomLevel(this._map.getZoom());
    });

    DomUtil.addClass(this._overlay, 'leaflet-interactive');
    this.addInteractiveTarget(this._overlay);

		this.getPane().appendChild(this._overlay);
		this._reset();
	},
  _scaleCellsToZoomLevel(zoomLevel) {
    var ratioX = getLeafletRasterRatioX(this._bm);
    var ratioY = getLeafletRasterRatioY(this._bm);

    Object.assign(this._grid.style, {
      "padding-left":   `${1*ratioX/(2**(-1*zoomLevel))}px`,
      "padding-bottom": `${1*ratioX/(2**(-1*zoomLevel))}px`,
    });
    for (var i = 0; i < this._grid.children.length; i++) {
      Object.assign(this._grid.children[i].style, {
        "width": `${(40*ratioX)/(2**(-1*zoomLevel))}px`,
        "height":   `${(40*ratioX)/(2**(-1*zoomLevel))}px`
      });
    }
  },

	onRemove: function () {
		DomUtil.remove(this._overlay);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._overlay);
		}
	},

	getEvents: function () {
		var events = {
			zoom: this._reset,
			viewreset: this._reset
		};

    if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
    }

		return events;
	},

	// @method getElement(): HTMLElement
	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
	// used by the cellgrid
	getElement: function () {
		return this._overlay;
	},

	_init: function () {
    var grid = this._overlay = DomUtil.create('div');//wasElementSupplied ? this._url : DomUtil.create('img');
		DomUtil.addClass(grid, 'leaflet-image-layer');
    /*Object.assign(grid.style, {
      "display": "block",
    });*/
		DomUtil.setOpacity(this._overlay, 1);
    this._overlay.style.zIndex = Z_INDEX;

    var innerGrid = this._grid = DomUtil.create('div');//wasElementSupplied ? this._url : DomUtil.create('img');
    Object.assign(innerGrid.style, {
      "display": "block",
      "line-height": "0px",
      "letter-spacing": 0,
      "background-color": "red",
      "width": "100%",
      "height": "100%",
      "z-index": Z_INDEX + 1
    });
    //innerGrid.innerHTML = "asdf";
    this._addCells(innerGrid);
    grid.appendChild(innerGrid);
	},

  _addCells(grid) {
    var bm = this._bm;
    var borderWidth = bm.borderWidth;
    var rasterCellSize  = bm.cellSideLength + this._bm.borderWidth;
    var rasterBounds = bm.gridBounds;
    var rasterPixelsTall = rasterBounds[0][0] - rasterBounds[0][1];// top - bottom
    var rasterPixelsWide = rasterBounds[1][1] - rasterBounds[0][1];// right - left
    var ratioX = getLeafletRasterRatioX(bm);
    var ratioY = getLeafletRasterRatioY(bm);
    var rasterBounds = bm.gridBounds;
    var cellsWide = (rasterPixelsWide - borderWidth)/rasterCellSize;
    var cellsTall = (rasterPixelsTall - borderWidth)/rasterCellSize;
    if(cellsWide%1 > 0.00001) {
      throw new Error("Width of backgroundmap gridBounds is not a whole number of cells");
    }
    if(cellsTall%1 > 0.00001) {
      throw new Error("Height of backgroundmap gridBounds is not a whole number of cells");
    }
    var boundsWidth = this._bounds.getEast() - this._bounds.getWest();
    var boundsHeight = this._bounds.getNorth() - this._bounds.getSouth();
    var cells = new DocumentFragment();
    range(1, Math.ceil(cellsWide)).map((/*cellColumn*/) => {
      return range(1, Math.ceil(cellsWide)).map((cellRow, i) => {
        var cellDiv = DomUtil.create('div');
        Object.assign(cellDiv.style, {
          "background-color": ((i%2===1)?"blue":"green"),
          "display": "inline-block"
        });
        return cellDiv;
      });
    }).flat().forEach((cellDiv) => {
      cells.appendChild(cellDiv);
    });
    grid.appendChild(cells);
  },
 	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;
  var ratioX = getLeafletRasterRatioX(this._bm);
  var ratioY = getLeafletRasterRatioY(this._bm);
  var zoomLevel = this._map.getZoom();

    /*Object.assign(this._grid.style, {
      "line-height": `${40/(4**zoomLevel)}px`,
      "font-size":   `${40/(4**zoomLevel)}px`
    });*/
		DomUtil.setTransform(this._overlay, offset, scale);
  },
	_reset: function () {
		var div = this._overlay,
		    bounds = new Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		DomUtil.setPosition(div, bounds.min);

		div.style.width  = size.x + 'px';
		div.style.height = size.y + 'px';
	},
});

export default CellGrid
