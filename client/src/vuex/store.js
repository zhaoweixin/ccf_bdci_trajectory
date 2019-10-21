import Vue from 'vue'
import Vuex from 'vuex'
import mutation from './mutation'
import action from './action'
import getter from './getter'


Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    date_state:{
    },
    poi_state:{
    },
    operater_state:{
      'checkedNames': [],
      'picked': ''
    },
    weather_change_state:{
      'status':'3',
      'config': {
        'add': [],
        'remove': []
      }
    },
<<<<<<< HEAD
    map_state: {},
    calendar_state: {} //日历图点击时间段，数据格式[日期,第几个时间段]
=======
    map_state:{
    }
>>>>>>> d63289f7ef7437b2bd59410c9b020d0d8325fe56
  },
  mutations:mutation,
  actions:action,
  getters:getter
});

export default store
