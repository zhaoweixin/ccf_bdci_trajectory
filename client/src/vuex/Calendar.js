import * as d3 from "d3";

var cellSize = null,
  colors = [
    "#a50026",
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#ffffbf",
    "#d9ef8b",
    "#a6d96a",
    "#66bd63",
    "#1a9850",
    "#006837"
  ];
// colors = ["#99C779", "#90BA72", "#86AD6A", "#688752", "#37472C", "#2D3B24"];
var svg = null;
var formatPercent = d3.format(".1%"); //定义一个百分数格式函数，规定百分数精确度小数点后1位
var rect = null;
var events = null;
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
    cellSize = Math.floor(height / 6.5);
    // console.log(cellSize);
    var legendElementWidth = cellSize,
      buckets = 9,
      // alternatively colorbrewer.YlGnBu[9]
      days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets = ["http://localhost:3000/test", "http://localhost:3000/test"];
    console.log(datasets);
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
        "translate(" + margin.left / 0.8 + "," + margin.top + ")"
      );
    // 定义每个年份对应的group旁边的标签
    svg
      .append("text")
      //定义标签文字(年份)的位置以及文字的旋转角度、文字内容
      .attr("transform", "translate(-6," + cellSize + ")rotate(-90)")
      .style("font-family", "sans-serif")
      .style("font-size", 12)
      .style("text-anchor", "middle")
      .style("fill", "white")
      .text(function(d) {
        return d;
      });
    //添加星期
    svg
      .append("g")
      .selectAll("text")
      .data(days)
      .enter()
      .append("text")
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
    // 定义每个年份中代表天的小方格
    rect = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("transform", "translate(" + cellSize * -11 + "," + 0 + ")")
      .selectAll("rect")
      //计算一组小方格的数量，调用d3的timeDays方法，获取两个时间之间的天数，例如，计算从1999年的第一天到2000年的第一天,则参数为new Date(1999,0,1)到 new Date(2000,0,1)，timeDays返回天序列
      .data(function(d) {
        return d3.timeDays(new Date(d, 4, 1), new Date(d, 11, 1));
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
    var nowday = new Array();
    var index = 0;
    var i = -1;
    var now = -1;
    var j = -1;
    var now2 = -1;
    events = rect
      .selectAll("rect")
      .data(function(d) {
        nowday[index++] = d;
        return d3.range(1, 5);
      })
      .enter()
      .append("rect")
      .attr("width", cellSize / 1.2)
      .attr("height", cellSize / 5)
      .attr("x", function(d) {
        ++i;
        if (i % 4 == 0) {
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
        if (j % 4 == 0) {
          now2++;
        }
        return nowday[now2].getDay() * cellSize + ((d - 1) * cellSize) / 5;
      });
    rect.datum(d3.timeFormat("%Y-%m-%d"));
    // 勾勒月份的分割线
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .selectAll("path")
      .data(function(d) {
        return d3.timeMonths(new Date(d, 4, 1), new Date(d, 11, 1));
      })
      .enter()
      .append("path")
      .attr("transform", "translate(" + cellSize * -11 + "," + 0 + ")")
      .attr("d", pathMonth);
  },
  adddata(data) {
    console.log(data);
    var colorScale = d3
      .scaleQuantile()
      .domain([
        0,
        8,
        d3.max(data, function(d) {
          return d.value;
        })
      ])
      .range(colors);
    var index = 0;
    //test data
    var testcolor = new Array();
    var testi = 0;

    var s = rect
      // 定义小方格的填充色，通过每个小方格中的values值来映射颜色函数
      //				.attr("fill", function(d) {
      //					return color(data[d]);
      //				})
      .append("title")
      // 定义小方格的title属性文本为 日期后面加小方格value对应的的百分比格式
      .text(function(d) {
        for (var i = 0; i <= 3; i++) {
          testcolor[testi++] = Math.random() * 50;
        }
        return d;
      });

    // rect.selectAll("rect").attr("fill", function(d) {
    //   console.log(d);
    //   return colorScale(index++);
    // });
    console.log(testcolor);
    rect.selectAll("rect").attr("fill", function(d) {
      return colorScale(testcolor[index++]);
    });
  },
  setrectClick() {
    events.on("click", function(d) {
      alert("s");
    });
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
export default calendar;