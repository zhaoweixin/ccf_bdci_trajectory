import Vue from 'vue'
const mutation = {
    operater_state(state, payload){
        state.operater_state = JSON.parse(JSON.stringify(payload))
    }
}
export default mutation;