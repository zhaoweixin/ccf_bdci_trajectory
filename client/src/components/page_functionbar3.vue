<template>
    <div id='page_functionbar3.vue' class='funcbar_warp_bar2'>
        <div class="funcbar_warp_header">
            <h4> INFO </h4>
            <div class="line-separator-1"></div>
        </div>
        <div class="funcbar_warp_header">
            <h5> ADD TIME/GEO TO HERE </h5>
            <div class="line-separator-2"></div>
        </div>

        <div id='OD_matrix'></div>
        <div id='barchart'></div>
        <div id='location_ring'></div>

    </div>
</template>
<script>
export default {
    name: 'page_functionbar3',
    data(){
        return {

        }
    },
    components:{},
    computed:{},
    watch:{},
    methods:{},
    mounted(){}
}
</script>
<style>
.funcbar_warp_bar2{
    position: absolute;
    z-index: 1;
    width:12.5%;
    max-height: 90%;
    transform: translate(1660px, 60px);
    height:70%;
    /*overflow:hidden;*/
    border-radius:.3em;
    box-shadow:0 0 0 1px hsla(0,0%,100%,.3) inset,0 .5em 1em rgba(0,0,0,0.6);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    font-size: 14px;
  }

  .funcbar_warp_header {
    padding-top: 10px;
    color: grey !important
  }
  #OD_matrix {
      height: 30%
  }
  #barchart{
      height: 30%
  }
  #location_ring{
      height: 28%
  }
</style>>