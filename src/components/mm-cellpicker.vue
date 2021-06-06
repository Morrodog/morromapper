<template>
  <div>
    <mm-map :backgroundmap-metadata="backgroundmapMetadata" :update:hover-cell="hoverCell = $event">
      <!--<mm-cell v-if="!!hoverCell" :cell="hoverCell" color="#ffffff"  @click="toggleCellSelection($event)" />
      <mm-cell v-for="selectedCell in selectedCells" :cell="selectedCell" color="#000000" :has-border="true"/>-->
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent, nextTick } from 'vue'

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
      },
      /**
       * Expects to be used with a 2-way binding (i.e. `v-model:selected-cells="..."`)
       */
      selectedCells: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        hoverCell: null
      }
    },
    methods: {
      /**
       * If the user's mouse cursor moves faster than hoverCell updates, then the user can directly click the background `mm-blob`.
       * When this happens, the background `mm-blob` synchronously updates its `lastEmittedCell`, which means that it causes `hoverCell`
       * to move. When this happens, we need to wait one tick for `hoverCell` to be updated to the spot the user clicked, and once this
       * has happened, we can respond to the user's click as though they had clicked the hoverCell instead of the background.
       */
      selectCellFromBackground() {
        nextTick(() => {
          console.log(this.hoverCell);
          this.toggleCellSelection(this.hoverCell);
        });
      },
      toggleCellSelection(cell) {
        var selectedCellIndex = this.selectedCells.findIndex((selectedCell) => {
          return (cell.x === selectedCell.x && cell.y === selectedCell.y);
        });
        if(selectedCellIndex !== -1) {
          this.autoSelectedCells.splice(selectedCellIndex, 1);
        } else {
          this.autoSelectedCells.push(cell);
        }
      }
    },
    computed: {
      autoSelectedCells: {
        get() {
          return this.selectedCells;
        },
        set(newVal) {
          this.$emit('update:selectedCells', newVal);
        },
      },
    }
  })
</script>
