<template>
  <div>
    <mm-map>
      <mm-cell />
    </mm-map>
  </div>
</template>
<script>
  import { defineComponent} from 'vue'

  import MMMap from '/src/components/mm-map.vue'
  import MMCell from '/src/components/mm-cell.vue'

  export default defineComponent({
    components: {
      'mm-map': MMMap,
      'mm-cell': MMCell,
    }
  })
</script>
