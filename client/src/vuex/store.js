import Vue from "vue";
import Vuex from "vuex";
import mutation from "./mutation";
import action from "./action";
import getter from "./getter";

Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    date_state: {},//当前日期
    geohash_state:{
      'geohash':'w7w3y9'
    },//当前geohash
    map_state: {}, //地图图层操作

    buses_routes_state:{},//公交路线

    operater_state: {
      checkedNames: [],
      picked: ""
    },
    weather_change_state: {
      status: "3",
      config: {
        add: [],
        remove: []
      }
    },

    calendar_state: {}, //日历图点击时间段，数据格式[日期,第几个时间段]
    DATA_STORE: {}
  },
  mutations: mutation,
  actions: action,
  getters: getter
});

export default store;
