<!--
  This component represents the Leaflet map ("map" in the sense of `L.Map`) that presents Tamriel to the user.
  It is responsible for managing the lifecycle of the `L.Map` it represents, but is not responsible for the lifecycles of Leaflet objects added to it.

  It `provide`s two essential things for descendant components:
  1. `'l'` is a function that returns an object containing the Leaflet objects pertinent to the `mm-map` instance.
     For details, see the declaration of `leafletStorage`.
  2. `'backgroundmapMetadata'` contains the information necessary to map from backgroundmap
     pixel space to TESIII cell space and Leaflet space. It's necessary to be able to place
     things on the backgroundmap relative to TESIII cells.
-->
<template>
  <div style="height: 750px; width: 750px; background-color: #000000;">
    <slot />
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, provide, ref } from 'vue'
  import * as L from 'leaflet';
  import leafletFullscreenInit from 'leaflet.fullscreen'
  import 'leaflet.fullscreen/Control.FullScreen.css'

  import BOUNDS from '/src/constants/backgroundmap-bounds.ts'

  import CellGrid from '/src/leaflet-classes/cell-grid.ts'

  import CellXY from '/src/types/cell-x-y.ts'

  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  leafletFullscreenInit(L);

  /** 
   * The objects created by Leaflet (`L.Map` and `L.LayerGroup` in particular)
   * create lag when made reactive by Vue. However, I still want individual `mm-map`
   * instances to have their own instances of these things, so a module-level variable
   * would not be suitable.
   *
   * To work around this, two approaches are taken:
   * 1. Layers are initialized synchronously, so layers can be made available to child components, and added when the map is ready.
   * 2. Components that can't do this can instead use a Promise that resolves when the map is initialized.
   *
   * The stored objects have this shape:
   * {
   *   map: L.Map
   *   cellsLayerGroup: L.LayerGroup
   *   blobsLayerGroup: L.LayerGroup
   *   mapInitialization
   * }
   */
  var leafletStorage = [];

  export default defineComponent({
    emits: {
      cellhover(e) {
        return e instanceof CellXY;
      },
      click(e) {
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
        /*
         * To implement a `mapInitialization` property as a promise, we need to synchronously declare a Promise here,
         * and still have the `resolve` function available on and in `mounted`. To accomplish this,
         * a private property is added to the provided object containing the `resolve` function created
         * for the `mapInitialization` `Promise`. This property are not intended for use outside of `mm-map`.
        */
        ...(() => {
          var resolveInit = null;
          var mapInit = new Promise((resolve, reject) => {
            resolveInit = resolve;
          });
          return {
            mapInitialization: mapInit,
            _mapInitializationResolve: resolveInit,
          };
        })()
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
          //Fractional zoomSnap works well in Chrome, but the cells fall out of alignment in Safari
          //zoomSnap: 0.25,
          minZoom: -1,
          updateWhenZooming: false,
          updateWhenIdle: true,
          preferCanvas: true
        });

        L.control.fullscreen({}).addTo(map);

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
          this.l().cellsLayerGroup.clearLayers();
          var cellGrid = new CellGrid(newVal);
          cellGrid.clearAllEventListeners();
          cellGrid.on('cellhover', (e) => {
            this.hoverCell = e.cell;
            this.$emit('cellhover', this.hoverCell);
          });
          cellGrid.on('click', (e) => {
            this.hoverCell = e.cell;
            this.$emit('click', this.hoverCell);
          });
          this.l().cellsLayerGroup.addLayer(cellGrid);
        }
      }
    },
    mounted() {
      this.initializeMap(this.$el);
      this.l()._mapInitializationResolve();
    },
  })
</script>
