<template>
  <div>
    <mm-map :backgroundmap-metadata="gridmapMetadata">
      <mm-blob :cells="blobCells" :backgroundmap-metadata="gridmapMetadata" color="#0000ff" :has-border="true" @mouseover="asdf($event)" />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMBlob from '/src/components/mm-blob.vue'
  import MMMap  from '/src/components/mm-map.vue'

  //import type RasterBackgroundmapMetadata from '/src/types/raster-backgroundmap-metadata.ts'
  import CellXY                           from '/src/types/cell-x-y.ts'
  
  import gridmapMetadata from '/src/assets/gridmap-metadata.json'

  export default defineComponent({
    components: {
      //'mm-cellpicker': MMCellpicker,
      'mm-blob': MMBlob,
      'mm-map': MMMap
    },
    data() {
      return {
        blobCells: [
          new CellXY({
            x: 0,
            y: -1
          }),
          new CellXY({
            x: 0,
            y: 1
          }),
          new CellXY({
            x: 0,
            y: 0
          }),
          new CellXY({
            x: 1,
            y: 0
          }),
          new CellXY({
            x: 2,
            y: 0
          }),
          new CellXY({
            x: 3,
            y: 0
          }),
          new CellXY({
            x: 3,
            y: -1
          }),
          new CellXY({
            x: 3,
            y: -2
          }),
          new CellXY({
            x: 2,
            y: -2
          }),
          new CellXY({
            x: 1,
            y: -2
          }),
          new CellXY({
            x: 0,
            y: -2
          }),
          new CellXY({
            x: -1,
            y: -2
          }),
        ],
        gridmapMetadata: gridmapMetadata,
      };
    },
    methods: {
      asdf(a) {
        console.log(a);
      }
    }
  })
</script>
