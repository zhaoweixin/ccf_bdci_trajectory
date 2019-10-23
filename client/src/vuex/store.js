import Vue from "vue";
import Vuex from "vuex";
import mutation from "./mutation";
import action from "./action";
import getter from "./getter";

Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    // date_state: {},//当前日期
    geohash_state: {
      geohash: ""
    }, //当前geohash
    map_state: {}, //地图图层操作

    buses_routes_state: {}, //公交路线

    operater_state: {
      checkedNames: [],
      picked: ""
    },
    feature_change_state: {
      status: "3",
      config: {
        add: [],
        remove: []
      }
    },
    AllDayHour_state: 0, //传入的值为0、1、2,0代表All，1代表day，2代表hour
    calendar_state: {}, //日历图点击时间段，数据格式[日期,第几个时间段]
    para_state: 1, //点击日历图更新平行坐标，根据点击的类更新
    DATA_STORE: {},
    calendar_state: 0
  },
  mutations: mutation,
  actions: action,
  getters: getter
});

export default store;
