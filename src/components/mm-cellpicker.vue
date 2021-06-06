<template>
  <div>
    <mm-map :backgroundmap-metadata="backgroundmapMetadata" @cellhover="hoverCell=$event" @click="toggleCellSelection($event)">
      <mm-blob v-if="!!hoverCell" :cells="[hoverCell]" color="#ffffff" />
      <mm-blob v-for="selectedCell in selectedCells" :cells="[selectedCell]" color="#000000" :has-border="true"/>
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent, nextTick } from 'vue'

  import MMBlob from '/src/components/mm-blob.vue'
  import MMMap  from '/src/components/mm-map.vue'

  import cellpickerColor from '/src/constants/cellpicker-color.ts'

  import CellXY from '/src/types/cell-x-y.ts'
  
  export default defineComponent({
    components: {
      'mm-map': MMMap,
      'mm-blob': MMBlob,
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
