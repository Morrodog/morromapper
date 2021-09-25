<template>
  <div>
    <!-- TODO: More efficient alternative to containsHoverCell -->
    <mm-blob v-for="borderBlob in borderBlobs" :color="colorForStatus(borderBlob.cellStatus)" :cells="borderBlob.cells" :has-border="containsHoverCell(borderBlob.cells, hoverCell)" />
    <mm-blob v-for="statusBlob in statusBlobs" :color="colorForStatus(statusBlob.cellStatus)" :cells="statusBlob.cells" />
  </div>
</template>
<script>
  import { defineComponent, computed, ref, inject } from 'vue';

  import CELL_STATUS_COLORS from '/src/constants/cell-status-colors.ts';

  import CellStatus from '/src/types/cell-status.ts';

  import MMBlob from '/src/components/mm-blob.vue'
  import MMMap  from '/src/components/mm-map.vue'

  export default defineComponent({
    components: {
      'mm-map': MMMap,
      'mm-blob': MMBlob,
    },
    props: {
      mapSnapshot: {
        type: Object, // of MapSnapshot interface
        required: true
      },
      backgroundmapMetadata: {
        type: Object, // of RasterBackgroundmapMetadata interface
        required: true
      },
    },
    setup(props) {
      return {
        hoverCell: inject('hoverCell'),
        releases: ref(props.mapSnapshot.releases),
        bethesdaReleases: ref(props.mapSnapshot.bethesdaReleases),
        vanillaColor: CELL_STATUS_COLORS[CellStatus.VANILLA],
        releaseColor: CELL_STATUS_COLORS[CellStatus.RELEASED],
        inProgressBlobs: computed(() => {
          return Object.entries(props.mapSnapshot.inProgress).map(([cellStatus, cells]) => {
            return {
              color: CELL_STATUS_COLORS[cellStatus],
              cells: cells
            };
          });
        })
      };
    },
    methods: {
      containsHoverCell(cells, hoverCell) {
        if(hoverCell === null) return false;
        return cells.some((cell) => {
          return cell.x === hoverCell.x && cell.y === hoverCell.y;
        });
      },
      colorForStatus(status) {
        return CELL_STATUS_COLORS[status];
      }
    },
    computed: {
      borderBlobs() {
        return this.mapSnapshot.borderBlobs;
      },
      statusBlobs() {
        return Object.entries(this.mapSnapshot.statusBlobs).map((entry) => {
          return {
            cellStatus: entry[0],
            cells: entry[1]
          };
        });
      }
    }
  });
</script>
