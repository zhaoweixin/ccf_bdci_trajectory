import * as d3 from "d3";
import DataManager from "../data/DataManager";
var poidata = null;
var svg = null;
const POIData = {
  initdata() {
    var POI = function(tsvFile) {
      (async function() {
        const response = await DataManager.getPoiData();
        poidata = response.data[0];
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
    svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  },
  /*
=================
data格式:data={name:xxx,OrderType:xxx}
name为所点击方块的geohash值,OrderType为订单类型数据
=================
*/
  addData(data) {
    if (data == null) {
      data = {
        name: "w7w3wx",
        trafficdata: [
          { nmae: "A", value: -3 },
          { nmae: "B", value: -10 },
          { nmae: "C", value: -3 },
          { nmae: "D", value: -3 },
          { nmae: "E", value: -3 }
        ]
      };
    }
    pois = poidata[data.name];
  }
};
//排序函数,从大到小排列
function dsort(a, b) {
  return a.value < b.value
    ? 1
    : a.value > b.value
    ? -1
    : a.value >= b.value
    ? 0
    : NaN;
}
export default POIData;
