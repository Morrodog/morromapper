<!--
  This represents a cell in the TESIII engine.

  `mm-cell` is responsible for determining the Leaflet coordinates for a given `CellXY`

  TODO: Proper typechecking for coordinate and backgroundmapMetadata
-->
<script lang="ts">
  import { defineComponent, h } from 'vue'

  import CellXY from '/src/types/cell-x-y.ts'

  import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts' 

  export default defineComponent({
    inject: ['layerGroup'],
    created() {
      this.polygon.addTo(this.layerGroup);
    },
    beforeUnmount() {
      this.layerGroup.removeLayer(this.polygon);
    },
    props: {
      backgroundmapMetadata: {
        type: Object, // Intended to match interface RasterBackgroundmapMetadata
        required: true
      },
      cell: {
        type: CellXY,
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
      return {
        polygon: (() => {
          var testFeature = L.polygon([]);
          testFeature.on('mouseover', () => {
            this.$emit('mouseover', null);
          });
          testFeature.on('mouseout', () => {
            this.$emit('mouseout', null);
          });
          testFeature.on('click', () => {
            this.$emit('click', null);
          });
          return testFeature;
        })()
      }
    },
    computed: {
      /*
       * Using the cell coordinate provided by the component instance, this calculates the coordinates in raster space of the square that will be shown on the Leaflet map to represent that cell. 
       * IMPORTANTLY: The coordinate include the top and right border of the cell, and exclude the bottom and left borders of the cell. This is done so that there won't be any gaps between adjacent cells.
       * The choice to use the top and right of the cell for this is arbitrary.
       *
       * One way to think about the math for this is that each cell "takes" the border from its top neighbor, "takes" another border from its rightward neighbor, 
       * and "gives" a border to its bottom and left neighbors, thus taking two borders, and giving two other borders.
       * 
       * Returns a two-dimensional array of coordinates (`[Y, X]`) wound clockwise in which the first coordinate is NOT repeated at the end.
       */
      cellRasterCoordinates() {
        // These "interior" coordinates describe the bounds of a square just inside of, and not including, the borders of the cell.
        var interiorRight  = this.findFarCoordinateOfCell(this.cell.x, this.backgroundmapMetadata.originCellRightBorderX);
        var interiorTop    = this.findFarCoordinateOfCell(this.cell.y, this.backgroundmapMetadata.originCellTopBorderY);
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
      },
      /*
       * Using the raster coordinates from `this.cellRasterCoordinates`, this
       * computes the box of Leaflet coordinates to put in an `L.polygon` and add to the map.
      */
      cellLeafletCoordinates() {
        /*
         * This math is based on two assumptions:
         * 1. The origin of Leaflet space is at the bottom-left pixel of the image.
         * 2. The dimensions of Leaflet space are 1000x1000.
         * 
         * TODO: De-magic 1000
         */
        var ratioY = 1000/this.backgroundmapMetadata.heightPixels;
        var ratioX = 1000/this.backgroundmapMetadata.widthPixels;
        return this.cellRasterCoordinates.map((rasterCoord) => {
          return [
            (rasterCoord[0] * ratioY),
            (rasterCoord[1] * ratioX),
          ];
        });
      }
    },
    watch: {
      cellLeafletCoordinates: {
        immediate: true,
        handler(newVal) {
          this.polygon.setLatLngs(newVal);
        }
      },
      color: {
        immediate: true,
        handler(newVal) {
          this.polygon.setStyle({
            color: newVal
          });
        }
      },
      hasBorder: {
        immediate: true,
        handler(newVal) {
          this.polygon.setStyle({
            stroke: newVal
          });
        }
      }
    },
    methods: {
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
