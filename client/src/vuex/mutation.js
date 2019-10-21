import Vue from "vue";
const mutation = {
  operater_state(state, payload) {
    state.operater_state = JSON.parse(JSON.stringify(payload));
  },
  map_state(state, payload) {
    state.map_state = JSON.parse(JSON.stringify(payload));
  },
  weather_change_state(state, payload) {
    state.weather_change_state = JSON.parse(JSON.stringify(payload));
    // console.log(state.weather_change_state)
  },
  Calendar_change_state(state, payload) {
    state.calendar_state = JSON.parse(JSON.stringify(payload));
  },
  UPDATE_DATA_STORE(state, payload) {
    let name = payload.name,
      data = payload.data;

    state.DATA_STORE[name] = JSON.parse(JSON.stringify(data));
  },
  poi_state(state, payload) {
    state.poi_state = JSON.parse(JSON.stringify(payload));
    // console.log(state.poi_state);
  },
  date_state(state, payload) {
    state.date_state = JSON.parse(JSON.stringify(payload));
    //console.log(state.date_state);
  } 
};
export default mutation;
