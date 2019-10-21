import Vue from "vue";
import Vuex from "vuex";
import mutation from "./mutation";
import action from "./action";
import getter from "./getter";

Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    date_state: {},
    poi_state: {},
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
    map_state: {},
    calendar_state: {}, //日历图点击时间段，数据格式[日期,第几个时间段]
<<<<<<< HEAD
    DATA_STORE: {}
=======
    DATA_STORE:{}
>>>>>>> 3cc515cd50c7a4d9674bf86fe70f7d5fc493cc4e
  },
  mutations: mutation,
  actions: action,
  getters: getter
});

export default store;
