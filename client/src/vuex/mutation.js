import Vue from 'vue'
const mutation = {
    operater_state(state, payload){
        state.operater_state = JSON.parse(JSON.stringify(payload))
    },
    map_state(state,payload){
      state.map_state = JSON.parse(JSON.stringify(payload))
    },
    weather_change_state(state, payload){
      state.weather_change_state = JSON.parse(JSON.stringify(payload))
      console.log(state.weather_change_state)
    }
};
export default mutation;
