<template>
  <div id="pieChart" class="piechart"></div>
</template>
<script>
  import * as d3 from "d3";

  export default {
    name: 'pieChart',
    data() {
      return {
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        var width = document.getElementById('pieChart').clientWidth;
        var height = document.getElementById('pieChart').clientHeight;
        var dataset = [100,200,300,0,1100,1000,900,800,700,600,500,400];
        var rdata = [1,1,1,1,1,1,1,1,1,1,1,1]

        var max_index = 0, min_index = 0;

        for (let index = 0; index < dataset.length; index++) {
          if(dataset[index] == d3.max(dataset)){
            max_index = index
            break
          }
        }

        for (let index = 0; index < dataset.length; index++) {
          if(dataset[index] == d3.min(dataset)){
            min_index = index
            break
          }
        }

        var svg = d3.select("body")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

        var pie = d3.pie();
        var piedata = pie(rdata);

        var outerRadius = 170; //外半径
        var innerRadius = 130; //内半径

        var KOUSHAOLV = d3.rgb(93, 190, 138)
        var HEYELV = d3.rgb(26, 104, 64)

        var color = d3.interpolate(KOUSHAOLV, HEYELV);
        var linear = d3.scaleLinear()
          .domain([0, 1200])
          .range([0, 1])

        var arc = d3.arc() //弧生成器
          .innerRadius(innerRadius) //设置内半径
          .outerRadius(outerRadius); //设置外半径

        var arcs = svg.selectAll("g")
          .attr("class","chart")
          .data(piedata)
          .enter()
          .append("g")
          .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        arcs.append("path")
          .attr("fill", function (d,i) {
            return color(linear(dataset[i]));
          })
          .attr("d", function (d) {
            return arc(d);
          });

          var marker = d3.symbol()
            .size(100)
            .type(d3.symbolTriangle)

          svg.append("g")
            .attr("transform", function () {
              let widthT = Math.sin((piedata[max_index].startAngle + piedata[max_index].endAngle)/2) * (innerRadius-10)
              let heightT = Math.cos((piedata[max_index].startAngle + piedata[max_index].endAngle)/2) * (innerRadius-10)
              return "translate(" + (width / 2 + widthT)+ "," + (height / 2 - heightT) + ")"
            })
            .append("path")
            .attr("d",marker)
            .attr("fill",color(linear(dataset[max_index])))
            .attr("transform", function () {
              let ang = (max_index - 0.5)*(2 * Math.PI) /12
              return "rotate(" + (ang - Math.PI / 2) / Math.PI * 180 + ")";
            })

          svg.append("g")
            .attr("transform", function () {
              let widthT = Math.sin((piedata[min_index].startAngle + piedata[min_index].endAngle)/2) * (innerRadius-10)
              let heightT = Math.cos((piedata[min_index].startAngle + piedata[min_index].endAngle)/2) * (innerRadius-10)
              return "translate(" + (width / 2 + widthT)+ "," + (height / 2 - heightT) + ")"
            })
            .append("path")
            .attr("d",marker)
            .attr("fill",color(linear(dataset[min_index])))
            .attr("transform", function () {
              let ang = (min_index - 0.5)*(2 * Math.PI) /12
              return "rotate(" + (ang - Math.PI / 2) / Math.PI * 180 + ")";
            })

          var updataMark = svg.selectAll("g")
            .attr("class","chart")
            .data(piedata)
            .enter()
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")

          updataMark.append("path")
            .attr("d", function (d) {
              return marker(d);
            })
            .attr("fill", function (d,i) {
              return color(linear(dataset[i]));
            })


      }
    },
  }
</script>
<style>
  .piechart {
    width: 100%;
    height: 100%;
  }
</style>