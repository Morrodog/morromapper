<template>
  <div>
    <mm-cellpicker :backgroundmap-metadata="gridmapMetadata" />
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMCellpicker from '/src/components/mm-cellpicker.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'


  export default defineComponent({
    components: {
      'mm-cellpicker': MMCellpicker,
    },
    data() {
      return {
        gridmapMetadata: gridmapMetadata,
      };
    },
  })
</script>
