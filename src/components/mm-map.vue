<!--
  This component represents the Leaflet map ("map" in the sense of `L.map`) that presents Tamriel to the user.
  It is responsible for managing the lifecycle of the `L.map` it represents, but is not responsible for the lifecycles of the cells it contains.
  The `L.map` it manages will be made available to child components through the provide/inject system.
  Currently, the provided property is `this.mapWrapper.map`, and `'mapWrapper'` must be injected in child components.

  Why is the map object wrapped?
  ===
  The map object is wrapped because the functions (e.g. `addLayer`) in the `L.map` object kept getting removed when the map object was `provide`d.
  I have not been able to get to the bottom of that, so for now, the map object will be inside of a wrapper.
  TODO: Ideally, even if the map object must be wrapped in mm-map, I'd find some way to make it possible for child components to simply `inject: ['map']` instead, and not need to deal with this.

  A note about the initialization of `this.mapWrapper.map`
  ===
  The Leaflet function that creates the `L.map` object stored in `this.mapWrapper.map` requires an HTMLElement for its container.
  Because `this.mapWrapper.map` must be added to the instance before the first render (in `setup()`), this means that its intended value is briefly inaccessible before the first `mounted()` call.
  The value given to `this.mapWrapper.map` before the first `mounted()` call is currently `{}`.

-->
<template>
  <div style="height: 1000px; background-color: #000000;">
    <slot />
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, provide } from 'vue'
  import * as L from 'leaflet';

  import TRMap from '/src/assets/gridmap.png'

  import BOUNDS from '/src/constants/backgroundmap-bounds.ts'

  export default defineComponent({
    provide() {
      return {
        layerGroup: this.layerGroup
      };
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
          updateWhenZooming: false,
          updateWhenIdle: true,
          preferCanvas: true
        });
        this.layerGroup.addTo(map);

        L.imageOverlay(TRMap, BOUNDS).addTo(map);
        map.fitBounds(BOUNDS);
        return map;
      }
    },
    mounted() {
      this.map = this.createMap(this.$el);
    },
  })
</script>
