<!--
  An `mm-blob` is a component to be placed on an `mm-map` in order to display a set of cells using
  one Leaflet polygon. This is preferable to individually rendering the polygons for performance
  reasons, though a limitation of blobbing is that blobs must all be of the same color,
  and will share a border.

  It is, however, possible to give a blob's constituent cells individual treatment using the
  'mouseover' event, which will emit the `CellXY` that the user's mouse currently occupies.
-->
<script lang="ts">
  import { defineComponent, h, toRefs, toRef, inject, watch, computed, onBeforeUnmount } from 'vue'
  import * as L                 from 'leaflet';

  import CellXY from '/src/types/cell-x-y.ts'
  
  import blobBoundaryFromCells from '/src/utils/blob-boundary-from-cells.ts'
  import renderVNodes          from '/src/utils/render-vnodes.ts'

  import { v4 } from 'uuid'

  export default defineComponent({
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
    setup(props, context) {
      // Required Props
      const { cells, color } = toRefs(props);
      // Optional Props
      const hasBorder = toRef(props, 'hasBorder');
      // Injections
      const l = inject('l');
      const backgroundmapMetadata = inject('backgroundmapMetadata');
      // Instance-scoped unreactive properties
      const polygon = L.polygon([], {
        // Other style properties are determined after initialization by `mm-blob` component props.
        "fillOpacity": 1.00,
        "opacity": 1.00
      });

      // Lifecycle hooks
      onBeforeUnmount(() => {
        l().mapInit.then((map) => {
        map.removeLayer(polygon);
        });
      });

      // Computations
      var blobBoundary = computed(() => {
        return blobBoundaryFromCells(cells.value, backgroundmapMetadata);
      });

      // Watchers
      var blobBoundaryUpdate = (newVal) => {
        polygon.setLatLngs(newVal);
      };
      var colorUpdate = (newVal) => {
        polygon.setStyle({
          fillColor: newVal,
          color: newVal.slice(0, 7)// Remove opacity for border
        });
      };
      var hasBorderUpdate = (newVal) => {
        polygon.setStyle({
          stroke: newVal
        });
      };
      watch(blobBoundary,   blobBoundaryUpdate);
      watch(hasBorder,      hasBorderUpdate);
      watch(color,          colorUpdate);

      // Polygon initialization
      blobBoundaryUpdate(blobBoundary.value);
      colorUpdate(color.value);
      hasBorderUpdate(hasBorder.value);
      l().mapInit.then((map) => {
        polygon.addTo(map);
      })

      // Render tooltip
      const slots = context.slots;
      return () => {
        return null;
      };
    }
  })
</script>
