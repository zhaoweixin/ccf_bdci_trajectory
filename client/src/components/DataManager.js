import axios from 'axios';

export default class DataManager {
    static getTestData(){
        return axios.get('http://localhost:3000/test')
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