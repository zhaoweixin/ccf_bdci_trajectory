<template>
  <div class="funcbar_warp">
    <div class="funcbar_warp_header">
      <h4> PANEL </h4>
      <div class="line-separator-1"></div>
    </div>
    

    <div class="funcbar_warp_header">
      <h5> OPERATER </h5>
      <div class="line-separator-2"></div>
    </div>

    <div class="bg">
      <div>
        <div class="chiller_cb">
          <input id="myCheckbox" type="checkbox"  value="1" checked v-model="checkedNames">
          <label for="myCheckbox">Checkbox checked</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox2" type="checkbox"  value="2" v-model="checkedNames">
          <label for="myCheckbox2">Checkbox unchecked</label>
          <span></span>
        </div>
        <button class='btn btn-primary shadow-none bg-secondary' style="transform: translate(0, 5px); font-size: 12px">Example button</button>
      </div>
    </div>

    <div class="funcbar_warp_header">
      <h5> OPERATER </h5>
      <div class="line-separator-2"></div>
    </div>

  </div>
</template>
<script>
  export default{
    name: 'page_funtionbar',
    data(){
      return {
        checkedNames: []
      }
    },
    components:{},
    computed:{},
    watch: {},
    methods:{},
    mounted(){}
  }
</script>
<style>

  .funcbar_warp{
    position: absolute;
    z-index: 1;
    width:12.5%;
    max-height: 90%;
    transform: translate(20px, 60px);
    height:70%;
    overflow:hidden;
    border-radius:.3em;
    box-shadow:0 0 0 1px hsla(0,0%,100%,.3) inset,0 .5em 1em rgba(0,0,0,0.6);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  .funcbar_warp_header {
    padding-top: 10px;
    color: grey !important
  }
  .line-separator-1{
  height:1px;
  background:grey;
}
  .line-separator-2{
    height:1px;
    background:grey;
    width:50%;
    transform:translate(50%, 0)
  }


.bg {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 10px;
}

.span_pseudo, .chiller_cb span:before, .chiller_cb span:after {
  content: "";
  display: inline-block;
  background: #fff;
  width: 0;
  height: 0.2rem;
  position: absolute;
  transform-origin: 0% 0%;
}

.chiller_cb {
  position: relative;
  height: 2rem;
  display: flex;
  align-items: center;
}
.chiller_cb input {
  display: none;
}
.chiller_cb input:checked ~ span {
  background: rgb(37,52,148);
  border-color: rgb(37,52,148);
}
.chiller_cb input:checked ~ span:before {
  width: 1rem;
  height: 0.15rem;
  transition: width 0.1s;
  transition-delay: 0.3s;
}
.chiller_cb input:checked ~ span:after {
  width: 0.4rem;
  height: 0.15rem;
  transition: width 0.1s;
  transition-delay: 0.2s;
}
.chiller_cb input:disabled ~ span {
  background: #ececec;
  border-color: #dcdcdc;
}
.chiller_cb input:disabled ~ label {
  color: #dcdcdc;
}
.chiller_cb input:disabled ~ label:hover {
  cursor: default;
}
.chiller_cb label {
  padding-left: 2rem;
  position: relative;
  z-index: 2;
  cursor: pointer;
  margin-bottom:0;
  color: white;
  font-family: initial;
}
.chiller_cb span {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border: 1px solid #ccc;
  position: absolute;
  left: 0;
  transition: all 0.2s;
  z-index: 1;
  box-sizing: content-box;
}
.chiller_cb span:before {
  transform: rotate(-55deg);
  top: 0.5rem;
  left: 0.37rem;
}
.chiller_cb span:after {
  transform: rotate(35deg);
  bottom: 0.35rem;
  left: 0.2rem;
}

.btn-primary{
  border-color: grey;
}

</style>
