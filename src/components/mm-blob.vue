<!--
  An `mm-blob` is a component to be placed on an `mm-map` in order to display a set of cells using
  one Leaflet polygon. This is preferable to individually rendering the polygons for performance
  reasons, though a limitation of blobbing is that blobs must all be of the same color,
  and will share a border.

  It is, however, possible to give a blob's constituent cells individual treatment using the
  'mouseover' event, which will emit the `CellXY` that the user's mouse currently occupies.
-->
<script lang="ts">
  import CellXY from '/src/types/cell-x-y.ts'
  
  import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

  import { defineComponent, h } from 'vue'
  import union                  from '@turf/union'

  import leafletEventHandlers from '/src/mixins/leaflet-event-handlers.ts'

  var leafletStorage = [];

  export default defineComponent({
    inject: ['l', 'backgroundmapMetadata'],
    /*mixins: [
      leafletEventHandlers
    ],*/
    created() {
      leafletStorage[this.leafletStorageKey].addTo(this.l().blobsLayerGroup);
    },
    beforeUnmount() {
      this.l().blobsLayerGroup.removeLayer(leafletStorage[this.leafletStorageKey]);
    },
    props: {
      /**
       * Expects an array of `CellXY`s.
       */
      cells: {
        type: Array,
        required: true
      },
      /**
       * Accepts any CSS color
       */
      color: {
        type: String,
        required: true
      },
      hasBorder: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data() {
      var leafletStorageKey = leafletStorage.length;
      leafletStorage.push(L.polygon([]));
      return {
        leafletStorageKey
      }
    },
    computed: {
      leafletRasterRatioY() {
        return BACKGROUNDMAP_BOUND_LENGTH/this.backgroundmapMetadata.heightPixels;
      },
      leafletRasterRatioX() {
        return BACKGROUNDMAP_BOUND_LENGTH/this.backgroundmapMetadata.widthPixels;
      },
      /*
       * Returns an array of square polygons describing the position of each cell in backgroundmap raster space.
       * Each "square polygon" returned is a two-dimensional array of coordinates (`[Y, X]`) wound clockwise in which the first coordinate is NOT repeated at the end.
       * 
       * IMPORTANTLY: Each square includes the top and right border of the cell from which it was produced,
       * and excludes the bottom and left borders of the cell. This is done so that there won't be any gaps between adjacent cells or blobs.
       * The choice to use the top and right of the cell for this is arbitrary.
       *
       * One way to think about the math for this is that each cell "takes" the border from its top neighbor, "takes" another border from its rightward neighbor, 
       * and "gives" a border to its bottom and left neighbors, thus taking two borders, and giving two other borders.
       */
      cellsRasterCoordinates() {
        return this.cells.map((cell) => {
          // These "interior" coordinates describe the bounds of a square just inside of, and not including, the borders of the cell.
          var interiorRight  = this.findFarCoordinateOfCell(cell.x, this.backgroundmapMetadata.originCellRightBorderX);
          var interiorTop    = this.findFarCoordinateOfCell(cell.y, this.backgroundmapMetadata.originCellTopBorderY);
          var interiorLeft   = interiorRight - this.backgroundmapMetadata.cellSideLength; //Note that borderWidth is NOT subtracted here
          var interiorBottom = interiorTop   - this.backgroundmapMetadata.cellSideLength; //Note that borderWidth is NOT subtracted here

          // These "exterior" coordinates describe the bounds of a square that extends to include the border.
          // Only two bounds are defined here (right and top) in accordance to the description of the method.
          var exteriorRight = interiorRight + this.backgroundmapMetadata.borderWidth;
          var exteriorTop   = interiorTop   + this.backgroundmapMetadata.borderWidth;

          return [
            [exteriorTop,    interiorLeft ],
            [exteriorTop,    exteriorRight],
            [interiorBottom, exteriorRight],
            [interiorBottom, interiorLeft ],
          ];
        })
      },
      /*
       * Using the raster coordinates from `this.cellsRasterCoordinates`, this
       * computes the box of Leaflet coordinates for each cell for use with `@turfjs/union`.
      */
      cellsLeafletCoordinates() {
        return this.cellsRasterCoordinates.map((rasterSquare) => {
          /*
           * This math is based on the assumption that the origin of
           * Leaflet space is at the bottom-left pixel of the image.
           * 
           * This assumption should be upheld by `mm-map`.
           */
          return rasterSquare.map((rasterCoord) => {
            return [
              (rasterCoord[0] * this.leafletRasterRatioY),
              (rasterCoord[1] * this.leafletRasterRatioX),
            ];
          });
        });
      },
      /**
       * Computes the outer boundary of the blob for use as the Leaflet polygon.
       * The strategy is currently to use Turf.js's union tool
       * ( https://turfjs.org/docs/#union ) to add each polygon to the blob.
       * 
       * I believe that this algorithm is much less efficient than is possible (in part because we can make assumptions that `union` cannot),
       * but the mathematical challenge of reasoning about holes and near-holes is great enough that delegating to a library
       * is reasonable unless this becomes a performance bottleneck.
       * (It is unlike that this becomes a bottleneck, since this is calculated just once per blob in most cases).
       * 
       * The way I (Josh) originally approached this was to compute an array of "cell corners", which were made of a
       * `CellXY`, and than "top"/"bottom" or "left"/"right" in two other fields. I had three difficulties with this approach:
       * 1. Concave corners were difficult to identify
       * 2. Holes were difficult to identify
       * 3. "Near-holes" (places where the blob makes contact with itself such that an apparent hole is created, but no hole actually exists)
       *    made it really difficult to correctly remove duplicate `cell-corners` 
       * 
       * Example of a near-hole: ("XX" indicating that a cell is full)
       * +--+--+--+
       * |XX|XX|XX|
       * +--+--+--+
       * |XX|  |XX|
       * +--+--0--+
       * |XX|XX|  
       * +--+--+
       * 
       * In this diagram, the coordinate at "0" really does need to be included twice to represent
       * this sort of crab-claw shape accurately.
       */
      blobBoundary() {
        if(this.cells.length === 1) return this.cellsLeafletCoordinates;
        return this.cellsLeafletCoordinates.reduce((blob, cellCoords) => {
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
      }
    },
    watch: {
      blobBoundary: {
        immediate: true,
        handler(newVal) {
          leafletStorage[this.leafletStorageKey].setLatLngs(newVal);
        }
      },
      color: {
        immediate: true,
        handler(newVal) {
          leafletStorage[this.leafletStorageKey].setStyle({
            color: newVal
          });
        }
      },
      hasBorder: {
        immediate: true,
        handler(newVal) {
          leafletStorage[this.leafletStorageKey].setStyle({
            stroke: newVal
          });
        }
      }
    },
    methods: {
      /**
       * Creates a CellXY containing the given `L.Latlng`.
       */
      cellFromLeafletPoint(latlng) {
            var cellSize = this.backgroundmapMetadata.borderWidth + this.backgroundmapMetadata.cellSideLength;
            var leafletY = latlng.lat;
            var leafletX = latlng.lng;
            var rasterY = leafletY/this.leafletRasterRatioY
            var rasterX = leafletX/this.leafletRasterRatioX
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
      /*
       * TODO: Figure out a better name for this.
       * 
       * Given a cell coordinate (just an X or a Y), finds the border of that cell that is
       * furthest away in the dimension of the given coordinate to the origin of raster space at the bottom-left of the image.
       * (For example, it would give the coordinate of the top of a cell border because the origin is at the bottom of the image.)
       * 
       * Note that the returned number is the position of the rightmost or topmost pixel row/column of the border itself;
       * not the square enclosed by it.
       * 
       * @param farOriginBorder gives the topmost or rightmost coordinate of the origin cell.
       *   Should be the topmost for the Y dimension, and rightmost for the X dimension.
       */
      findFarCoordinateOfCell(coordinate: number, farOriginBorder: number) {
        return (
          (farOriginBorder) +
          (coordinate * this.backgroundmapMetadata.cellSideLength) +
          (coordinate * this.backgroundmapMetadata.borderWidth)
        );
      },
    },
    render() {
      return null;
    }
  })
</script>
