<!--
  `mm-cell` represents a cell in the TESIII engine.
  Its implementation is a shell around mm-blob; it's only kept as a separate component for 

  Note that events from the `mm-blob` are propagated automatically, but will not be if the root element is changed to something else.

  TODO: Proper typechecking for coordinate and backgroundmapMetadata
-->
<template>
  <mm-blob
    :cells="cells"
    v-bind="$props"
  />
</template>
<script lang="ts">
  import { defineComponent } from 'vue'

  import CellXY from '/src/types/cell-x-y.ts'

  import MMBlob from '/src/components/mm-blob.vue'

  export default defineComponent({
    components: {
      'mm-blob': MMBlob
    },
    props: {
      cell: {
        type: CellXY,
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
    computed: {
      cells() {
        return [
          this.cell
        ];
      }
    }
  })
</script>
