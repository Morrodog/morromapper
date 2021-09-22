<!--
  Two cannot exist concurrently
-->
<script lang="ts">
  /*
   * A few notes on `'leaflet-modal'`:
   * 1. As a side effect of importation, it modifies the `L.Map` instance to add modal functionality to the map itself.
   * 2. Because `'leaflet-modal'` adds modal functionality directly to the `L.Map`,
   *    it isn't possible for `mm-dialog` instances to have their own objects to manage.
   * 3. It takes an HTML string for content, so to make a proper Vue slot, a workaround must be done.
   * 4. As another side-effect, it adds a variable named `map` to the global scope containing the current `L.Map`.
   * 5. Modifying the `L` shared by all of the Leaflet components in this component is a bit dirty, but
   *    I believe that it is the lesser of two evils between dirtying `L` outside of `mm-map`, and
   *    mixing concerns inside of `mm-map.vue` itself.
  */
  import 'leaflet-modal'
  /*
   * The workaround for the fact that `leaflet-modal` only takes a string for the modal's contents
   * is to have an empty div as the modal's string, and to use an ID on that div to replace its contents dynamically.
   * Because IDs are globally scoped, we have to be careful about collision, so I've used a UUID and added a string
   * to the beginning so that it doesn't fit the UUID pattern. This should virtually guarantee that no collisions will happen.
  */
  const divId = 'modal-container-ccca8adf-69ae-467f-9a07-4815bbbefe66';
  
  import { defineComponent, h } from 'vue'

  export default defineComponent({
    inject: ['l'],
    created() {
      setTimeout(() => {
        this.$emit('update:open', true);
      }, 1000);
      this.l().mapInitialization.then(() => {
        /*
         * The map may only contain one `mm-dialog` at a time. The reasons for this are as follow:
         * 1. The modal functionality offered by leaflet-modal only supports showing one modal at a time.
         * 2. `mm-dialog` will always look the same except for the content inside of its default slot, so
         *      there's nothing that can be accomplished with multiple `mm-dialog`s that can't be done 
         *      more cleanly by changing the content of a singular `mm-dialog`.
         * 3. `divId` is defined at the module level instead of the instance level, so the `mm-dialog`s would all
         *      putting their slot content into the same `div` in the modal. Changing this is not impossible, though,
         *      so this is a more minor concern.
         */
        if(this.l().map.mapContainsDialog) {
          throw new Error("Two `mm-dialogs` exist inside of an `mm-map` at the same time. This is not supported.");
        }

        /* 
         * If this is the first `mm-dialog` added to an `mm-map` (as it almost always will be), then
         * `mapContainsDialog` will not preexist as a property of `this.l().mapContainsDialog`.
         */
        this.l().map.mapContainsDialog = true;
      });
    },
    props: {
      /**
       * Whether the dialog and its contents are currently visible to the user.
       * Intended to be used as a `v-model` prop by the parent.
       */
      open: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        modalContentString: `<div id="${divId}">test</div>`
      };
    },
    /*computed: {
      a
    },*/
    watch: {
      open: {
        immediate: true,
        handler(newVal) {
          this.l().mapInitialization.then(() => {
            if(newVal) {
              debugger;
              this.l().map.openModal({
                content: this.modalContentString
              });
            } else {
              this.l().map.closeModal();
            }
          })
        }
      }
    },
    methods: {},
    render() {
      return null;
    }
  })
</script>
