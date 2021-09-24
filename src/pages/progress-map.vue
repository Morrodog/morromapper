<template>
  <mm-map :backgroundmap-metadata="gridmapMetadata" @click="presentCellDetails($event)">
    <mm-snapshot v-if="!!mapSnapshot" :map-snapshot="mapSnapshot" :backgroundmapMetadata="gridmapMetadata" />
    <mm-dialog v-model:is-open="dialogOpen">
      test
    </mm-dialog>
  </mm-map>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMSnapshot from '/src/components/mm-snapshot.vue'
  import MMDialog   from '/src/components/mm-dialog.vue'
  import MMMap      from '/src/components/mm-map.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  import mockDbClient from '/src/mock-database/client.ts'

  export default defineComponent({
    components: {
      'mm-snapshot': MMSnapshot,
      'mm-dialog': MMDialog,
      'mm-map': MMMap,
    },
    data() {
      return {
        dialogOpen: false,
        gridmapMetadata: gridmapMetadata,
        mapSnapshotPromise: mockDbClient.getSnapshot("2021-06-10T00:00.000Z").then((mapSnapshot) => {
          this.mapSnapshot = mapSnapshot;
        }),
        mapSnapshot: null
      };
    },
    methods: {
      presentCellDetails(cellXY) {
        this.mapSnapshotPromise.then(() => {
          console.log(this.mapSnapshot.inProgress);
          return mockDbClient.getClaims(this.mapSnapshot.cellClaims[CellXY.toObjectKey(cellXY)]);
        }).then((claims) => {
          this.dialogOpen = true;
          console.log(claims);
        });
      }
    }
  })
</script>
