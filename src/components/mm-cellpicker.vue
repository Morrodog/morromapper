<template>
  <div>
    <mm-map>
      <mm-cell v-for="cell in cellsForSelection" :cell="cell" :backgroundmap-metadata="backgroundmapMetadata" color="#ffffff" />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent } from 'vue'

  import MMCell from '/src/components/mm-cell.vue'
  import MMMap  from '/src/components/mm-map.vue'

  import cellpickerColor from '/src/constants/cellpicker-color.ts'

  import CellXY from '/src/types/cell-x-y.ts'
  
  // (inclusive, inclusive)
  const range = (start, end) => {
    return (new Array(end - start + 1)).fill().map((x, i) => {
      return start+i
    });
  }

  export default defineComponent({
    components: {
      'mm-map': MMMap,
      'mm-cell': MMCell,
    },
    props: {
      backgroundmapMetadata: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        selectedCells: []
      }
    },
    computed: {
      cellsForSelection() {
        return this.verticalCellRange.map((y) => {
          return this.horizontalCellRange.map((x) => {
            return new CellXY({
              x,
              y,
            });
          });
        }).flat();
      },
      /**
       * Returns the range of Y coordinates covered by the backgroundmap's `gridBounds`
       */
      verticalCellRange() {
        var originCellTopBorderY = this.backgroundmapMetadata.originCellTopBorderY;
        var cellSideLength       = this.backgroundmapMetadata.cellSideLength;
        var borderWidth          = this.backgroundmapMetadata.borderWidth;
        var imageBottom          = this.backgroundmapMetadata.gridBounds[1][0];
        var imageTop             = this.backgroundmapMetadata.gridBounds[0][0];

        // For the purpose of counting cells, this is essentially "one cell" as long as an extra border is accounted for elsewhere
        var cellSize             = cellSideLength + borderWidth;

        // To find the bottom-most cell in the range, we iterate down from the origin cell,
        // and the cell before the first cell that goes past the bottom of `gridBounds` is the bottom-most cell.
        // In all of the other ___Most_Coord variables, the same approach is taken.
        var bottomMostYCoord = (() => {
          var originBottomBorder = originCellTopBorderY - (cellSideLength + borderWidth);
          for(var y = 0; (originBottomBorder - (y*cellSize)) > imageBottom; y++);
          return y*(-1);
        })();
        var topMostYCoord = (() => {
          var originTopBorder = originCellTopBorderY;
          for(var y = 0; (originTopBorder + (y*cellSize)) < imageTop; y++);
          return y;
        })();

        return range(bottomMostYCoord, topMostYCoord);
      },
      /**
       * Returns the range of X coordinates covered by the backgroundmap's `gridBounds`
       * 
       * TODO: Deduplicate from `verticalCellRange`
       */
      horizontalCellRange() {
        var originCellRightBorderX = this.backgroundmapMetadata.originCellRightBorderX;
        var cellSideLength       = this.backgroundmapMetadata.cellSideLength;
        var borderWidth          = this.backgroundmapMetadata.borderWidth;
        var imageRight           = this.backgroundmapMetadata.gridBounds[1][1];
        var imageLeft            = this.backgroundmapMetadata.gridBounds[0][1];

        // For the purpose of counting cells, this is essentially "one cell" as long as an extra border is accounted for elsewhere
        var cellSize             = cellSideLength + borderWidth;

        var leftMostXCoord = (() => {
          var originLeftBorder = originCellRightBorderX - (cellSideLength + borderWidth);
          for(var x = 0; (originLeftBorder - (x*cellSize)) > imageLeft; x++);
          return x*(-1);
        })();
        var rightMostXCoord = (() => {
          var originRightBorder = originCellRightBorderX;
          for(var x = 0; (originRightBorder + (x*cellSize)) < imageRight; x++);
          return x;
        })();

        return range(leftMostXCoord, rightMostXCoord);
      }
    }
  })
</script>
