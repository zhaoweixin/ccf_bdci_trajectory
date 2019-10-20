import Vue from "vue";
const mutation = {
    operater_state(state, payload){
        state.operater_state = JSON.parse(JSON.stringify(payload))
    },
    map_state(state,payload){
      state.map_state = JSON.parse(JSON.stringify(payload))
    },
    feature_change_state(state, payload){
      state.feature_change_state = JSON.parse(JSON.stringify(payload))
    },
    UPDATE_DATA_STORE(state, payload){
      let name = payload.name,
        data = payload.data
      state.DATA_STORE[name] = JSON.parse(JSON.stringify(data))
    }
};
export default mutation;
