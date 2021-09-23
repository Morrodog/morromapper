<template>
  <div>
    <mm-map :backgroundmap-metadata="gridmapMetadata">
      <!--<mm-dialog v-model:is-open="dialogOpen">-->
      <mm-dialog is-open>
        <button @click="test = !test">toggle</button>
          {{ test }}
      </mm-dialog>
    </mm-map>
    <button @click="dialogOpen = !dialogOpen">toggle dialog</button>
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMCellpicker from '/src/components/mm-cellpicker.vue'
  import MMMap        from '/src/components/mm-map.vue'
  import MMDialog     from '/src/components/mm-dialog.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  export default defineComponent({
    components: {
      'mm-cellpicker': MMCellpicker,
      'mm-map': MMMap,
      'mm-dialog': MMDialog
    },
    data() {
      return {
        dialogOpen: true,
        test: false,
        selectedCells: [],
        gridmapMetadata: gridmapMetadata,
      };
    }
  })
</script>
