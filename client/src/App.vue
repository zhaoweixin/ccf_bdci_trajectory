<template>
  <div id="app">
    <page_header></page_header>
    <page_functionbar></page_functionbar>
    <page_information></page_information>
    <AppMap></AppMap>
    <page_functionbar2></page_functionbar2>
    <page_functionbar3></page_functionbar3>
    <page_functionbar4></page_functionbar4>
  </div>
</template>

<script>
    import AppMap from './components/AppMap'
    import page_header from './components/page_header'
    import page_functionbar from './components/page_functionbar'
    import page_functionbar2 from './components/page_functionbar2'
    import page_functionbar3 from './components/page_functionbar3'
    import page_functionbar4 from './components/page_functionbar4'
    import page_information from './components/page_Information'
    export default {
        name: 'app',
        components: {
            AppMap,
            page_header,
            page_functionbar,  // 下端
            page_functionbar2, // 左侧
            page_information,
            page_functionbar3,  // 右侧1
            page_functionbar4   // 右侧2
        }
    }
</script>

<style>

  html,body{
    padding: 0;
    margin: 0;
    overflow: hidden;
    -moz-user-select:none;/*火狐*/
    -webkit-user-select:none;/*webkit浏览器*/
    -ms-user-select:none;/*IE10*/
    -khtml-user-select:none;/*早期浏览器*/
    user-select:none;
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
