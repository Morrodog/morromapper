<template>
  <div>
    <!-- TODO: More efficient alternative to containsHoverCell -->
    <mm-blob v-for="(borderBlob, i) in borderBlobs" :color="colorForStatus(borderBlob.cellStatus)" :cells="borderBlob.cells" :has-border="(i === hoveredBlobIndex)" />
    <mm-blob v-for="statusBlob in statusBlobs" :color="colorForStatus(statusBlob.cellStatus)" :cells="statusBlob.cells" />
  </div>
</template>
<script>
  import { defineComponent, computed, ref, inject } from 'vue';
  import { CellXY }                                 from 'morromapper-logic';
  import { MMBlob } from 'morromapper-components'

  import CELL_STATUS_COLORS from '/src/constants/cell-status-colors.ts';

  import CellStatus from '/src/types/cell-status.ts';

  export default defineComponent({
    components: {
      'mm-blob': MMBlob
    },
    props: {
      mapSnapshot: {
        type: Object, // of MapSnapshot interface
        required: true
      },
      backgroundmapMetadata: {
        type: Object, // of RasterBackgroundmapMetadata interface from morromapper-logic
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
      },
      
      /*
       * From here, all of the computations are done to make it as efficient as possible to determine whether a blob is being hovered over.
       * The reason this matters is that the expression in the template for :has-border gets re-evaluated for every blob every time the cell moves, and
       * the hoverCell will often update hundreds of times per second when a user is mousing around the map.
       *
       * There are two basic ideas here:
       * 1. Members of `borderBlobs` can be referenced by their ID in the borderBlobs array
       * 2. Because the map snapshot changes comparatively rarely, as much precomputation as possible
       *    should happen on those changes.
       */
      borderBlobsBounds() {
        return this.borderBlobs.map((blob) => {
          return blob.cells.reduce((bounds, cell) => {
            if(bounds.lowestY === null ||  (cell.y < bounds.lowestY)) bounds.lowestY = cell.y;
            if(bounds.lowestX === null ||  (cell.x < bounds.lowestX)) bounds.lowestX = cell.x;
            if(bounds.highestY === null || (cell.y > bounds.highestY)) bounds.highestY = cell.y;
            if(bounds.highestX === null || (cell.x > bounds.highestX)) bounds.highestX = cell.x;
            return bounds;
          }, {
            lowestY: null,
            lowestX: null,
            highestY: null,
            highestX: null
          });
        })
      },
      borderBlobsCellKeys() {
        return this.borderBlobs.map((blob) => {
          return blob.cells.map(CellXY.toObjectKey);
        });
      },
      hoveredBlobIndex() {
        if(this.hoverCell === null) return (-1);
        return this.borderBlobs.findIndex((blob, i) => {
          // If the hoverCell isn't in the bounding box for the blob, 
          // then there's no need to check the blob's cells for it.
          if(!(
            (this.borderBlobsBounds[i].lowestX <= this.hoverCell.x) &&
            (this.borderBlobsBounds[i].highestX >= this.hoverCell.x) &&
            (this.borderBlobsBounds[i].lowestY <= this.hoverCell.y) &&
            (this.borderBlobsBounds[i].highestY >= this.hoverCell.y)
          )) return false;
          
          return this.borderBlobsCellKeys[i].includes(CellXY.toObjectKey(this.hoverCell));
        });
      },
    }
  });
</script>
