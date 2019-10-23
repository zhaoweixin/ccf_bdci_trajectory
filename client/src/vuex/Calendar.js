import * as d3 from "d3";
import DataManager from "../data/DataManager";
import store from "../vuex/store";
var calendardata = null;
var nowday = new Array(); //存储日历图日期数据
var THIS = null;
var cellSize = null,
  colors = [
    "#3E5948",
    "#66425A",
    "#495270",
    "#706C49",
    "#664C42",
    "#57534A",
    "#63A67C",
    "#74A686"
  ],
  colors2 = [
    "#efac0e",
    "#efe102",
    "#cff9bb",
    "#c2ef39",
    "#02f48b",
    "#0aeafa",
    "#348def",
    "#6067ea"
  ];

var svg = null;
var formatPercent = d3.format(".1%"); //定义一个百分数格式函数，规定百分数精确度小数点后1位
var rect = null;
var events = null;
var colorScale = d3
  .scaleQuantile()
  .domain(d3.range(0, 8))
  .range(colors);
var colorScale2 = d3
  .scaleQuantile()
  .domain(d3.range(0, 8))
  .range(colors2);
const calendar = {
  init_heatmap() {
    var FullWidth = document.getElementById("heatmap").clientWidth;
    var FullHeight = document.getElementById("heatmap").clientHeight;
    var margin = {
        top: FullHeight * 0.1,
        right: FullWidth * 0.05,
        bottom: FullHeight * 0.1,
        left: FullWidth * 0.05
      },
      width = FullWidth - margin.left - margin.right,
      height = FullHeight - margin.top - margin.bottom;
    cellSize = Math.floor(height / 6) - 2;
    // console.log(cellSize);

    // alternatively colorbrewer.YlGnBu[9]
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    svg = d3
      .select("#heatmap_chart")
      .selectAll("svg")
      .data(d3.range(2017, 2018))
      .enter()
      .append("svg")
      .attr("width", FullWidth)
      .attr("height", FullHeight)
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left / 0.8 + "," + margin.top / 2 + ")"
      );
    // 定义每个年份对应的group旁边的标签
    svg
      .append("text")
      //定义标签文字(年份)的位置以及文字的旋转角度、文字内容
      .attr("transform", "translate(5," + cellSize + ")rotate(-90)")
      .style("font-family", "sans-serif")
      .style("font-size", 12)
      .style("text-anchor", "middle")
      .style("fill", "rgb(170,170,170)")
      .text(function(d) {
        return d;
      });
    svg
      .append("text")
      //定义标签文字(年份)的位置以及文字的旋转角度、文字内容
      .attr("transform", "translate(5," + cellSize * 3 + ")rotate(-90)")
      .style("font-family", "sans-serif")
      .style("font-size", 12)
      .style("text-anchor", "middle")
      .style("fill", "rgb(170,170,170)")
      .text("聚类日历图");
    //添加星期
    svg
      .append("g")
      .selectAll("text")
      .data(days)
      .enter()
      .append("text")
      .style("fill", "rgb(170,170,170)")
      .attr("transform", function(d, i) {
        if (i <= 6) {
          return "translate(25," + cellSize * 3.5 + ")";
        }
      })

      .attr("font", "10px Microsoft YaHei")
      .attr("fill", "white")
      .attr("y", function(d, i) {
        switch (i) {
          case 0:
            return -3 * cellSize * 0.9;
          case 1:
            return -2 * cellSize * 0.9;
          case 2:
            return -1 * cellSize * 0.9;
          case 3:
            return cellSize * 0.1;
          case 4:
            return 1 * cellSize * 1.2;
          case 5:
            return 2 * cellSize * 1.1;
          case 6:
            return 3 * cellSize * 1.1;
        }
      })
      .text(function(d) {
        return d;
      });

    // 勾勒月份的分割线
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "white")
      .selectAll("path")
      .data(function(d) {
        return d3.timeMonths(new Date(d, 4, 1), new Date(d, 9, 1));
      })
      .enter()
      .append("path")
      .attr("transform", "translate(" + cellSize * -11 + "," + 0 + ")")
      .attr("d", pathMonth);
    this.drawday();
    // drawhour();
  },
  houradddata(data) {
    var index = 0;
    //test data
    var testcolor = new Array();
    var testi = 0;
    var s = rect
      .selectAll("rect")
      // 定义小方格的填充色，通过每个小方格中的values值来映射颜色函数
      //				.attr("fill", function(d) {
      //					return color(data[d]);
      //				})
      .append("title", function(d) {})

      // 定义小方格的title属性文本为 日期后面加小方格value对应的的百分比格式
      .text(function(d) {
        if (index < data.length) return data[index++]["date"] + ":" + (d - 1);
        return d;
      });
    var indexs = 0;
    rect
      .selectAll("rect")
      .attr("fill", function(d) {
        if (indexs < data.length) return colorScale2(data[indexs++].value);
      })
      .on("mouseover", function(d) {
        var tcolor = d3.select(this).attr("fill");
        var ca = d3
          .select(".rects")
          .selectAll("rect")
          .attr("opacity", function(d) {
            if (d3.select(this).attr("fill") != tcolor) {
              return 0.3;
            }
          });
      })
      .on("mouseout", function(d) {
        var tcolor = d3.select(this).attr("fill");
        var ca = d3
          .select(".rects")
          .selectAll("rect")
          .attr("opacity", function(d) {
            if (d3.select(this).attr("fill") != null) {
              return 1;
            }
          });
      });
    this.hoursetrectClick();
  },
  dayadddata(data) {
    var indexs = 0;
    svg
      .select(".rects")
      .selectAll("rect")
      .attr("fill", function(d) {
        if (indexs < data.length) return colorScale(data[indexs++].value);
      })
      .on("mouseover", function(d) {
        var tcolor = d3.select(this).attr("fill");
        var ca = d3
          .select(".rects")
          .selectAll("rect")
          .attr("opacity", function(d) {
            if (d3.select(this).attr("fill") != tcolor) {
              return 0.3;
            }
          });
      })
      .on("mouseout", function(d) {
        var tcolor = d3.select(this).attr("fill");
        var ca = d3
          .select(".rects")
          .selectAll("rect")
          .attr("opacity", function(d) {
            if (d3.select(this).attr("fill") != null) {
              return 1;
            }
          });
      });
  },
  hoursetrectClick() {
    events.on("click", function(d) {
      var newValue = d3
        .select(this)
        .select("title")
        .text();
      newValue = newValue.split(":");
      store.commit("Calendar_change_state", newValue);
    });
  },
  drawhour() {
    // 定义每个年份中代表天的小方格
    svg.select(".rects").remove();
    rect = svg
      .append("g")
      .attr("class", "rects")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("transform", "translate(" + cellSize * -11 + "," + 0 + ")")
      .selectAll("rect")
      //计算一组小方格的数量，调用d3的timeDays方法，获取两个时间之间的天数，例如，计算从1999年的第一天到2000年的第一天,则参数为new Date(1999,0,1)到 new Date(2000,0,1)，timeDays返回天序列
      .data(function(d) {
        return d3.timeDays(new Date(d, 4, 1), new Date(d, 9, 1));
      })
      .enter()
      .append("g")
      .attr("width", cellSize / 1.2)
      .attr("height", cellSize)
      // 返回一年有多少个周，确定一组小方格的横向位置
      .attr("x", function(d) {
        return (d3.timeWeek.count(d3.timeYear(d), d) * cellSize) / 1.2;
      })
      // 返回天，确定一组小方格的纵向位置
      .attr("y", function(d) {
        return d.getDay() * cellSize;
      });
    // 定义当前小方格上对应的日期的格式

    var index = 0;
    var i = -1;
    var now = -1;
    var j = -1;
    var now2 = -1;
    events = rect
      .selectAll("rect")
      .data(function(d) {
        nowday[index++] = d;
        return d3.range(1, 6);
      })
      .enter()
      .append("rect")
      .attr("width", cellSize / 1.2)
      .attr("height", cellSize / 6)
      .attr("x", function(d) {
        ++i;
        if (i % 5 == 0) {
          now++;
        }
        return (
          (d3.timeWeek.count(d3.timeYear(nowday[now]), nowday[now]) *
            cellSize) /
          1.2
        );
      })
      .attr("y", function(d) {
        j += 1;
        if (j % 5 == 0) {
          now2++;
        }
        return nowday[now2].getDay() * cellSize + ((d - 1) * cellSize) / 6;
      });
    rect.datum(d3.timeFormat("%Y-%m-%d"));
    addLegend(8);

    inithourdata();
  },
  drawday() {
    // 定义每个年份中代表天的小方格
    svg.select(".rects").remove();
    rect = svg
      .append("g")
      .attr("class", "rects")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("transform", "translate(" + cellSize * -11 + "," + 0 + ")")
      .selectAll("rect")
      //计算一组小方格的数量，调用d3的timeDays方法，获取两个时间之间的天数，例如，计算从1999年的第一天到2000年的第一天,则参数为new Date(1999,0,1)到 new Date(2000,0,1)，timeDays返回天序列
      .data(function(d) {
        return d3.timeDays(new Date(d, 4, 1), new Date(d, 9, 1));
      })
      .enter()
      .append("rect")
      .attr("width", cellSize / 1.2)
      .attr("height", cellSize)
      // 返回一年有多少个周，确定一组小方格的横向位置
      .attr("x", function(d) {
        return (d3.timeWeek.count(d3.timeYear(d), d) * cellSize) / 1.2;
      })
      // 返回天，确定一组小方格的纵向位置
      .attr("y", function(d) {
        return d.getDay() * cellSize;
      })
      .on("click", function(d) {
        var newValue = d3
          .select(this)
          .select("title")
          .text();
        //store.commit("Calendar_change_state", [newValue]);
      })
      .datum(d3.timeFormat("%Y-%m-%d"))
      .append("title")
      // 定义小方格的title属性文本为 日期后面加小方格value对应的的百分比格式
      .text(function(d) {
        return d;
      });

    // 定义当前小方格上对应的日期的格式
    initdaydata();
    addLegend(6);
  }
};
// 定义月份分割线路径
function pathMonth(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
    d0 = t0.getDay(),
    w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
    d1 = t1.getDay(),
    w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
  return (
    "M" +
    ((w0 + 1) * cellSize) / 1.2 +
    "," +
    d0 * cellSize +
    "H" +
    (w0 * cellSize) / 1.2 +
    "V" +
    7 * cellSize +
    "H" +
    (w1 * cellSize) / 1.2 +
    "V" +
    (d1 + 1) * cellSize +
    "H" +
    ((w1 + 1) * cellSize) / 1.2 +
    "V" +
    0 +
    "H" +
    ((w0 + 1) * cellSize) / 1.2 +
    "Z"
  );
}
function inithourdata() {
  var heatmapChart = function(path) {
    (async function() {
      const response = await DataManager.getTableData(path);
      let data = [];

      response.data.forEach((d, i) => {
        data.push({
          date: d.date,
          timeSeparete: d.timeSeparete,
          value: d.cluster
        });
      });
      calendardata = data;
      // console.log(calendardata);
      calendar.houradddata(data);
    })();
  };
  heatmapChart("http://localhost:3000/query?table=vector");
}

function initdaydata() {
  var heatmapChart = function(path) {
    (async function() {
      const response = await DataManager.getTableData(path);
      let data = [];

      response.data.forEach((d, i) => {
        data.push({
          date: d.date,
          value: d.cluster
        });
      });
      calendardata = data;
      // console.log(calendardata);
      calendar.dayadddata(data);
    })();
  };
  heatmapChart("http://localhost:3000/query?table=vector_day");
}

function addLegend(num) {
  var Dates = new Date(2017, 8, 29);
  var legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("fill", "none")
    .attr("stroke", "#000");
  var legendrects = legend
    .selectAll("rect")
    .data(d3.range(0, num))
    .enter()
    .append("rect")
    .attr("width", cellSize / 1.2)
    .attr("height", cellSize / 4)
    .attr("x", function(d) {
      return d3.timeWeek.count(d3.timeYear(Dates), Dates) * cellSize * 0.58;
    })
    .attr("y", function(d) {
      return ((d - 1) * cellSize) / 4;
    })
    .attr("fill", function(d) {
      if (num == 6) return colorScale(d);
      else {
        return colorScale2(d);
      }
    })
    .on("mouseover", function(d) {
      var tcolor = d3.select(this).attr("fill");
      var ca = d3
        .select(".rects")
        .selectAll("rect")
        .attr("opacity", function(d) {
          if (d3.select(this).attr("fill") != null) {
            if (d3.select(this).attr("fill") != tcolor) {
              return 0.3;
            }
          }
        });
    })
    .on("mouseout", function(d) {
      var tcolor = d3.select(this).attr("fill");
      var ca = d3
        .select(".rects")
        .selectAll("rect")
        .attr("opacity", function(d) {
          if (d3.select(this).attr("fill") != null) {
            return 1;
          }
        });
    })
    .on('click', function(d){
      store.commit('calendar_click_state', d)
      console.log('click ', "第" + (d + 1) + "类")
    })
    .append("title")
    .text(function(d) {
      return "第" + (d + 1) + "类";
    });
}
export default calendar;
