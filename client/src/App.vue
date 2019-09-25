<template>
  <div id="app">
    <control></control>
    <mapgl></mapgl>
  </div>
</template>

<script>
  import mapgl from './components/AppMap'
  import control from './components/AppControl'
  export default {
    name: 'app',
    components: {
      control,
      mapgl
    }
  }
</script>

<style>

  html,body{
    padding: 0;
    margin: 0;
  }

  #app {
    position: fixed;
    width: 100%;
    height: 100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background-color: #191a1a;
  }
</style>
