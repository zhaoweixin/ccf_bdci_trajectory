import * as d3 from "d3";
import DataManager from "../data/DataManager";
var POIdata = null;
const POIData = {
  initdata() {
    var POI = function(tsvFile) {
      (async function() {
        const response = await DataManager.getPoiData();
        console.log(response.data);
        // calendardata = data;
        // console.log(calendardata);
      })();
    };

    POI();
  }
};

export default POIData;
