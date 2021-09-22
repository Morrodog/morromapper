<template>
  <div>
    <mm-map :backgroundmap-metadata="gridmapMetadata">
      <mm-dialog :open="true" />
    </mm-map>
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
        selectedCells: [],
        gridmapMetadata: gridmapMetadata,
      };
    }
  })
</script>
