<template>
  <mm-map :backgroundmap-metadata="backgroundmapMetadata" @cellhover="hoverCell = $event">
    <!-- TODO: Deduplicate release and bethesdaRelease code here -->
    <mm-blob v-for="release in bethesdaReleases" :color="vanillaColor" :cells="release.releasedCells" :has-border="containsHoverCell(release.releasedCells, hoverCell)" />
    <mm-blob v-for="release in releases"         :color="releaseColor" :cells="release.releasedCells" :has-border="containsHoverCell(release.releasedCells, hoverCell)" />
    <mm-blob v-for="inProgressBlob in inProgressBlobs" :color="inProgressBlob.color" :cells="inProgressBlob.cells" />
  </mm-map>
</template>
<script>
  import { defineComponent, computed, ref } from 'vue';

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
        releases: ref(props.mapSnapshot.releases),
        bethesdaReleases: ref(props.mapSnapshot.bethesdaReleases),
        vanillaColor: CELL_STATUS_COLORS[CellStatus.VANILLA],
        releaseColor: CELL_STATUS_COLORS[CellStatus.RELEASED],
        hoverCell: ref(null),
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
      }
    }
  });
</script>
