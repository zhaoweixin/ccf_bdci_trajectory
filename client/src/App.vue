<template>
  <div id="app">
    <page_header></page_header>
    <page_functionbar></page_functionbar>
    <grid_map></grid_map>
    <page_functionbar2></page_functionbar2>
  </div>
</template>

<script>
  import grid_map from './components/grid_map'
  import page_header from './components/page_header'
  import page_functionbar from './components/page_functionbar'
  import page_functionbar2 from './components/page_functionbar2'
  export default {
    name: 'app',
    components: {
      grid_map,
      page_header,
      page_functionbar,
      page_functionbar2
    }
  }
</script>

<style>
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
