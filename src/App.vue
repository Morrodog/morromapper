<template>
  <home />
</template>
<script lang="ts">
  import { defineComponent } from 'vue'
  import home from './pages/progress-map.vue'

  export default defineComponent({
    name: 'App',
    components: {
      home
    }
  })
</script>
<style>
</style>
