/*
 * Given an array of `CellXY`s and a RasterBackgroundmapMetadata, returns a polygon
 * for displaying the `CellXY`s on a map.
 */
import union from '@turf/union'

import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

import RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
import CellXY                      from '/src/types/cell-x-y.ts'

/*
 * Convenience function for computing the conversion ratios for going between Leaflet and raster coordinates.
 */
const getLeafletRasterRatios = (backgroundmapMetadata: BackgroundmapMetadata) => {
  return {
    Y: BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.heightPixels,
    X: BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.widthPixels
  };
};

/*
 * Given a CellXY, finds the borders of the cell in each dimension furthest from the origin.
 *
 * The origin is at the bottom-left of the image, so this function returns:
 * The X coordinate of the right-most column of pixels of the right border of the cell.
 * The Y coordinate of the top-most row of pixels of the top border of the cell.
 *
 * These are returned as `X` and `Y` properties of the object returned by this function.
 */
const findFarCoordinatesOfCell = (cellXY: CellXY, backgroundmapMetadata: RasterBackgroundmapMetadata) => {
  return {
    X: (
      (backgroundmapMetadata.originCellRightBorderX) +
      (cellXY.x * backgroundmapMetadata.cellSideLength) +
      (cellXY.x * backgroundmapMetadata.borderWidth)
    ),
    Y: (
      (backgroundmapMetadata.originCellTopBorderY) +
      (cellXY.y * backgroundmapMetadata.cellSideLength) +
      (cellXY.y * backgroundmapMetadata.borderWidth)
    )
  };
};

/*
 * Returns an array of square polygons describing the position of each cell in backgroundmap raster space.
 * Each "square polygon" returned is a two-dimensional array of coordinates (`[Y, X]`) wound clockwise in which the first coordinate is NOT repeated at the end.
 */
const rasterCoordsForCell = (cell: CellXY, backgroundmapMetadata: RasterBackgroundmapMetadata) => {
  // TODO: Figure out why using the full border on all sides tiles without overlap, and add a comment.
  var farCoords = findFarCoordinatesOfCell(cell, backgroundmapMetadata);
  var { borderWidth, cellSideLength } = backgroundmapMetadata;
  var cellRight  = farCoords.X + borderWidth,
    cellTop      = farCoords.Y + borderWidth,
    cellLeft     = cellRight   - cellSideLength - borderWidth,
    cellBottom   = cellTop     - cellSideLength - borderWidth;

  return [
    [cellTop,    cellLeft ],
    [cellTop,    cellRight],
    [cellBottom, cellRight],
    [cellBottom, cellLeft ]
  ];
};

const leafletCoordsForCell = (cell: CellXY, backgroundmapMetadata: RasterBackgroundmapMetadata) => {
  var rasterCoords = rasterCoordsForCell(cell, backgroundmapMetadata);
  var ratios = getLeafletRasterRatios(backgroundmapMetadata);
  return rasterCoords.map((rasterCoord) => {
    return [
      (rasterCoord[0] * (ratios.Y)),
      (rasterCoord[1] * (ratios.X)),
    ];
  });
};

export default function blobBoundaryFromCells(cells: Array[CellXY], backgroundmapMetadata: RasterBackgroundMetadata) {
  if(cells.length === 1) return leafletCoordsForCell(cells[0], backgroundmapMetadata);
  return cells.map((cell) => {
    return leafletCoordsForCell(cell, backgroundmapMetadata);
  }).reduce((blob, cellCoords) => {
    // Turf.js expects geoJSON
    return union(blob, {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [cellCoords]
      }
    });
  }, {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": []
    }
  }).geometry.coordinates;
};
