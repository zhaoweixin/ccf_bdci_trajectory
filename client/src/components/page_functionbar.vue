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
          <input id="myCheckbox" type="checkbox"  value="0" checked v-model="config.checkedNames">
          <label for="myCheckbox">运输需求量</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox2" type="checkbox"  value="1" v-model="config.checkedNames">
          <label for="myCheckbox2">运输距离</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox3" type="checkbox"  value="2" v-model="config.checkedNames">
          <label for="myCheckbox3">运输流向</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox4" type="checkbox"  value="3" v-model="config.checkedNames">
          <label for="myCheckbox4">起运时间</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox5" type="checkbox"  value="4" v-model="config.checkedNames">
          <label for="myCheckbox5">到达时间</label>
          <span></span>
        </div>
        
        <div>
          <!-- Group of default radios - option 1 -->
          <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" id="defaultGroupExample1" name="groupOfDefaultRadios" value="Day" v-model="config.picked">
            <label class="custom-control-label" for="defaultGroupExample1">Day</label>
          </div>

          <!-- Group of default radios - option 2 -->
          <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" id="defaultGroupExample2" name="groupOfDefaultRadios" checked value="Month" v-model="config.picked">
            <label class="custom-control-label" for="defaultGroupExample2">Month</label>
          </div>
        </div>
        
        <br>
        <button class='btn btn-primary shadow-none bg-secondary' style="transform: translate(0, 5px); font-size: 12px" @click="handle_clickbutton()">Example button</button>
      </div>
    </div>

    <div class="funcbar_warp_header">
      <h5> OPERATER </h5>
      <div class="line-separator-2"></div>
    </div>

  </div>
</template>
<script>
  import DataManager from '../data/DataManager'
  export default{
    name: 'page_funtionbar',
    data(){
      return {
        config: {
          checkedNames:['0'],
          //0 运输需求量 1 运输距离 2 运输流向 3 起运时间 4 到达时间
          picked: 'Month',
          status: '3' // update all
        }
      }
    },
    components:{},
    computed:{
      
    },
    watch: {},
    methods:{
      handle_clickbutton(){
        let that = this;
        //直接全部重画
        if(JSON.stringify(this.$store.state.operater_state) != JSON.stringify(this.config)){
          this.$store.commit('operater_state', this.config)
        } else {

        }
        
        /*
        增加或删除某线
        if(Object.keys(config).length == 0){
          this.config.checkedNames = this.checkedNames
          this.config.picked = this.picked
          //request data
          //generate related graph
        } else{
          //change time unit, need to refresh all
          let info = instend(this.config.checkedNames, this.checkedNames)
        }

        function instend(one,tow){
          let same = [],
           diff = [],
           o = {};
          if(one.toString() == tow.toString()){
            return {'diff': diff, 'same': same, 'isSame': true}
          }
          for (var i = 0; i< one.length; i++) (one[i] in o) ? o[one[i]] ++ : o[one[i]] = 1;
          for (var i = 0; i< tow.length; i++) (tow[i] in o) ? same.push(tow[i]) : diff.push(tow[i]);
          return {'diff': diff, 'same': same, 'isSame': false};
        }
        */

      }
    },
    mounted(){
      
    }
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


/*radio*/
.custom-control-input {
  display: flex !important;
  min-height: 32px !important;
  padding-left: 1.4rem !important;
}
.custom-control-label {
  padding-left: 10px !important;
  padding-top: 2px !important;
  display: relative !important;
  color: white !important;
  font-family: initial !important;
}
.custom-control {
  display: flex !important;
  padding-left: 1.4rem !important;
  min-height: 32px !important;
}
.custom-control-label::before{
  background-color: black !important;
  border: white solid 1px !important;
}

.custom-control-input:checked~.custom-control-label::before{
  border-color: #99C779 !important;
}

.chiller_cb input:checked ~ span{
  background: #99C779 !important;
  border-color: #99C779 !important;
}
</style>
