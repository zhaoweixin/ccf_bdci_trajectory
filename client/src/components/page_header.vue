<template>
  <div class="header_warp">
    <p>Spatio-Temporal Evolution Characteristics of Traffic Flow Visualization System</p>
  </div>
</template>

<script>

</script>

<style>
  .header_warp h3 {
    font-size:20px;
    color: white;
  }

  .header_warp p {
    font-size:20px;
    color:white;
    padding: 5px 0px;
    font-variant-ligatures:common-ligatures
    discretionary-ligatures
    historical-ligatures;
    margin-top: 5px !important;
    margin-bottom: 5px !important;
  }

  .header_warp {
    position:absolute;
    z-index: 1;
    transform: translate(1%, 0);
    width:98%;
    overflow:hidden;
    border-radius:.3em;
    box-shadow:0 0 0 1px hsla(0,0%,100%,.6) inset, 0 .5em 1em rgba(0, 0, 0, .3);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px)
  }
</style>
