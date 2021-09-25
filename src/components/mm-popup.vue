<!-- 
  Named after Leaflet's `L.popup`. For what colloquially would be called a "popup", see `mm-dialog.vue`
-->
<script>
  export default {
    props: {
      cell: 
    }
    setup(props, context) {
      var p = L.popup().setLatLng([0, 0]).setContent("test").addTo(map);
      setTimeout(() => {
        p.setLatLng([10,10]);
      }, 5000);
    }
  }
</script>
