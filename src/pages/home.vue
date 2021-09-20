<template>
  <div>
    <mm-map :backgroundmap-metadata="gridmapMetadata">
      <mm-snapshot v-if="!!mapSnapshot" :map-snapshot="mapSnapshot" :backgroundmapMetadata="gridmapMetadata" />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMCellpicker from '/src/components/mm-cellpicker.vue'
  import MMSnapshot   from '/src/components/mm-snapshot.vue'
  import MMMap        from '/src/components/mm-map.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  import mockDbClient from '/src/mock-database/client.ts'

  export default defineComponent({
    components: {
      'mm-cellpicker': MMCellpicker,
      'mm-snapshot': MMSnapshot,
      'mm-map': MMMap,
    },
    data() {
      return {
        selectedCells: [],
        gridmapMetadata: gridmapMetadata,
        mapSnapshotPromise: mockDbClient.getSnapshot("2021-06-10T00:00.000Z").then((mapSnapshot) => {
          this.mapSnapshot = mapSnapshot;
        }),
        mapSnapshot: null
      };
    }
  })
</script>
