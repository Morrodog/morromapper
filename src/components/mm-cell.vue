<!--
  This represents a cell in the TESIII engine.
-->
<script lang="ts">
  import { defineComponent, h } from 'vue'

  export default defineComponent({
    inject: ['mapWrapper'],
    data() {
      return {
        addedToMap: false
      }
    },
    computed: {
      mapInitialized() {
        return this.mapWrapper.map !== null
        //return !!this.map._container
      },
    },
    render() {
      if(this.mapInitialized && !this.addedToMap) {
        var testFeature = L.geoJSON({
          "type": "Feature",
          "properties": {"party": "Republican"},
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [0,    0],
              [0,    1000],
              [1000, 1000],
              [1000, 0],
              [0,    0]
            ]]
          }
        });
        testFeature.addTo(this.mapWrapper.map);
        this.mapWrapper.map.fitBounds(testFeature.getBounds());

        this.addedToMap = true;
      }
    }
  })
</script>
