<template>
  <mm-map :backgroundmap-metadata="gridmapMetadata" @cellhover="hoverCell=$event" @click="presentCellDetails($event)">
    <mm-popup :is-visible="!dialogOpen" :position="hoverCell">
      <b>[{{ hoverCell.x }}, {{ hoverCell.y }}]</b><br />
      {{ tooltipNote }}
    </mm-popup>
    <mm-snapshot v-if="!!mapSnapshot" :map-snapshot="mapSnapshot" :backgroundmapMetadata="gridmapMetadata" />
    <mm-dialog v-model:is-open="dialogOpen">
      <mm-cell-info v-if="lastClickedCell" :cell-x-y="lastClickedCell" :cell-documents="lastClickedCellDocuments" :snapshot-time="snapshotTime" />
    </mm-dialog>
  </mm-map>
  <button @click="snapshotTime='2007-01-01'">2007</button>
  <button @click="snapshotTime='2015-01-01'">2015</button>
  <button @click="snapshotTime='2019-01-01'">2019</button>
  <button @click="snapshotTime='2021-10-01'">Now</button>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMSnapshot from '/src/components/mm-snapshot.vue'
  import MMCellInfo from '/src/components/mm-cell-info.vue'
  import MMDialog   from '/src/components/mm-dialog.vue'
  import MMPopup    from '/src/components/mm-popup.vue'
  import MMMap      from '/src/components/mm-map.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY     from '/src/types/cell-x-y.ts'
  import CellStatus from '/src/types/cell-status.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  import mockDbClient from '/src/mock-database/client.ts'

  export default defineComponent({
    components: {
      'mm-snapshot': MMSnapshot,
      'mm-dialog': MMDialog,
      'mm-popup': MMPopup,
      'mm-map': MMMap,
      'mm-cell-info': MMCellInfo 
    },
    data() {
      var snapshotTime = (new Date()).toISOString();
      return {
        popupVisible: true,
        hoverCell: new CellXY({x: 0, y: 0}),
        snapshotTime,
        dialogOpen: false,
        gridmapMetadata: gridmapMetadata,
        mapSnapshot: null,
        lastClickedCell: null,
        lastClickedCellDocuments: [],
      };
    },
    computed: {
      mapSnapshotPromise() {
        return mockDbClient.getSnapshot(this.snapshotTime);
      },
      tooltipNote() {
        if(!this.mapSnapshot) return "Waiting on data...";
        if(this.mapSnapshot.cellDocuments.hasOwnProperty(CellXY.toObjectKey(this.hoverCell))) {
          return `Associated with ${this.mapSnapshot.cellDocuments[CellXY.toObjectKey(this.hoverCell)].length} documents`;
        } else {
          return `Not in any claims or releases.`;
        }
      }
    },
    watch: {
      mapSnapshotPromise: {
        immediate: true,
        handler(newVal) {
          newVal.then((mapSnapshot) => {
            this.mapSnapshot = mapSnapshot;
          });
        }
      }
    },
    methods: {
      presentCellDetails(cellXY) {
        this.lastClickedCell = cellXY;
        var cellKey = CellXY.toObjectKey(cellXY);
        this.mapSnapshotPromise.then(() => {
          //TODO: Maybe avoid a request here?
          if(!this.mapSnapshot.cellDocuments.hasOwnProperty(cellKey)) {
            this.lastClickedCell = null;
            this.dialogOpen = false;
            return Promise.reject();
          }
          return mockDbClient.getDocuments(this.mapSnapshot.cellDocuments[cellKey]);
        }).then((documents) => {
          this.lastClickedCellDocuments = documents;
          this.dialogOpen = true;
        });
      }
    }
  })
</script>
