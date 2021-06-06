/*
import {Layer} from 'leaflet/Layer/Layer';
import * as Util from 'leaflet/core/Util';
import {toLatLngBounds} from 'leaflet/geo/LatLngBounds';
import {Bounds} from 'leaflet/geometry/Bounds';
import * as DomUtil from 'leaflet/dom/DomUtil';
*/
import { Bounds, LatLng, LatLngBounds, Util, DomUtil, Layer } from 'leaflet';

import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

import CellXY from '/src/types/cell-x-y.ts'

const Z_INDEX = 30;

const getLeafletRasterRatioY = function getLeafletRasterRatio(backgroundmapMetadata) {
  return BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.widthPixels;
};
const getLeafletRasterRatioX = function getLeafletRasterRatio(backgroundmapMetadata) {
  return BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.heightPixels;
};
const findFarCoordinateOfCell = function findFarCoordinateOfCell(coordinate, farOriginBorder, backgroundmapMetadata) {
  return (
    (farOriginBorder) +
    (coordinate * backgroundmapMetadata.cellSideLength) +
    (coordinate * backgroundmapMetadata.borderWidth)
  );
};
const getCellBounds = function getCellRasterCoordinates(cell, backgroundmapMetadata) {
  var ratioX = getLeafletRasterRatioX(backgroundmapMetadata);
  var ratioY = getLeafletRasterRatioX(backgroundmapMetadata);

  // These "interior" coordinates describe the bounds of a square just inside of, and not including, the borders of the cell.
  var interiorRightRaster  = findFarCoordinateOfCell(cell.x, backgroundmapMetadata.originCellRightBorderX, backgroundmapMetadata);
  var interiorTopRaster    = findFarCoordinateOfCell(cell.y, backgroundmapMetadata.originCellTopBorderY, backgroundmapMetadata);

  var interiorLeftRaster   = interiorRightRaster - backgroundmapMetadata.cellSideLength; //Note that borderWidth is NOT subtracted here
  var interiorBottomRaster = interiorTopRaster   - backgroundmapMetadata.cellSideLength; //Note that borderWidth is NOT subtracted here

  var interiorLeft   = interiorLeftRaster * ratioX
  var interiorBottom = interiorBottomRaster * ratioY

  // These "exterior" coordinates describe the bounds of a square that extends to include the border.
  // Only two bounds are defined here (right and top) in accordance to the description of the method.
  var exteriorRight = (interiorRightRaster + backgroundmapMetadata.borderWidth) * ratioX;
  var exteriorTop   = (interiorTopRaster   + backgroundmapMetadata.borderWidth) * ratioY;

  console.log(interiorBottom);
  console.log(exteriorTop);
  return [
    new LatLng(interiorBottom, interiorLeft),// bottom-left corner of the cell (does not include the borders)
    new LatLng(exteriorTop, exteriorRight),  // top-right corner of the cell (does include the borders
  ]
};

var CellDiv = Layer.extend({
	initialize: function (backgroundmapMetadata: RasterBackgroundmapMetadata, cell: CellXY) { // ( L.LatLngBounds)
    this.cell = cell;
    var cellBounds = getCellBounds(cell, backgroundmapMetadata);
    console.log(cellBounds);
		this._bounds = new LatLngBounds(cellBounds[0], cellBounds[1]);
	},

	onAdd: function () {
		if (!this._div) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

    DomUtil.addClass(this._div, 'leaflet-interactive');
    this.addInteractiveTarget(this._div);

		this.getPane().appendChild(this._div);
		this._reset();
	},

	onRemove: function () {
		DomUtil.remove(this._div);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._div);
		}
	},

	// @method setOpacity(opacity: Number): this
	// Sets the opacity of the overlay.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._div) {
			this._updateOpacity();
		}
		return this;
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

	// @method getBounds(): LatLngBounds
	// Get the bounds that this ImageOverlay covers
	getBounds: function () {
		return this._bounds;
	},

	// @method getElement(): HTMLElement
	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
	// used by this overlay.
	getElement: function () {
		return this._div;
	},

	_initImage: function () {
    var img = this._div = DomUtil.create('div');//wasElementSupplied ? this._url : DomUtil.create('img');

		DomUtil.addClass(img, 'leaflet-image-layer');
		DomUtil.setOpacity(this._div, 0);
    this._div.style.zIndex = Z_INDEX;
	},

	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

		DomUtil.setTransform(this._div, offset, scale);
	},

	_reset: function () {
		var div = this._div,
		    bounds = new Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		DomUtil.setPosition(div, bounds.min);

		div.style.width  = size.x + 'px';
		div.style.height = size.y + 'px';
	},
});

export default CellDiv
