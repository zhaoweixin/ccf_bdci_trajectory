<template>
  <div class="funcbar_warp_bar1">
    <div class="funcbar_warp_header">
      <h5>操作栏</h5>
      <div class="line-separator-1"></div>
    </div>

    <div class="funcbar_warp_header">
      <h6>时间区间</h6>
      <div class="line-separator-2"></div>
    </div>
    <div class="bg">
      <div>
        <!-- Group of default radios - option 1 -->
        <div class="custom-control custom-radio">
          <input
            type="radio"
            class="custom-control-input"
            id="defaultGroupExample1"
            name="groupOfDefaultRadios"
            value="Hour"
            v-model="config.picked"
          />
          <label class="custom-control-label" for="defaultGroupExample1" @click="hour_click()">Hour</label>
        </div>

        <!-- Group of default radios - option 2 -->
        <div class="custom-control custom-radio">
          <input
            type="radio"
            class="custom-control-input"
            id="defaultGroupExample2"
            name="groupOfDefaultRadios"
            checked
            value="Day"
            v-model="config.picked"
          />
          <label class="custom-control-label" for="defaultGroupExample2" @click="day_click()">Day</label>
        </div>

        <!-- Group of default radios - option 3 -->
        <div class="custom-control custom-radio">
          <input
            type="radio"
            class="custom-control-input"
            id="defaultGroupExample3"
            name="groupOfDefaultRadios"
            checked
            value="All"
            v-model="config.picked"
          />
          <label class="custom-control-label" for="defaultGroupExample3" @click="all_click()">All</label>
        </div>
      </div>
    </div>

    <div class="funcbar_warp_header">
      <h5>折线图</h5>
      <div class="line-separator-2"></div>
    </div>

    <div class="bg">
      <div>
        <div class="chiller_cb">
          <input id="myCheckbox" type="checkbox" value="0" checked v-model="config.checkedNames" />
          <label for="myCheckbox">运输需求量</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox2" type="checkbox" value="1" v-model="config.checkedNames" />
          <label for="myCheckbox2">运行距离</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox4" type="checkbox" value="3" v-model="config.checkedNames" />
          <label for="myCheckbox4">运行时间</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input id="myCheckbox5" type="checkbox" value="4" v-model="config.checkedNames" />
          <label for="myCheckbox5">运行速度</label>
          <span></span>
        </div>

        <div class="line-separator-2"></div>

        <div class="chiller_cb">
          <input
            id="weatherCheckbox1"
            type="checkbox"
            value="0"
            v-model="weather_config.checkedNames"
          />
          <label for="weatherCheckbox1">天气</label>
          <span></span>
        </div>

        <div class="chiller_cb">
          <input
            id="weatherCheckbox2"
            type="checkbox"
            value="1"
            v-model="weather_config.checkedNames"
          />
          <label for="weatherCheckbox2">节假日</label>
          <span></span>
        </div>

        <button
          class="btn btn-primary shadow-none bg-secondary"
          style="transform: translate(0, -5px); font-size: 12px; width:100px"
          @click="handle_clickbutton()"
        >Apply</button>
      </div>
    </div>

    <div class="funcbar_warp_header">
      <h6>图层选择</h6>
      <div class="line-separator-2"></div>
    </div>
    <div class="bg">
      <div>
        <div class="chiller_cb">
          <input
            id="btn-grid-layer"
            type="checkbox"
            value="gird_layer"
            checked
            v-model="map_config.checkedNames"
          />
          <label for="btn-grid-layer">地图网格图层</label>
          <span></span>
        </div>
        <!--        <div class="chiller_cb">
                  <input id="btn-poi-layer" type="checkbox"  value="poi_layer" v-model="map_config.checkedNames">
                  <label for="btn-poi-layer">POI&nbsp;数据图层</label>
                  <span></span>
        </div>-->
        <div class="chiller_cb">
          <input
            id="btn-buses-layer"
            type="checkbox"
            value="buses_layer"
            v-model="map_config.checkedNames"
          />
          <label for="btn-buses-layer">公交路网图层</label>
          <span></span>
        </div>
        <div class="chiller_cb">
          <input
            id="btn-district-layer"
            type="checkbox"
            value="district_layer"
            v-model="map_config.checkedNames"
          />
          <label for="btn-district-layer">行政区划图层</label>
          <span></span>
        </div>
      </div>
    </div>
    <div class="funcbar_warp_header">
      <h6>OD数据选择</h6>
      <div class="line-separator-2"></div>
    </div>
    <div class="bg">
      <div>
        <!-- Group of default radios - option 1 -->
        <div class="custom-control custom-radio">
          <input
            type="radio"
            class="custom-control-input"
            id="ODdefaultGroupExample1"
            value="0"
            v-model="od_config.picked"
          />
          <label class="custom-control-label" for="ODdefaultGroupExample1">O</label>
        </div>

        <!-- Group of default radios - option 2 -->
        <div class="custom-control custom-radio">
          <input
            type="radio"
            class="custom-control-input"
            id="ODdefaultGroupExample2"
            value="1"
            checked
            v-model="od_config.picked"
          />

          <label class="custom-control-label" for="ODdefaultGroupExample2">D</label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DataManager from "../data/DataManager";

export default {
  name: "page_funtionbar",
  data() {
    return {
      config: {
        checkedNames: ["0"],
        //0 运输需求量 1 运输距离 2 运输流向 3 起运时间 4 速度
        picked: "All",
        status: "3" // update all
      },
      map_config: {
        checkedNames: ["gird_layer"]
      },
      weather_config: {
        checkedNames: [],
        status: "3" // update all
        // 0 天气
      },
      layer_config: {},
      his_weather_config: {
        checkedNames: [],
        status: "3"
      },
      od_config: {
        checkedNames: [],
        picked: 0
      }
    };
  },
  components: {},
  computed: {},
  watch: {
    map_config: {
      handler(newValue, oldValue) {
        this.layer_config = {
          gird_layer: false,
          district_layer: false,
          poi_layer: false,
          buses_layer: false
        };
        newValue.checkedNames.forEach(d => {
          this.layer_config[d] = !this.layer_config[d];
        });
        //console.log(this.layer_config);
        this.$store.commit("map_state", this.layer_config);
      },
      deep: true
    },
    weather_config: {
      handler(newValue, oldValue) {
        let res = {
          status: "3",

          config: {
            add: [],

            remove: []
          }
        };

        newValue.checkedNames.forEach((d, i) => {
          if (
            this.his_weather_config.checkedNames.indexOf(
              newValue.checkedNames[i]
            ) == -1
          ) {
            res.config.add.push(newValue.checkedNames[i]);
          }
        });

        this.his_weather_config.checkedNames.forEach((d, i) => {
          if (
            newValue.checkedNames.indexOf(
              this.his_weather_config.checkedNames[i]
            ) == -1
          ) {
            res.config.remove.push(this.his_weather_config.checkedNames[i]);
          } //旧数组中不存在该元素，需添加
        });

        //新数组中存在该元素，需

        //console.log(newValue, oldValue)

        this.his_weather_config = JSON.parse(JSON.stringify(newValue));

        this.$store.commit("feature_change_state", newValue);
      },

      deep: true
    },
    od_config: {
      handler(newValue, oldValue) {
        //console.log(newValue.picked);
        this.$store.commit("change_OD_state", newValue.picked);
      },
      deep: true
    }
  },
  methods: {
    handle_clickbutton() {
      //直接全部重画
      if (
        JSON.stringify(this.$store.state.operater_state) !==
        JSON.stringify(this.config)
      ) {
        this.$store.commit("operater_state", this.config);
      } else {
      }
    },
    hour_click() {
      this.$store.commit("AllDayHour_state", 2);
    },
    day_click() {
      this.$store.commit("AllDayHour_state", 1);
    },
    all_click() {
      this.$store.commit("AllDayHour_state", 0);
    }
  },
  mounted() {}
};
</script>
<style>
.funcbar_warp_bar1 {
  position: absolute;
  z-index: 1;
  width: 12.5%;
  max-height: 90%;
  /*transform: translate(20px, 60px);*/
  left: 1%;
  top: 6%;
  height: 70%;
  /*overflow:hidden;*/
  border-radius: 0.3em;
  box-shadow: 0 0 0 1px hsla(0, 0%, 100%, 0.3) inset,
    0 0.5em 1em rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  font-size: 13px;
}
.funcbar_warp_header {
  padding-top: 5px;
  color: grey !important;
}
.line-separator-1 {
  height: 1px;
  background: grey;
}
.line-separator-2 {
  height: 1px;
  background: grey;
  width: 50%;
  transform: translate(50%, 0);
}
.bg {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 1px;
}

.chiller_cb {
  position: relative;
  height: 2.3rem !important;
  display: flex;
  align-items: center;
}
.chiller_cb input {
  display: none;
}
.chiller_cb input:checked ~ span {
  background: rgb(37, 52, 148);
  border-color: rgb(37, 52, 148);
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
  margin-bottom: 0;
  color: white;
  font-family: initial;
  font-size: 15px;
  color: rgb(170, 170, 170) !important;
  font-weight: bold;
}
.chiller_cb span {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
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

.chiller_cb {
  position: relative;
  height: 1.6rem;
  display: flex;
  align-items: center;
}
.chiller_cb input {
  display: none;
}
.chiller_cb input:checked ~ span {
  background: rgb(37, 52, 148);
  border-color: rgb(37, 52, 148);
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
  margin-bottom: 0;
  color: white;
  font-family: initial;
}
.chiller_cb span {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
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

.btn-primary {
  border-color: grey;
}

/*radio*/
.custom-control-input {
  display: flex !important;
  min-height: 30px !important;
  padding-left: 1.4rem !important;
  margin-top: 10px !important;
}
.custom-control-label {
  padding-left: 10px !important;
  padding-top: 2px !important;
  display: relative !important;
  color: rgb(170, 170, 170) !important;
  font-family: initial !important;
}
.custom-control {
  display: flex !important;
  padding-left: 1.4rem !important;
  min-height: 32px !important;
}

.custom-control-label::before {
  background-color: rgba(0, 0, 0, 0) !important;
  border: white solid 1px !important;
  width: 0.8rem;
  height: 0.8rem;
  top: 0.32rem;
  left: -1.4rem;
}

.custom-control-input:checked ~ .custom-control-label::before {
  border-color: #99c779 !important;
}

.chiller_cb input:checked ~ span {
  background: #99c779 !important;
  border-color: #99c779 !important;
}

.custom-control-label::after {
  top: 0.24rem !important;
  left: -1.505rem !important;
}
.custom-radio .custom-control-input:checked ~ .custom-control-label::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%2399C779'/%3e%3c/svg%3e") !important;
}
</style>
