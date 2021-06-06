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
  import { defineComponent, reactive, provide, ref } from 'vue'
  import * as L from 'leaflet';

  import BOUNDS from '/src/constants/backgroundmap-bounds.ts'

  import CellGrid from '/src/leaflet-classes/cell-grid.ts'

  import CellXY from '/src/types/cell-x-y.ts'

  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

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
    emits: {
      cellhover(e) {
        return e instanceof CellXY;
      }
    },
    props: {
      backgroundmapMetadata: {
        type: Object, // Expected to be of interface RasterBackgroundmapMetadata
        required: true
      }
    },
    setup(props) {
      var leafletStorageKey = ref(leafletStorage.length);
      leafletStorage[leafletStorageKey.value] = {
        map: null,
        cellsLayerGroup: L.layerGroup([]),
        blobsLayerGroup: L.layerGroup([]),
      };
      provide('l', () => {
        return leafletStorage[leafletStorageKey.value];
      });
      provide('backgroundmapMetadata', props.backgroundmapMetadata);
      return {
        leafletStorageKey: leafletStorageKey,
        hoverCell: ref({})
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
    watch: {
      backgroundmapMetadata: {
        immediate: true,
        // TODO: The constructor for `L.LayerGroup` takes an array, but there's
        // no method for adding multiple layers. With that in mind, performance
        // should be compared against removing `cellDivLayerGroup` from `map` and
        // constructing a new `L.Layergroup` instead of reusing the existing one.
        handler(newVal) {
          var cellGrid = new CellGrid(newVal);
          cellGrid.on('cellhover', (e) => {
            this.hoverCell = e.cell;
            this.$emit('cellhover', this.hoverCell);
          });
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
