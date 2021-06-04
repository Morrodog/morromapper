<template>
  <div>
    <mm-map>
      <mm-cell :cell="testCoord" :backgroundmap-metadata="backgroundmapMetadata" color="#0000ff" />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent } from 'vue'

  import MMCell from '/src/components/mm-cell.vue'
  import MMMap  from '/src/components/mm-map.vue'

  import cellpickerColor from '/src/constants/cellpicker-color.ts'

  import CellXY from '/src/types/cell-x-y.ts'

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
        testCoord: new CellXY({
          x: 1,
          y: 0
        })
      }
    }
  })
</script>
