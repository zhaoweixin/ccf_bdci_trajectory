import axios from "axios";
import qs from "qs";
var DataStore = {};
export default class DataManager {
  static getLineChartData(data) {
    return axios.post("http://127.0.0.1:3000/basic_line", qs.stringify(data), {
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
  static getGeoStartData() {
    return axios.get("http://127.0.0.1:3000/query");
  }
  static getHeatmapData() {
    return axios.get("http://127.0.0.1:3000/test");
  }
  static getFeature(data) {
    return axios.post(
      "http://localhost:3000/feature_line",
      qs.stringify(data),
      {
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
  }
  static getRectDetail(data){
    /*
    {
      'geohash': 'w7w3y9'
    }
    */
    return axios.post("http://localhost:3000/rect_detail",qs.stringify(data),{header:{"Content-Type": "application/x-www-form-urlencoded"}})
  }
  static getTableData(path) {
    return axios.get(path);
  }
  static getPoiData() {
    return axios.get("http://127.0.0.1:3000/poi_data");
  }
  static getParaData(data){
    return axios.post("http://127.0.0.1:3000/para_line", qs.stringify(data), {
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
  /*
import axios from "axios";
import qs from "qs";
export default class DataManager {
  static getLineChartData(data) {
    return axios.post("http://127.0.0.1:3000/basic_line", qs.stringify(data), {
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
  
  static getVectorData(path) {
    return axios.get(path);
  }
  static getGeoStartData() {
    return axios.get("http://127.0.0.1:3000/query");
  }
  static getHeatmapData() {
    return axios.get("http://127.0.0.1:3000/test");
  }
  static getWeather() {
    return axios.get("http://localhost:3000/weather", {
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
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
