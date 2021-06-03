<template>
  <div>
    <mm-map>
      <mm-cell :cell="coordinates[0]" :backgroundmap-metadata="metadata" />
      <mm-cell :cell="coordinates[1]" :backgroundmap-metadata="metadata" />
      <mm-cell :cell="coordinates[2]" :backgroundmap-metadata="metadata" />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMCell from '/src/components/mm-cell.vue'
  import MMMap  from '/src/components/mm-map.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'


  export default defineComponent({
    components: {
      'mm-map': MMMap,
      'mm-cell': MMCell,
    },
    data() {
      return {
        metadata: gridmapMetadata,
        coordinates: [
          (new CellXY({x: 0, y:0})),
          (new CellXY({x: 0, y:1})),
          (new CellXY({x: 1, y:1}))
        ]
      };
    }
  })
</script>
