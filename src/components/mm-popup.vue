<!-- 
  Named after Leaflet's `L.popup`. For what colloquially would be called a "popup", see `mm-dialog.vue`
-->
<script>
  import { defineComponent, h, inject, toRefs, watch } from 'vue'

  import BACKGROUNDMAP_BOUND_LENGTH from '/src/constants/backgroundmap-bound-length.ts'

  import renderVNodes from '/src/utils/render-vnodes.ts'

  import CellXY from '/src/types/cell-x-y.ts'
  
  export default defineComponent({
    props: {
      // TODO: Use a more precise type for `position` once one exists.
      position: {
        type: CellXY,
        required: true
      },
      isVisible: {
        type: Boolean,
        required: true
      }
    },
    setup(props, context) {
      const { isVisible, position } = toRefs(props);
      const mapInitPromise = inject('l')().mapInit;
      const backgroundmapMetadata = inject('backgroundmapMetadata');
      const popup = L.popup({
        closeButton: false,
        closeOnClick: false,
        autoClose: false,
        closeOnEscapeKey: false
      }).setContent("");

      const isVisibleUpdate = (newVal) => {
        mapInitPromise.then((map) => {
          // `popup.closePopup` doesn't seem to work here, and `map.closePopup` closes ALL popups, so 
          // we instead add and remove the popup entirely.
          if(newVal) {
            popup.openOn(map);
          } else {
            popup.removeFrom(map);
          }
        });
      };
      const positionUpdate = (newVal) => {
        // The popup is placed over the top-center of the cell.
        const leafletRatioX = BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.widthPixels;
        const leafletRatioY = BACKGROUNDMAP_BOUND_LENGTH/backgroundmapMetadata.heightPixels;
        // We start at the rightmost border of the origin, so this moves us "backwards" by half of a cell.
        const offsetX = newVal.x - 0.5;
        popup.setLatLng([
          (
            (backgroundmapMetadata.originCellTopBorderY) +
            (newVal.y * backgroundmapMetadata.cellSideLength) +
            (newVal.y * backgroundmapMetadata.borderWidth)
          ) * leafletRatioY,
          (
            (backgroundmapMetadata.originCellRightBorderX) +
            (offsetX * backgroundmapMetadata.cellSideLength) +
            (offsetX * backgroundmapMetadata.borderWidth)
          ) * leafletRatioX
        ]);
      };
      positionUpdate(position.value);
      isVisibleUpdate(isVisible.value);
      watch(position, positionUpdate);
      watch(isVisible, isVisibleUpdate);

      const slots = context.slots;
      return () => {
        if(!slots.hasOwnProperty('default')) return null;
        mapInitPromise.then((map) => {
          popup.setContent(renderVNodes(slots.default()));
        });
        /* To get reactivity in the popup, we need to return the slot content from the
         * render function even if we don't want the element in the default slot to be 
         * rendered inside of the actual `mm-map` element hierarchy. To get around this, 
         * we return the slots, but we hide them from the user.
         */
        return h(
          'div', {
            style: "display: none;"
          },
          slots.default()
        );
      };
    }
  })
</script>
