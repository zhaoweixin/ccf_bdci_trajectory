<template>
  <div class="funcbar2_warp">
    <div id="charts" style="width:12%; height:100%; float:left">
      <PieChart></PieChart>
    </div>
    <div id="line" style="width:35%;height:100%;float:left">
      <div id="line_chart"></div>
    </div>
    <div id="heatmap" style="width:50%; height:100%; float:right">
      <div id="heatmap_chart"></div>
    </div>
  </div>
</template>
<script>
  import * as d3 from 'd3'
  import PieChart from "../components/PieChart"
  import DataManager from '../data/DataManager'
  export default{
    name: 'page_functionbar2',
    data(){
      return {
        lc_FullWidth : 0,
        lc_FullHeight: 0,
        lc_margin:{},
        lc_width: 0,
        lc_height: 0,
        lc_xScale: undefined,
        lc_yScale: undefined,
        lc_line: undefined,
        lc_dataset: undefined,
        lc_svg: undefined,
        lc_svg_g: undefined,
        lc_legend: undefined,
        lc_legend_circle: undefined,
        lc_legend_text: undefined,
        lc_path: undefined,
        lc_circle: undefined,
        lc_linecolor: ['#99C779','#94FA4D', '#949369', '#564AA1', '#253494'],
        lc_linecount:0
      }
    },
    components: {
      PieChart
    },
    computed:{},
    watch:{},
    methods:{
      init_heatmap(){
        var FullWidth = document.getElementById('heatmap').clientWidth,
          FullHeight = document.getElementById('heatmap').clientHeight,
          margin = { top: FullHeight*0.1, right: FullWidth*0.05, bottom: FullHeight*0.1, left: FullWidth*0.05 },
          width = FullWidth - margin.left - margin.right,
          height = FullHeight - margin.top - margin.bottom,
          gridSize = Math.floor(height / 6.5),
          legendElementWidth = gridSize,
          buckets = 9,
          colors = ["#99C779","#90BA72","#86AD6A","#688752","#37472C","#2D3B24"], // alternatively colorbrewer.YlGnBu[9]
          days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
          datasets = ["http://localhost:3000/test", "http://localhost:3000/test"];

        var svg = d3.select("#heatmap_chart").append("svg")
          .attr("width", FullWidth)
          .attr("height", FullHeight)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", function (d, i) { return i * gridSize; })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
          .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
          .text(function(d) { return d; })
          .attr("x", function(d, i) { return i * gridSize; })
          .attr("y", 0)
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + gridSize / 2 + ", -6)")
          .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

        var heatmapChart = function(tsvFile) {
          (async function(){
            const response = await DataManager.getHeatmapData()
            let data = []
            response.data.forEach( (d,i) => {
              data.push({
                day: +d.day,
                hour: +d.hour,
                value: +d.value
              })
            })
            
            var colorScale = d3.scaleQuantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

            var cards = svg.selectAll(".hour")
              .data(data, function(d) {return d.day+':'+d.hour;});

            cards.append("title");

            cards.enter().append("rect")
              .attr("x", function(d) { return (d.hour - 1) * gridSize; })
              .attr("y", function(d) { return (d.day - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", 'grey')
              .transition().duration(1000)
              .style("fill", function(d){return colorScale(d.value)});

            /*
            cards
                .style("fill", function(d) { return colorScale(d.value); });
            */

            cards.select("title").text(function(d) { return d.value; });

            cards.exit().remove();

            var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
              .attr("class", "legend");

            legend.append("rect")
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", height)
              .attr("width", legendElementWidth)
              .attr("height", gridSize / 2)
              .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
              .attr("class", "mono")
              .text(function(d) { return "≥ " + Math.round(d); })
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", height + gridSize);

            legend.exit().remove();
          })()
        };
        heatmapChart(datasets[0]);

        var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
          .data(datasets);

        datasetpicker.enter()
          .append("input")
          .attr("value", function(d){ return "Dataset " + d })
          .attr("type", "button")
          .attr("class", "dataset-button")
          .on("click", function(d) {
            heatmapChart(d);
          });
      },
      handle_linechart(opt){
        let that = this
        if(opt.status == 0){
          //init
          DataManager.getLineChartData().then((res) => {
            let info = {
              'status': 0,
              'data': res.data,
              'config': opt.config
            }
            that.draw_linechart(info)
          }).catch(err => {
            if(err){
              console.log(err)
              return;
            }
          })
        } else if(opt.status == 1){
          //add
        } else if(opt.status == 2){
          //delete
        }
      },
      draw_linechart(opt){
        let that = this
        if(opt.status == 0){
          this.lc_FullWidth = document.getElementById('line').clientWidth,
          this.lc_FullHeight = document.getElementById('line').clientHeight,
          this.lc_margin = { top: this.lc_FullHeight*0.1, right: this.lc_FullWidth*0.2, bottom: this.lc_FullHeight*0.1, left: this.lc_FullWidth*0.05 },
          this.lc_width = this.lc_FullWidth - this.lc_margin.left - this.lc_margin.right,
          this.lc_height = this.lc_FullHeight - this.lc_margin.top - this.lc_margin.bottom
          // The number of datapoints
          let n = 21;
          // 5. X scale will use the index of our data
          this.lc_xScale = d3.scaleLinear()
              .domain([0, n-1]) // input
              .range([0, that.lc_width]); // output

          // 6. Y scale will use the randomly generate number 
          this.lc_yScale = d3.scaleLinear()
              .domain([0, 1]) // input 
              .range([that.lc_height, 0]); // output 

          // 7. d3's line generator
          this.lc_line = d3.line()
              .x(function(d, i) { return that.lc_xScale(i); }) // set the x values for the line generator
              .y(function(d) { return that.lc_yScale(d.y); }) // set the y values for the line generator
              .curve(d3.curveMonotoneX) // apply smoothing to the line

          let dataset = opt.data
          // 1. Add the SVG to the page and employ #2
          this.lc_svg = d3.select("#line_chart").append("svg")
              .attr("width", that.lc_width + that.lc_margin.left + that.lc_margin.right)
              .attr("height", that.lc_height + that.lc_margin.top + that.lc_margin.bottom)

          // Add the g to contain legend
          this.lc_legend = this.lc_svg.append('g')
            .attr('id', 'line_chart_legend')
            .attr('transform', () =>{
              let x = +that.lc_margin.left + +that.lc_width,
                y = +that.lc_margin.top
                return 'translate(' + x + ',' + y + ')'
            })
          let legend = this.lc_legend.selectAll('.line_legend')
            .data(opt.config.legend)
            .enter()
          
          this.lc_legend_circle = legend.append('circle')
              .attr("class", "line_legend") // Assign a class for styling
              .attr("cx", (d, i) => { return that.lc_width * 0.04 })
              .attr("cy", (d, i) => { return that.lc_height * 0.15 * i + 20})
              .attr("r", 4)
              .style('fill', (d, i) => {return that.lc_linecolor[i]})
              .on('mouseover', circle_handleMouseOver)
              .on('mouseout', circle_handleMouseOut)

          this.lc_legend_text = legend.append('text')
              .attr('x', function(d, i) { return that.lc_width * 0.04 + 10 })
              .attr("y", function(d, i) { return that.lc_height * 0.15 * i  + 3 + 20})
              .text((d,i) => {return d})
              .attr('class', 'legend_text')

          this.lc_svg_g = this.lc_svg.append("g")
              .attr('id', 'line_chart_g')
              .attr("transform", "translate(" + that.lc_margin.left + "," + that.lc_margin.top + ")");

          // 3. Call the x axis in a group tag
          this.lc_svg_g.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate( 0," + +that.lc_height + ")")
              .transition()
              .duration(3000)
              .call(d3.axisBottom(that.lc_xScale)) // Create an axis component with d3.axisBottom
                

          // 4. Call the y axis in a group tag
          this.lc_svg_g.append("g")
              .attr("class", "y axis")
              .transition()
              .duration(3000)
              .call(d3.axisLeft(that.lc_yScale)); // Create an axis component with d3.axisLeft

          //13. append chart title
          this.lc_svg_g.append('text')
            .attr('id', "lc_title")
            .attr('x', that.lc_width/2)
            .attr('y', 0)
            .attr('font-size', '15px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .text(function() {
              return 'TITLE'  // Value of the text
            });

          // 9. Append the path, bind the data, and call the line generator 
          this.lc_path = this.lc_svg_g.append("path")
              .datum(opt.data) // 10. Binds data to the line
              .transition()
              .duration(1000)
              .attr("d", that.lc_line) // 11. Calls the line generator 
              .attr('class', 'line') // Assign a class for styling
              .style('fill', 'none')
              .style('stroke', that.lc_linecolor[that.lc_linecount])
              .style("stroke-width", '3px')

          // 12. Appends a circle for each datapoint 
          this.lc_circle = this.lc_svg_g.selectAll(".dot")
              .data(opt.data)
            .enter().append("circle")
            // Uses the enter().append() method
              .attr("class", "dot") // Assign a class for styling
              .attr("cx", function(d, i) { return that.lc_xScale(i) })
              .attr("cy", function(d) { return that.lc_yScale(d.y) })
              .attr("r", 4)
              .style('fill', that.lc_linecolor[that.lc_linecount])
              .style('stroke', '#fff')
              .style('stroke-width', '1.5px')
              .on('mouseover', circle_handleMouseOver)
              .on('mouseout', circle_handleMouseOut)

          //change color
          this.lc_linecount = this.lc_linecount + 1
        }
        
        // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number

        function circle_handleMouseOver(d, i){
          // Use D3 to select element, change size
          d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 6)
          // Specify where to put label of text
          d3.select('#line_chart_g').append("text")
            .attr('id', "t-" + i)
            .attr('x', that.lc_xScale(d.x) - 30)
            .attr('y', that.lc_yScale(d.y) - 15)
            .attr('fill', 'white')
            .text(function() {
                return "X: " + d.x + " Y: " + +d.y.toFixed(2);  // Value of the text
              });
        }

        function circle_handleMouseOut(d, i){
          d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 4)
          // Select text by id and then remove
          d3.select("#t-" + i).remove();  // Remove text location
        }

              
      }
    },
    mounted(){
      this.init_heatmap()
      this.handle_linechart({
        'status': 0,
        'config': {
          'legend': ['line1'],
          'xAxisText': 'xAxis',
          'yAxisText': 'yAxis'
        }
        //'config': ''
        // 0 init 1 add line 2 delete line
      })
    }
  }
</script>
<style>

  .funcbar2_warp{
    position: absolute;
    z-index: 1;
    width:98%;
    max-height: 90%;
    transform: translate(1%, -5%);
    height:22%;
    bottom: 0;
    overflow:hidden;
    border-radius:.3em;
    box-shadow:0 0 0 1px hsla(0,0%,100%,.3) inset,0 .5em 1em rgba(0,0,0,0.6);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px)
  }

  rect.bordered {
    stroke: #E6E6E6;
    stroke-width:2px;
  }

  text.mono {
    font-size: 9pt;
    font-family: Consolas, courier;
    fill: #aaa;
  }

  text.axis-workweek {
    fill: #000;
  }

  text.axis-worktime {
    fill: #000;
  }
  
/*line chart*/
.line {

}
  
.overlay {
  fill: none;
  pointer-events: all;
}

/* Style the dots by assigning a fill and stroke */
.dot {
    fill: rgb(34 ,94, 168);
    stroke: #fff;
    stroke-width: 2;
}

.focus circle {
  fill: none;
  stroke: steelblue;
}

.axis{
    color: rgb(170,170,170)
}

.tick{
  font-size: 9pt;
    font-family: Consolas, courier;
    fill: #aaa;
}

.legend_text {
  fill: white;
  font-family: initial;
}

</style>
