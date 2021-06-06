<!--
  This component represents the Leaflet map ("map" in the sense of `L.Map`) that presents Tamriel to the user.
  It is responsible for managing the lifecycle of the `L.Map` it represents, but is not responsible for the lifecycles of the Leaflet objects it contains.

  It provides two essential things for descendant components:
  1. `'layerGroup'`, onto which layers can be added to be added to the map.
     An `L.LayerGroup` is used instead of the map itself because the map depends on
     having a `div` element to use, so it can't be initialized until the first render is
     complete, which caused problems.
  2. `'backgroundmapMetadata'` contains the information necessary to map from backgroundmap
     pixel space to TESIII cell space and Leaflet space. It's necessary to be able to place
     things on the backgroundmap relative to TESIII cells.
-->
<template>
  <div style="height: 1000px; background-color: #000000;">
    <slot />
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, provide } from 'vue'
  import * as L from 'leaflet';

  import BOUNDS from '/src/constants/backgroundmap-bounds.ts'

  import CellGrid from '/src/leaflet-classes/cell-grid.ts'

  import CellXY from '/src/types/cell-x-y.ts'

  import leafletEventHandlers from '/src/mixins/leaflet-event-handlers.ts'

  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  // (inclusive, inclusive)
  const range = (start, end) => {
    return (new Array(end - start + 1)).fill().map((x, i) => {
      return start+i
    });
  }

/** 
 * The objects created by Leaflet (`L.Map` and `L.LayerGroup` in particular)
 * create lag when made reactive by Vue. However, I still want individual `mm-map`
 * instances to have their own instances of these things, so a module-level variable
 * would not be suitable. To work around this, each instance of `mm-map` puts its
 * big Leaflet objects into its position in this array.
 *
 * The stored objects have this shape:
 * {
 *   map: L.Map
 *   cellsLayerGroup: L.LayerGroup
 *   blobsLayerGroup: L.LayerGroup
 * }
 */
var leafletStorage = [];

  export default defineComponent({
    props: {
      backgroundmapMetadata: {
        type: Object, // Expected to be of interface RasterBackgroundmapMetadata
        required: true
      }
    },
    setup(props) {
      var leafletStorageKey = leafletStorage.length;
      leafletStorage[leafletStorageKey] = {
        map: null,
        cellsLayerGroup: L.layerGroup([]),
        blobsLayerGroup: L.layerGroup([]),
      };
      provide('l', () => {
        return leafletStorage[leafletStorageKey];
      });
      provide('backgroundmapMetadata', props.backgroundmapMetadata);
      return {
        leafletStorageKey: leafletStorageKey
      };
    },
    methods: {
      l() {
        return leafletStorage[this.leafletStorageKey];
      },
      initializeMap(containerElement) {
        var map = new L.Map(containerElement, {
          crs: L.CRS.Simple,
          //zoomSnap: 0.25,
          minZoom: -1,
          updateWhenZooming: false,
          updateWhenIdle: true,
          preferCanvas: true
        });
        this.l().cellsLayerGroup.addTo(map);
        this.l().blobsLayerGroup.addTo(map);
        leafletStorage[this.leafletStorageKey].map = map;
        //this.addEventListenersToEvented(map); // Defined in mixins/leaflet-event-handlers.ts

        L.imageOverlay(this.backgroundmapMetadata.imageURL, BOUNDS).addTo(map);
        map.fitBounds(BOUNDS);
        return map;
      },
    },
    computed: {
      cellsForSelection() {
        return this.verticalCellRange.map((y) => {
          return this.horizontalCellRange.map((x) => {
            return new CellXY({
              x,
              y,
            });
          });
        }).flat();
      },
      /**
       * Returns the range of Y coordinates covered by the backgroundmap's `gridBounds`
       */
      verticalCellRange() {
        var originCellTopBorderY = this.backgroundmapMetadata.originCellTopBorderY;
        var cellSideLength       = this.backgroundmapMetadata.cellSideLength;
        var borderWidth          = this.backgroundmapMetadata.borderWidth;
        var imageBottom          = this.backgroundmapMetadata.gridBounds[1][0];
        var imageTop             = this.backgroundmapMetadata.gridBounds[0][0];

        // For the purpose of counting cells, this is essentially "one cell" as long as an extra border is accounted for elsewhere
        var cellSize             = cellSideLength + borderWidth;

        // To find the bottom-most cell in the range, we iterate down from the origin cell,
        // and the cell before the first cell that goes past the bottom of `gridBounds` is the bottom-most cell.
        // In all of the other ___Most_Coord variables, the same approach is taken.
        var bottomMostYCoord = (() => {
          var originBottomBorder = originCellTopBorderY - (cellSideLength + borderWidth);
          for(var y = 0; (originBottomBorder - (y*cellSize)) > imageBottom; y++);
          return y*(-1);
        })();
        var topMostYCoord = (() => {
          var originTopBorder = originCellTopBorderY;
          for(var y = 0; (originTopBorder + (y*cellSize)) < imageTop; y++);
          return y;
        })();

        return range(bottomMostYCoord, topMostYCoord);
      },
      /**
       * Returns the range of X coordinates covered by the backgroundmap's `gridBounds`
       * 
       * TODO: Deduplicate from `verticalCellRange`
       */
      horizontalCellRange() {
        var originCellRightBorderX = this.backgroundmapMetadata.originCellRightBorderX;
        var cellSideLength         = this.backgroundmapMetadata.cellSideLength;
        var borderWidth            = this.backgroundmapMetadata.borderWidth;
        var imageRight             = this.backgroundmapMetadata.gridBounds[1][1];
        var imageLeft              = this.backgroundmapMetadata.gridBounds[0][1];

        // For the purpose of counting cells, this is essentially "one cell" as long as an extra border is accounted for elsewhere
        var cellSize             = cellSideLength + borderWidth;

        var leftMostXCoord = (() => {
          var originLeftBorder = originCellRightBorderX - (cellSideLength + borderWidth);
          for(var x = 0; (originLeftBorder - (x*cellSize)) > imageLeft; x++);
          return x*(-1);
        })();
        var rightMostXCoord = (() => {
          var originRightBorder = originCellRightBorderX;
          for(var x = 0; (originRightBorder + (x*cellSize)) < imageRight; x++);
          return x;
        })();

        return range(leftMostXCoord, rightMostXCoord);
      }
    },
    watch: {
      cellsForSelection: {
        immediate: true,
        // TODO: The constructor for `L.LayerGroup` takes an array, but there's
        // no method for adding multiple layers. With that in mind, performance
        // should be compared against removing `cellDivLayerGroup` from `map` and
        // constructing a new `L.Layergroup` instead of reusing the existing one.
        handler(newVal) {
          var cellGrid = new CellGrid(gridmapMetadata);
          this.l().cellsLayerGroup.clearLayers();
          this.l().cellsLayerGroup.addLayer(cellGrid);
        }
      }
    },
    mounted() {
      this.initializeMap(this.$el);
    },
  })
</script>
