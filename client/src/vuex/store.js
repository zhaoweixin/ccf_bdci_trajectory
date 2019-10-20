import Vue from 'vue'
import Vuex from 'vuex'
import mutation from './mutation'
import action from './action'
import getter from './getter'


Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    operater_state:{
      'checkedNames': [],
      'picked': ''
    },
    feature_change_state:{
      'status':'3',
      'config': {
        'add': [],
        'remove': []
      }
    },
    map_state:{
    },
    DATA_STORE:{}
  },
  mutations:mutation,
  actions:action,
  getters:getter
});

export default store
