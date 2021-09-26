<template>
  <b>[{{ cell.x }}, {{ cell.y }}]</b><br />
  <template v-if="!!mapSnapshot">
    <div v-if="releaseCount > 0">Featured in <b>{{ releaseCount }} releases.</b></div>
    <div v-if="claimCount > 0">Part of <b>{{ claimCount }} claims.</b></div>
  </template>
</template>
<script>
  import { defineComponent} from 'vue'

  import CellXY      from '/src/types/cell-x-y.ts'

  export default defineComponent({
    props: {
      cell: {
        type: CellXY,
        required: true
      },
      mapSnapshot: {
        type: Object,// of MapSnapshot interface
        required: false
      }
    },
    computed: {
      cellKey() {
        return CellXY.toObjectKey(this.cell);
      },
      claimCount() {
        if((!this.mapSnapshot) || (!this.mapSnapshot.cellClaims.hasOwnProperty(this.cellKey))) return 0;
        return this.mapSnapshot.cellClaims[this.cellKey].length;
      },
      releaseCount() {
        if((!this.mapSnapshot) || (!this.mapSnapshot.cellReleases.hasOwnProperty(this.cellKey))) return 0;
        return this.mapSnapshot.cellReleases[this.cellKey].length;
      },
    }
  });
</script>
