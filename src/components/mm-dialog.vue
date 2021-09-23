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
        var slotContainerId = `slot-div-${v4()}`;
        var dialog = new L.Control.Dialog({}).setContent(`
          <div class="leaflet-control-dialog-contents-spacer"></div>
          <div id="${dialogDivId}">test</div>
        `); 
        return {
          dialog,
          dialogDivId,
          slotContainerId
        };
      })()
    },
    created() {
      this.l().mapInitialization.then(() => {
        this.dialog.addTo(this.l().map)
        this.dialog.showClose();
        this.dialog.unfreeze();
        // See https://github.com/NBTSolutions/Leaflet.Dialog/issues/26
        this.dialog._closeNode.innerHTML = "X";
        //this.dialog._resize.innerHTML = "X";
        //this.dialog._drag.innerHTML = "X";
        this.l().map.on('dialog:closed', (dialogClosed) => {
          if(dialogClosed._leafletId === this.dialog._leafletId && this.isOpen) {
           this.autoIsOpen = false;
          }
        });
        this.l().map.on('dialog:opened', (dialogOpened) => {
          if(dialogOpened._leafletId === this.dialog._leafletId && !this.isOpen) {
           this.autoIsOpen = true;
          }
        });
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
      },
      slotContainerId() {
        return this.$options.unreactive.slotContainerId;
      },
    },
    watch: {
      isOpen: {
        immediate: true,
        handler(newVal) {
          this.l().mapInitialization.then(() => {
            if(newVal) {
              this.dialog.open();
            } else {
              this.dialog.close();
            }
          });
        }
      }
    },
    render() {
      this.l().mapInitialization.then(() => {
        var dialogDiv = document.getElementById(this.dialogDivId);
        dialogDiv.innerHTML = "";
        dialogDiv.appendChild(renderVNodes(this.$slots.default()));
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
    beforeDestroy() {
      this.dialog.destroy();
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
