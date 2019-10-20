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
  },
  initchart() {
    var margin = { top: 20, right: 30, bottom: 40, left: 30 },
      width = 560 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);

    var y = d3.scaleBand().rangeRound([0, height], 0.1);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3
      .axisLeft()
      .scale(y)
      .tickSize(0)
      .tickPadding(6);
  }
};

export default POIData;
