<template>
  <mm-map :backgroundmap-metadata="gridmapMetadata" @cellhover="hoverCell=$event" @click="presentCellDetails($event)">
    <mm-popup v-if="popupVisible" :position="hoverCell">
      <mm-cell-summary :map-snapshot="mapSnapshot" :cell="hoverCell" />
    </mm-popup>
    <mm-snapshot v-if="!!mapSnapshot" :map-snapshot="mapSnapshot" :backgroundmapMetadata="gridmapMetadata" />
    <mm-dialog v-model:is-open="dialogOpen">
      <mm-cell-info v-if="lastClickedCell" :cell="lastClickedCell" :map-snapshot="mapSnapshot" :snapshot-time="snapshotTime" />
    </mm-dialog>
  </mm-map>
  <div>
    <button @click="snapshotTime='2007-01-01'">2007</button>
    <button @click="snapshotTime='2015-01-01'">2015</button>
    <button @click="snapshotTime='2019-01-01'">2019</button>
    <button @click="snapshotTime='2021-10-01'">Now</button>
  </div>
  <div>
    <input type="text" v-model="snapshotEntry">
    <button @click="submitSnapshotEntry()">Use as snapshot time</button>
  </div>
</template>
<script>
  import { MMDialog, MMPopup, MMMap } from 'morromapper-components'
  import { defineComponent}           from 'vue'
  import { CellXY }                   from 'morromapper-logic'

  import MMCellSummary from '/src/components/mm-cell-summary.vue'
  import MMSnapshot    from '/src/components/mm-snapshot.vue'
  import MMCellInfo    from '/src/components/mm-cell-info.vue'

  import CellStatus from '/src/types/cell-status.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  import mockDbClient from '/src/mock-database/client.ts'

  export default defineComponent({
    components: {
      'mm-cell-summary': MMCellSummary,
      'mm-snapshot': MMSnapshot,
      'mm-dialog': MMDialog,
      'mm-popup': MMPopup,
      'mm-map': MMMap,
      'mm-cell-info': MMCellInfo 
    },
    data() {
      var snapshotTime = (new Date()).toISOString();
      return {
        snapshotEntry: "2021-10-01",
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
      hoverCellKey() {
        return CellXY.toObjectKey(this.hoverCell);
      },
      popupVisible() {
        if(this.hoverCell === null) return false;
        const cellKey = CellXY.toObjectKey(this.hoverCell);
        return (this.mapSnapshot !== null) &&
          (
            (this.mapSnapshot.cellClaims.hasOwnProperty(cellKey) && (this.mapSnapshot.cellClaims[cellKey].length > 0)) ||
            (this.mapSnapshot.cellReleases.hasOwnProperty(cellKey) && (this.mapSnapshot.cellReleases[cellKey].length > 0))
          );
      }
    },
    watch: {
      snapshotTime(newVal) {
        this.snapshotEntry = newVal;
      },
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
        this.dialogOpen = true;
      },
      submitSnapshotEntry() {
        //try {
          new Date(this.snapshotEntry);
          this.snapshotTime = this.snapshotEntry;
        //} catch(e) {}
      }
    }
  })
</script>
