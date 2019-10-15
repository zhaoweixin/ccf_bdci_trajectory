import axios from 'axios';
import qs from 'qs'
export default class DataManager {
    static getLineChartData(data){
        console.log(data)
        return axios.post('http://127.0.0.1:3000/basic_line',qs.stringify(data), {
            'header': {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }
    static getGeoStartData(){
      return axios.get('http://127.0.0.1:3000/query')
    }
    static getHeatmapData(){
        return axios.get('http://127.0.0.1:3000/test')
    }
    /*
    static getTestData(){
        let data = JSON.stringify({
            'dataName': dataName,
        })
        return axios.post('http://localhost:3000/XXXX', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    */
}
