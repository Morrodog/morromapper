<!-- 
  Named after Leaflet's `L.popup`. For what colloquially would be called a "popup", see `mm-dialog.vue`
-->
<script>
  import { defineComponent, h, inject, toRefs, watch } from 'vue'

  import renderVNodes from '/src/utils/render-vnodes.ts'

  import CellXY from '/src/types/cell-x-y.ts'
  
  export default defineComponent({
    props: {
      // TODO: Use a more precise type for `position` once one exists.
      position: {
        type: CellXY,
        required: true
      },
      /*
       * Should be used with v-model
       */
      isVisible: {
        type: Boolean,
        required: true
      }
    },
    setup(props, context) {
      const { isVisible, position } = toRefs(props);
      const mapInitPromise = inject('l')().mapInit;
      const popup = L.popup({
        closeButton: false
      }).setContent("");
      var popupAttached = false;

      const isVisibleUpdate = (newVal) => {
        mapInitPromise.then((map) => {
          if(newVal) {
            if(!popupAttached) {
              popup.openOn(map);
            } else {
              popup.openPopup();
            }
          } else {
            if(popupAttached) popup.closePopup();
          }
        });
      };
      const positionUpdate = (newVal) => {
        popup.setLatLng([10, 10]);
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
