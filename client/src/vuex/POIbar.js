import * as d3 from "d3";
import DataManager from "../data/DataManager";
var poidata = null;
const POIData = {
  initdata() {
    var POI = function(tsvFile) {
      (async function() {
        const response = await DataManager.getPoiData();

        poidata = response.data[0];
        console.log(poidata);
        // calendardata = data;
        // console.log(calendardata);
      })();
    };

    POI();
  }
};

export default POIData;
