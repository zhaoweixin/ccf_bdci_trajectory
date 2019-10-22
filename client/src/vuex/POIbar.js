import * as d3 from "d3";
import DataManager from "../data/DataManager";
var poidata = null;
var svg = null;
var margin = null,
  width = null,
  height = null;
var x = null;
var y = null;
var xAxis = null;
var yAxis = null;
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
    (margin = { top: 20, right: 30, bottom: 40, left: 30 }),
      (width =
        document.getElementById("barchart").clientWidth -
        margin.left -
        margin.right),
      (height =
        document.getElementById("barchart").clientHeight -
        margin.top -
        margin.bottom);

    x = d3.scaleLinear().range([0, width]);

    y = d3.scaleBand().rangeRound([0, height], 0.1);

    xAxis = d3.axisBottom().scale(x);
    yAxis = d3
      .axisLeft()
      .scale(y)
      .tickSize(0)
      .tickPadding(6);
    svg = d3
      .select("#barchart")
      .append("svg")
      .attr("width", width + margin.left)
      .attr("height", height + margin.top);
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
          { name: 1, value: 3 },
          { name: 2, value: 10 },
          { name: 3, value: 3 },
          { name: 4, value: 20 },
          { name: 5, value: 7 },
          { name: 6, value: 15 }
        ]
      };
    }
    var traffictypes = [
      "跨域拼车",
      "企业时租",
      "企业接机套餐",
      "企业送机套餐",
      "拼车",
      "接机",
      "送机"
    ];
    var fnames = ["A", "B", "C", "D", "E", "F"];
    var result = new Array();
    var pois = poidata[data.name];
    pois = pois.sort(dsort);
    data.trafficdata = data.trafficdata.sort(dsort);
    var index = 0;
    for (var i = 0; i < pois.length; i++) {
      if (i >= 6) {
        break;
      }
      result[index++] = {
        name: fnames[i],
        value: pois[i].value,
        text: pois[i].name
      };
    }
    for (var i = 0; i < data.trafficdata.length; i++) {
      result[index++] = {
        name: fnames[i],
        value: -data.trafficdata[i].value,
        text: traffictypes[data.trafficdata[i].name]
      };
    }
    x.domain(
      d3.extent(result, function(d) {
        return parseInt(d.value);
      })
    ).nice();
    y.domain(
      result.map(function(d) {
        return d.name;
      })
    );
    d3.select("#barchart")
      .select("svg")
      .select(".bars")
      .remove();
    svg = d3
      .select("#barchart")
      .select("svg")
      .append("g")
      .attr("class", "bars")
      .attr(
        "transform",
        "translate(" + margin.left / 2 + "," + margin.top / 5 + ")"
      );
    svg
      .selectAll(".bar")
      .data(result)
      .enter()
      .append("rect")
      .attr("class", function(d) {
        return "bar bar--" + (d.value < 0 ? "negative" : "positive");
      })
      .attr("x", function(d) {
        return x(Math.min(0, d.value));
      })
      .attr("y", function(d) {
        return y(d.name);
      })
      .attr("width", function(d) {
        return Math.abs(x(d.value) - x(0));
      })
      .attr("height", y.bandwidth() - 5);
    svg
      .selectAll("text")
      .data(result)
      .enter()
      .append("text")
      .text(function(d) {
        return d.text;
      })
      .attr("transform", function(d) {
        "translate(" + x(d.value) + "," + 0 + ")";
      })
      .attr("x", function(d) {
        if (d.value < 0) return x(d.value - d.text.length * 4);
        else {
          return x(d.value);
        }
      })
      .attr("y", function(d) {
        return y(d.name) + y.bandwidth() / 2;
      });

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    console.log(pois);
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
