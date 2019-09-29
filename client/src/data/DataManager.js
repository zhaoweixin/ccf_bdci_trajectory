import axios from 'axios';

export default class DataManager {
    static getLineChartData(){
        return axios.post('http://127.0.0.1:3000/basic_line')
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
