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
    d3.select("#barchart")
      .append("h5")
      .attr("height", 20)
      .text("订单类型与POI数据");
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
    var poisums = sum(pois);
    var trafficnum = sum(data.trafficdata);
    pois = pois.sort(dsort);
    data.trafficdata = data.trafficdata.sort(dsort);
    var otherpercentage = 0;
    if (pois.length > 6) {
      for (var i = 6; i < pois.length; i++) {
        otherpercentage += pois[i].value;
      }
    }
    var index = 0;
    for (var i = 0; i < pois.length; i++) {
      if (i >= 6) {
        break;
      }
      if (i == 5 && pois.length > 6) {
        result[index++] = {
          name: fnames[i],
          value: otherpercentage / poisums,
          text: "其他",
          percentage: Number((otherpercentage / poisums) * 100).toFixed(2) + "%"
        };
        break;
      }
      result[index++] = {
        name: fnames[i],
        value: pois[i].value / poisums,
        text: pois[i].name,
        percentage: Number((pois[i].value / poisums) * 100).toFixed(2) + "%"
      };
    }
    for (var i = 0; i < data.trafficdata.length; i++) {
      result[index++] = {
        name: fnames[i],
        value: -(data.trafficdata[i].value / trafficnum),
        text: traffictypes[data.trafficdata[i].name],
        percentage:
          Number((data.trafficdata[i].value / trafficnum) * 100).toFixed(2) +
          "%"
      };
    }
    x.domain(
      d3.extent([-1, 1], function(d) {
        return parseInt(d);
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
      .attr("height", y.bandwidth() - 5)
      .append("title")
      .text(function(d) {
        return d.percentage;
      });
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
        if (d.value < 0) return x(-0.9);
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
  },
  getdata(path, geohash) {
    var getdatas = function(tsvFile) {
      (async function() {
        const response = await DataManager.getTableData(
          "http://localhost:3000/query?" + path
        );
        var retdata = response.data;
        if (retdata.length <= 0) {
          retdata = {
            name: geohash,
            trafficdata: []
          };
          POIData.addData(retdata);
        } else {
          var trmap = d3.map(
            d3
              .nest()
              .key(function(d) {
                return d.traffic_type;
              })
              .entries(retdata)
          );
          var keys = trmap.keys();
          var trafficdatas = new Array();
          var index = 0;
          for (var i = 0; i < keys.length; i++) {
            var counts = 0;
            var trtypes = trmap.get(keys[i]).values;
            for (var j = 0; j < trtypes.length; j++) {
              counts = counts + parseInt(trtypes[j].count);
            }

            trafficdatas[index++] = {
              name: parseInt(trmap.get(keys[i]).key),
              value: counts
            };
          }
          retdata = {
            name: geohash,
            trafficdata: trafficdatas
          };
          POIData.addData(retdata);
        }

        // calendardata = data;
      })();
    };
    getdatas(path);
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
function sum(arr) {
  var s = 0;
  arr.forEach(function(d, idx, arr) {
    s += d.value;
  }, 0);

  return s;
}
export default POIData;
