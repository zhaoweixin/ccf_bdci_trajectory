<template>
  <div id="app">
    <page_header></page_header>
    <page_functionbar></page_functionbar>
    <AppMap></AppMap>
    <page_functionbar2></page_functionbar2>
<!--    <AppPie_POI></AppPie_POI>-->
  </div>
</template>

<script>
    import AppMap from './components/AppMap'
    import page_header from './components/page_header'
    import page_functionbar from './components/page_functionbar'
    import page_functionbar2 from './components/page_functionbar2'
    // import AppPie_POI from './components/AppPie_POI'
    export default {
        name: 'app',
        components: {
            AppMap,
            page_header,
            page_functionbar,
            page_functionbar2,
            // AppPie_POI
        }
    }
</script>

<style>

  html,body{
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  #app {
    position: fixed;
    width: 100%;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background-color: #191a1a;
  }
</style>
