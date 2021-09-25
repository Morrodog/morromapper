<!--
  `mm-dialog` overlays a dialog box on top of the `mm-map` in which it is nested.

  Its basic interface is one prop, `isOpen`, which determines whether it's visible, and
  a default slot whose contents are (reactively) rendered in the dialog.

  A few usage notes:
  1. Only one `mm-dialog` may exist within an `mm-map`.
  2. The map underneath will not be dimmed, and will still be responsive.
  3. Do not use it with a static value for the `is-open` prop. 
     Right now, it expects to be used with v-model, and will get stuck
     closed if the user hits the "x" button in the corner

  Implementation notes:
  1. The component has an invisible dependency on Fontawesome. See https://github.com/NBTSolutions/Leaflet.Dialog/issues/26
     Fontawesome is included for the whole project in `/src/main.ts`.
  2. The dialog opens itself when it's attached. To prevent this from happening, we only attach it on the first opening.
-->
<script lang="ts">
  import 'leaflet-dialog'
  import 'leaflet-dialog/Leaflet.Dialog.css'

  import renderVNodes from '/src/utils/render-vnodes.ts'

  import { v4 } from 'uuid'

  import { defineComponent, h } from 'vue'

  export default defineComponent({
    inject: ['l'],
    unreactive: {
      ...(() => {
        var dialogDivId = `dialog-div-${v4()}`;
        var dialog = new L.Control.Dialog({}).setContent(`
          <div class="leaflet-control-dialog-contents-spacer"></div>
          <div id="${dialogDivId}"></div>
        `); 
        return {
          dialog,
          dialogDivId,
        };
      })()
    },
    data() {
      return {
        dialogAttached: false
      };
    },
    created() {
      this.l().mapInit.then((map) => {
        /*
         * Without this protection, the current behavior is for the first mm-dialog to be replaced. 
         * In the future, support for multiple concurrently existing `mm-dialog`s may be added.
         *
         * Note that the `containsDialog` field will not exist for the first (and/or only) `mm-dialog`
         * added to an `mm-map`, but it will be `false` if an `mm-dialog` was removed from a map,
         * and another one added.
         */
        if(!!map.containsDialog) {
          throw new Error("Only one `mm-dialog` may exist inside of an `mm-map` at the same time.");
        } else {
          map.containsDialog = true;
        }
      });
    },
    props: {
      /**
       * Whether the dialog and its contents are currently visible to the user.
       * Intended to be used as a `v-model` prop by the parent.
       */
      isOpen: {
        type: Boolean,
        required: true
      }
    },
    computed: {
      autoIsOpen: {
        get() {
          return this.isOpen;
        },
        set(newVal) {
          this.$emit('update:isOpen', newVal);
        }
      },
      dialog() {
        return this.$options.unreactive.dialog;
      },
      dialogDivId() {
        return this.$options.unreactive.dialogDivId;
      }
    },
    watch: {
      isOpen: {
        immediate: true,
        handler(newVal) {
          this.l().mapInit.then((map) => {
            if(newVal) {
              if(this.dialogAttached) {
                this.dialog.open();
              } else {
                // The dialog opens itself once attached.
                this.attachDialog(map);
              }
            } else {
              this.dialog.close();
            }
          });
        }
      }
    },
    render() {
      this.l().mapInit.then(() => {
        if(this.dialogAttached) {
          var dialogDiv = document.getElementById(this.dialogDivId);
          dialogDiv.innerHTML = "";
          dialogDiv.appendChild(renderVNodes(this.$slots.default()));
        }
      });
      /* To get reactivity in the dialog, we need to return the slot content from the
       * render function even if we don't want the element in the default slot to be 
       * rendered inside of the actual `mm-map` element hierarchy. To get around this, 
       * we return the slots, but we hide them from the user.
       */
      return h(
        'div', {
          style: "display: none;"
        },
        this.$slots.default()
      );
    },
    methods: {
      // Note: dialog-related event listeners registered before the dialog is added do not work.
      attachDialog(map) {
        this.dialog.addTo(map)
        this.dialog.showClose();
        this.dialog.unfreeze();
        map.on('dialog:closed', (dialogClosed) => {
          if(dialogClosed._leafletId === this.dialog._leafletId && this.isOpen) {
            this.autoIsOpen = false;
          }
        });
        map.on('dialog:opened', (dialogOpened) => {
          if(dialogOpened._leafletId === this.dialog._leafletId && !this.isOpen) {
            this.autoIsOpen = true;
          }
        });
        this.dialogAttached = true;
      }
    },
    beforeDestroy() {
      this.dialog.destroy();
      this.l().mapInit.then((map) => {
        map.containsDialog = false;
      });
    }
  })
</script>
<style>
  /*
   * I want a little border below the X that closes the dialog.
   */
  .leaflet-control-dialog-contents {
    border-top: 1px solid #eeeeee;
  }

  /*
   * This is to make it so that there's a little space between the border and the contents of the dialog
   */
  .leaflet-control-dialog-contents-spacer {
    height: 5px;
  }
</style>
