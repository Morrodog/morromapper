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
      },
      tooltipVisible: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    setup(props, context) {
      // Required Props
      const { cells, color } = toRefs(props);
      // Optional Props
      const tooltipVisible = toRef(props, 'tooltipVisible');
      const hasBorder      = toRef(props, 'hasBorder');
      // Injections
      const l = inject('l');
      const backgroundmapMetadata = inject('backgroundmapMetadata');
      // Instance-scoped unreactive properties
      const tooltipDivId = `dialog-div-${v4()}`;
      const tooltip = L.tooltip({
        content: `<div id="${tooltipDivId}"></div>`,
        sticky: true,
        permanent: true
      });
      const polygon = L.polygon([], {
        // Other style properties are determined after initialization by `mm-blob` component props.
        "fillOpacity": 1.00,
        "opacity": 1.00
      });

      // Lifecycle hooks
      onBeforeUnmount(() => {
        //l().blobsLayerGroup.removeLayer(polygon);
      });

      // Computations
      var blobBoundary = computed(() => {
        return blobBoundaryFromCells(cells.value, backgroundmapMetadata);
      });

      // Watchers
      var updateBlobBoundary = (newVal) => {
        polygon.setLatLngs(newVal);
      };
      var updateColor = (newVal) => {
        polygon.setStyle({
          fillColor: newVal,
          color: newVal.slice(0, 7)// Remove opacity for border
        });
      };
      var updateHasBorder = (newVal) => {
        polygon.setStyle({
          stroke: newVal
        });
      };
      var updateTooltipVisible = (newVal) => {
        if(newVal) {
          console.log("Attempting to show tooltip");
          polygon.openTooltip(tooltip);
        } else {
          polygon.closeTooltip(tooltip);
        }
      };
      watch(tooltipVisible, updateTooltipVisible);
      watch(blobBoundary,   updateBlobBoundary);
      watch(hasBorder,      updateHasBorder);
      watch(color,          updateColor);

      // Polygon initialization
      updateBlobBoundary(blobBoundary.value);
      updateColor(color.value);
      updateHasBorder(hasBorder.value);
      polygon.addTo(l().blobsLayerGroup);

      // Render tooltip
      const slots = context.slots;
      return () => {
        // The use of the render function for this component is only 
        // to put tooltip contents into the component hierarchy so that they'll be reactive.
        if(!slots.hasOwnProperty('tooltip')) return null;
        // TODO? Ensure that tooltip div exists
        l().mapInitialization.then(() => {
          tooltip.setContent(renderVNodes(slots.tooltip()));
          //var tooltipDiv = document.getElementById(tooltipDivId);
          //tooltipDiv.innerHTML = "";
          //tooltipDiv.appendChild(renderVNodes(slots.tooltip()));
        });
        /* To get reactivity in the tooltip, we need to return the slot content from the
         * render function even if we don't want the element in the default slot to be 
         * rendered inside of the actual `mm-map` element hierarchy. To get around this, 
         * we return the slots, but we hide them from the user.
         */
        return h(
          'div', {
            style: "display: none;"
          },
          slots.tooltip()
        );
      };
    }
    /*render() {

      // TODO? Ensure that tooltip div exists
      this.l().mapInitialization.then(() => {
        var tooltipDiv = document.getElementById(this.tooltipDivId);
        tooltipDiv.innerHTML = "";
        tooltipDiv.appendChild(renderVNodes(this.$slots.tooltip()));
      });
      /* To get reactivity in the dialog, we need to return the slot content from the
       * render function even if we don't want the element in the default slot to be 
       * rendered inside of the actual `mm-map` element hierarchy. To get around this, 
       * we return the slots, but we hide them from the user.
       *
      return h(
        'div', {
          style: "display: none;"
        },
        this.$slots.tooltip()
      );
    }*/
  })
</script>
