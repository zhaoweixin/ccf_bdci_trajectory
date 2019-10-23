import Vue from "vue";
const mutation = {
  operater_state(state, payload) {
    state.operater_state = JSON.parse(JSON.stringify(payload));
  },
  map_state(state, payload) {
    state.map_state = JSON.parse(JSON.stringify(payload));
  },
  feature_change_state(state, payload) {
    state.feature_change_state = JSON.parse(JSON.stringify(payload));
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
  // date_state(state, payload) {
  //   state.date_state = JSON.parse(JSON.stringify(payload));
  //   //console.log(state.date_state);
  // },
  geohash_state(state, payload) {
    state.geohash_state = JSON.parse(JSON.stringify(payload));
    //console.log(state.geohash_state);
  },
  AllDayHour_state(state, payload) {
    console.log(payload);
    state.AllDayHour_state = JSON.parse(JSON.stringify(payload));
  },
  buses_routes_state(state, payload) {
    state.buses_routes_state = JSON.parse(JSON.stringify(payload));

    //console.log(state.buses_routes_state);
  },
  change_calendar_cluster(state, payload) {
    state.calendar_cluster = JSON.parse(JSON.stringify(payload));
  }
};
export default mutation;
