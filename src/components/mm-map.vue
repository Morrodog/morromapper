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

  import leafletEventHandlers from '/src/mixins/leaflet-event-handlers.ts'

  export default defineComponent({
    mixins: [
      leafletEventHandlers
    ],
    provide() {
      return {
        layerGroup: this.layerGroup,
        backgroundmapMetadata: this.backgroundmapMetadata
      };
    },
    props: {
      backgroundmapMetadata: {
        type: Object, // Expected to be of interface RasterBackgroundmapMetadata
        required: true
      }
    },
    data() {
      return {
        layerGroup: L.layerGroup([]),
        map: null
      };
    },
    methods: {
      createMap(containerElement) {
        var map = new L.Map(containerElement, {
          crs: L.CRS.Simple,
          minZoom: -1,
          //updateWhenZooming: false,
          //updateWhenIdle: true,
          preferCanvas: true
        });
        this.layerGroup.addTo(map);
        this.addEventListenersToEvented(map); // Defined in mixins/leaflet-event-handlers.ts

        L.imageOverlay(this.backgroundmapMetadata.imageURL, BOUNDS).addTo(map);
        map.fitBounds(BOUNDS);
        return map;
      },
    },
    mounted() {
      this.map = this.createMap(this.$el);
    },
  })
</script>
