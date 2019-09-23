<template>
  <div id="app">
    <grid_map></grid_map>
  </div>
</template>

<script>
  import grid_map from './components/grid_map'
  export default {
    name: 'app',
    components: {
      grid_map
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
