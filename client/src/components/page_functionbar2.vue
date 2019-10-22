<template>
  <div class="funcbar2_warp">
    <!-- <div id="pie" style="width:12%; height:100%; float:left">
      <div id="pie_chart"></div>
    </div> -->
    <div id="line" style="width:49%;height:100%;float:left">
      <div id="line_chart"></div>
    </div>
    <div id="heatmap" style="width:50%; height:100%; float:right">
      <div id="heatmap_chart"></div>
    </div>
  </div>
</template>
<script>
  import * as d3 from 'd3'
  import DataManager from '../data/DataManager'
  import var_config from '../assets/var_config.js'
  import calendar from "@/vuex/Calendar.js"
  
  import $ from 'jquery'
  export default{
    name: 'page_functionbar2',
    data(){
      return {
        var_config: var_config,
        lc_FullWidth : 0,
        lc_FullHeight: 0,
        lc_margin:{},
        lc_width: 0,
        lc_height: 0,
        lc_xScale: undefined, //线图默认x轴比例尺 0-1 / 0-width
        lc_yScale: undefined, //线图默认y轴比例尺 0-1 / height-0
        lc_xScaleText_arr:[], //存储线图中不同线段的x对应真实数值的比例尺 0-1 / datamin-datamax
        lc_yScaleText_arr: [], //存储线图中不同线段的y对应真实数值的比例尺 0-1 / datamin-datamax
        lc_line_generator:{},
        lc_line: undefined,  //初始线段生成器
        lc_svg: undefined, //legend and svg container
        lc_svg_g: undefined, // axis and path container
        lc_legend: undefined, // legend container
        lc_legend_circle: undefined, // legend circle
        lc_legend_text: undefined, // legend text
        lc_pathcount: 0, //line path count
        lc_linecolor: ['#99C70A', '#FFFFFF','#FFF93B', '#2100FF', '#FF8C3B'],
        last_axis_type: null,
        his_feature_config:{
          checkedNames: [],
          status: '3'
        }
      }
    },
    components: {
    },
    computed:{
      operater_state () {
        return this.$store.state.operater_state
      },
      feature_change_state () {
        return this.$store.state.feature_change_state
      }
    },
    watch:{
      operater_state: function(val, oldVal){
        this.handle_operater_state()
      },
      feature_change_state (val, oldVal) {
        this.handle_feature_change_state()
      }
    },
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
          colors = ["#0B234F", "#1D3E13", "#9C762B", "#88491D", "#4F100B", "#37204A"],
          //colors = ["#99C779","#90BA72","#86AD6A","#688752","#37472C","#2D3B24"], // alternatively colorbrewer.YlGnBu[9]
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
      handle_operater_state(){
        let that = this
        let opt = {
          'status': this.operater_state.status,
          'config': {
            'legend': [],
            'legend_val': [],
            'unit': this.operater_state.picked
          }
        },
        except_angle_index = null,
        t_operater_state = this.operater_state.checkedNames.filter(d => d != '2')
        //划分出piechart 的数据 需要在handle_piechart内处理
        opt.config.legend_val = t_operater_state

        t_operater_state.forEach((d,i) => {
          opt.config.legend.push(that.var_config.operater[d].legend)
        })

        this.handle_linechart(opt)

        //this.handle_piechart(opt)
      },
      handle_linechart(opt){
        let that = this

        if(opt.status == '0'){
          //init
          let req = {
            'legend': opt.config.legend,
            'unit': opt.config.unit
          },
          info = {
              'status': 0,
              'data': [],
              'config': {
                'legend': [],
                'legend_val': [],
                'unit': opt.config.unit
              }
          },//draw
          requestInfo = {
            'config': {
              'legend': [],
              'legend_val':[],
              'unit': opt.config.unit
            },
            'status': opt.status
          }//request

          opt.config.legend_val.forEach((d,i) => {
            let dataName = opt.config.unit + d
            if(that.$store.state.DATA_STORE.hasOwnProperty(dataName)){
              info.data.push(that.$store.state.DATA_STORE[dataName])
              info.config.legend.push(opt.config.legend[i])
              info.config.legend_val.push(d)
            } else {
              requestInfo.config.legend.push(opt.config.legend[i])
              requestInfo.config.legend_val.push(d)
            }
          })

          //forbidden reload error
          console.log(requestInfo.config.legend_val)
          if(requestInfo.config.legend_val.length != 0){
            DataManager.getLineChartData(requestInfo).then((res) => {
            requestInfo.config.legend_val.forEach((d,i) => {
              let dataName = requestInfo.config.unit + d
              if(!that.$store.state.DATA_STORE.hasOwnProperty(dataName)){
                that.$store.commit('UPDATE_DATA_STORE', {'name': dataName, 'data': res.data[i]})
              }
            })
            requestInfo.config.legend_val.forEach((v,j) => {
              info.config.legend.push(requestInfo.config.legend[j])
              info.config.legend_val.push(v)
              info.data.push(res.data[j])
            })
            that.draw_linechart(info)
            }).catch(err => {
              if(err){
                console.log(err)
                return;
              }
            })
          }




        } else if(opt.status == '1'){
          //add
        } else if(opt.status == '2'){
          //delete
        } else if(opt.status == '3'){
          //updates all
          let req = {
            'legend': opt.config.legend_val,
            'unit': opt.config.unit
          },
          info = {
              'status': opt.status,
              'data': [],
              'config': {
                'legend': [],
                'legend_val': [],
                'unit': opt.config.unit
              }
          },//draw
          requestInfo = {
            'config': {
              'legend': [],
              'legend_val':[],
              'unit': opt.config.unit
            },
            'status': opt.status
          }//request

          opt.config.legend_val.forEach((d,i) => {
            let dataName = opt.config.unit + d
            if(that.$store.state.DATA_STORE.hasOwnProperty(dataName)){
              info.data.push(that.$store.state.DATA_STORE[dataName])
              info.config.legend.push(opt.config.legend[i])
              info.config.legend_val.push(d)
            } else {
              requestInfo.config.legend.push(opt.config.legend[i])
              requestInfo.config.legend_val.push(d)
            }
          })


          //forbidden reload error
          console.log(requestInfo.config.legend_val)
          if(requestInfo.config.legend.length != 0){
            DataManager.getLineChartData(requestInfo).then((res) => {

              requestInfo.config.legend_val.forEach((d,i) => {
                let dataName = requestInfo.config.unit + d
                if(!that.$store.state.DATA_STORE.hasOwnProperty(dataName)){
                  that.$store.commit('UPDATE_DATA_STORE', {'name': dataName, 'data': res.data[i]})
                }
              })

              requestInfo.config.legend_val.forEach((v,j) => {
                info.config.legend.push(requestInfo.config.legend[j])
                info.config.legend_val.push(v)
                info.data.push(res.data[j])
              })
              that.draw_linechart(info)
            }).catch(err => {
              if(err){
                console.log(err)
                return;
              }
            })
          }else if(requestInfo.config.legend.length == 0){
            that.draw_linechart(info)
          }
        }
      },
      draw_linechart(opt){
        let that = this
        this.last_axis_type = opt.config.unit

        if(opt.status == 0){
          let that = this
          this.lc_FullWidth = document.getElementById('line').clientWidth,
          this.lc_FullHeight = document.getElementById('line').clientHeight,
          this.lc_margin = { top: this.lc_FullHeight*0.1, right: this.lc_FullWidth*0.2, bottom: this.lc_FullHeight*0.1, left: this.lc_FullWidth*0.1 },
          this.lc_width = this.lc_FullWidth - this.lc_margin.left - this.lc_margin.right,
          this.lc_height = this.lc_FullHeight - this.lc_margin.top - this.lc_margin.bottom
          let yScaleMin = Math.min.apply(null, opt.data[0].yScale),
          yScaleMax = Math.max.apply(null, opt.data[0].yScale),
          xScaleMin = Math.min.apply(null, opt.data[0].xScale),
          xScaleMax = Math.max.apply(null, opt.data[0].xScale)
          // The number of datapoints
          let n = 21;
          // 5. X scale will use the index of our data
          this.lc_xScale = d3.scaleLinear().domain([0, 1]).range([0, that.lc_width])
          this.lc_yScale = d3.scaleLinear().domain([0, 1]).range([that.lc_height, 0])

          this.lc_xScaleLine = d3.scaleLinear()
              .domain([0, 1]) // input
              .range([0, that.lc_width]); // output

          // 6. Y scale will use the randomly generate number
          this.lc_yScaleLine = d3.scaleLinear()
              .domain([0, 1]) // input
              .range([that.lc_height, 0]); // output

          this.lc_xScaleAxis = d3.scaleLinear()
              .domain([xScaleMin, xScaleMax]) // input
              .range([0, that.lc_width]); // output

          this.lc_yScaleAxis = d3.scaleLinear()
              .domain([yScaleMin, yScaleMax]) // input
              .range([that.lc_height, 0]); // output

          // 7. d3's line generator
          this.lc_line = d3.line()
              .x(function(d, i) { return that.lc_xScaleLine(d.x); }) // set the x values for the line generator
              .y(function(d) { return that.lc_yScaleLine(d.y); }) // set the y values for the line generator
              .curve(d3.curveMonotoneX) // apply smoothing to the line

          if(!this.lc_line_generator.hasOwnProperty(opt.config.unit)){
            let unit = opt.config.unit
            this.lc_line_generator[unit] = {}
            this.lc_line_generator[unit]['xScaleLine'] = this.lc_xScaleLine
            this.lc_line_generator[unit]['yScaleLine'] = this.lc_yScaleLine
            this.lc_line_generator[unit]['xScaleAxis'] = this.lc_xScaleAxis
            this.lc_line_generator[unit]['yScaleAxis'] = this.lc_yScaleAxis
            this.lc_line_generator[unit]['generator'] = this.lc_line
          }

          // 1. Add the SVG to the page and employ #2
          this.lc_svg = d3.select("#line_chart").append("svg")
              .attr("width", that.lc_width + that.lc_margin.left + that.lc_margin.right)
              .attr("height", that.lc_height + that.lc_margin.top + that.lc_margin.bottom)

          // Add the g to contain legend
          this.lc_legend = this.lc_svg.append('g')
            .attr('id', 'line_chart_legend')
            .attr('transform', () => {
              let x = +that.lc_margin.left + +that.lc_width,
                y = +that.lc_margin.top
                return 'translate(' + x + ',' + y + ')'
            })

          let legend = this.lc_legend.selectAll('.legend_line')
            .data(opt.config.legend)
            .enter()

          this.lc_legend_circle = legend.append('circle')
              .attr("class", "legend_line") // Assign a class for styling
              .attr("cx", (d, i) => { return that.lc_width * 0.04 })
              .attr("cy", (d, i) => { return that.lc_height * 0.15 * i + 20})
              .attr("r", 2)
              .style('fill', (d, i) => {return that.lc_linecolor[i]})
              .style('opacity', 0)
              .transition()
              .duration(3000)
              .style('opacity', 1)

          //title
          this.lc_legend_text = legend.append('text')
              .attr('x', function(d, i) { return that.lc_width * 0.04 + 10 })
              .attr("y", function(d, i) { return that.lc_height * 0.15 * i  + 3 + 20})
              .text((d,i) => {return d})
              .style('opacity', 0)
              .attr('class', 'legend_text')
              .transition()
              .duration(3000)
              .style('opacity', 1)

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
            .attr('fill', 'rgb(170, 170, 170)')
            .text(function() {
              return 'TITLE'  // Value of the text
            });

          // 9. Append the path, bind the data, and call the line generator

          // 12. Appends a circle for each datapoint
          this.lc_pathcount = opt.data.length
          for(var i=0; i<opt.data.length; i++){
            let draw_data = opt.data[i].values
            let yScaleMin = opt.data[i].yScale[0],
              yScaleMax = opt.data[i].yScale[1],
              xScaleMin = opt.data[i].xScale[0],
              xScaleMax = opt.data[i].xScale[1]

            this.lc_xScaleText_arr = []
            this.lc_yScaleText_arr = []

            this.lc_xScaleText_arr.push(d3.scaleLinear().domain([0, 1]).range([xScaleMin, xScaleMax]))
            this.lc_yScaleText_arr.push(d3.scaleLinear().domain([0, 1]).range([yScaleMin, yScaleMax]))

            this.lc_svg_g.append("path")
              .data(draw_data) // 10. Binds data to the line
              .attr("d", that.lc_line_generator[opt.config.unit].generator(draw_data)) // 11. Calls the line generator
              .attr('num', i)
              .attr('class', () => {return 'line-' + i + ' line'}) // Assign a class for styling
              .style('fill', 'none')
              .style('stroke', that.lc_linecolor[i])
              .style("stroke-width", '1px')
              .style('opacity', 0)
              .transition()
              .duration(1500)
              .style('opacity', 1)


            this.lc_svg_g.selectAll(".ddot")
              .data(draw_data)
            .enter().append("circle")
            // Uses the enter().append() method
              .attr("class", () => {return 'dot-' + i + ' dot'}) // Assign a class for styling
              .attr("cx", function(d, i) {return that.lc_line_generator[opt.config.unit]['xScaleLine'](d.x)})
              .attr("cy", function(d, i) {return that.lc_line_generator[opt.config.unit]['yScaleLine'](d.y)})
              .attr("r", 2)
              .attr("linenum", i)
              .attr('unit', opt.config.unit)
              .style('fill', that.lc_linecolor[i])
              .style('stroke', '#fff')
              .style('stroke-width', '1.5px')
              .on('mouseover', circle_handleMouseOver)
              .on('mouseout', circle_handleMouseOut)
              .style('opacity', 0)
              .transition()
              .duration(1500)
              .style('opacity', 1)
          }
          //change color
          this.lc_linecount = this.lc_linecount + 1
        } else if(opt.status == 3){
          d3.selectAll('.line').transition().duration(1000).style('opacity', 0).remove()
          d3.selectAll('.dot').transition().duration(1000).style('opacity', 0).remove()
          d3.selectAll('.legend_text').transition().duration(1500).style('opacity', 0).remove()
          d3.selectAll('.legend_line').transition().duration(1500).style('opacity', 0).remove()

          this.lc_pathcount = opt.data.length
          this.lc_xScaleText_arr = []
          this.lc_yScaleText_arr = []

          //redraw axis
          // 3. Call the x axis in a group tag
          d3.selectAll('.x.axis').transition()
                  .duration(300).remove()

          d3.selectAll('.y.axis').transition()
                   .duration(300).remove()

          this.lc_svg_g.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate( 0," + +that.lc_height + ")")
              .transition()
              .duration(3000)
              .call(d3.axisBottom(that.lc_xScaleLine)) // Create an axis component with d3.axisBottom

          // 4. Call the y axis in a group tag
          this.lc_svg_g.append("g")
              .attr("class", "y axis")
              .transition()
              .duration(3000)
              .call(d3.axisLeft(that.lc_yScaleLine)); // Create an axis component with d3.axisLeft

          for(var i=0; i<opt.data.length; i++){
            let draw_data = opt.data[i].values,
              yScaleMin = Math.min.apply(null, opt.data[i].yScale),
              yScaleMax = Math.max.apply(null, opt.data[i].yScale),
              xScaleMin = 0,
              xScaleMax = 1

            if(opt.data[i].xLabel == 'date'){
              let len = opt['data'][i].xScale.length
              xScaleMin = new Date(opt['data'][i].xScale[0])
              xScaleMax = new Date(opt['data'][i].xScale[len-1])

              for(let j=0; j<opt.data[i].values.length; j++){
                opt.data[i].values[j].x = new Date(opt.data[i].values[j].x)
              }
              for(let j=0; j<opt.data[i].xScale.length; j++){
                opt.data[i].xScale[j] = new Date(opt.data[i].xScale[j])
              }

            } else {
              xScaleMin = Math.min.apply(null, opt['data'][i].xScale)
              xScaleMax = Math.max.apply(null, opt['data'][i].xScale)
            }

            //calculate line generator
            if(!this.lc_line_generator.hasOwnProperty(opt.config.unit)){
              let unit = opt.config.unit
              if(unit == 'Hour' || unit == 'Day'){
                this.lc_line_generator[unit] = {}
                this.lc_line_generator[unit]['xScaleLine'] = this.lc_xScaleLine
                this.lc_line_generator[unit]['yScaleLine'] = this.lc_yScaleLine
                this.lc_line_generator[unit]['xScaleAxis'] = d3.scaleLinear().domain([xScaleMin, xScaleMax]).range([0, that.lc_width])
                this.lc_line_generator[unit]['yScaleAxis'] = d3.scaleLinear().domain([yScaleMin, yScaleMax]).range([that.lc_height, 0])
                this.lc_line_generator[unit]['generator'] = this.lc_line
              } else if(unit == 'All'){
                this.lc_line_generator[unit] = {}
                this.lc_line_generator[unit]['xScaleLine'] = d3.scaleTime().domain(d3.extent(opt.data[0].values, (d) => {return d.x})).range([0, that.lc_width])
                this.lc_line_generator[unit]['yScaleLine'] = this.lc_yScaleLine
                this.lc_line_generator[unit]['xScaleAxis'] = d3.scaleTime().domain([xScaleMin, xScaleMax]).range([0, that.lc_width])
                this.lc_line_generator[unit]['yScaleAxis'] = d3.scaleLinear().domain([yScaleMin, yScaleMax]).range([that.lc_height, 0])
                this.lc_line_generator[unit]['generator'] = d3.line()
                                                              .x((d, i) => {return that.lc_line_generator[unit]['xScaleLine'](d.x)})
                                                              .y((d) => { return that.lc_line_generator[unit]['yScaleLine'](d.y)})
                                                              .curve(d3.curveMonotoneX)
              }
            }
            // if x is not date
              this.lc_yScaleText_arr.push(d3.scaleLinear().domain([0, 1]).range([yScaleMin, yScaleMax]))
              this.lc_xScaleText_arr.push(d3.scaleLinear().domain([0, 1]).range([xScaleMin, xScaleMax]))

            this.lc_svg_g.append("path")
                .data(draw_data) // 10. Binds data to the line
                .transition()
                .duration(1500)
                .attr("d", that.lc_line_generator[opt.config.unit].generator(draw_data)) // 11. Calls the line generator
                .attr('class', () => {return 'line-' + i + ' line'}) // Assign a class for styling
                .style('fill', 'none')
                .style('stroke', that.lc_linecolor[i])
                .style("stroke-width", '1px')

              this.lc_svg_g.selectAll(".ddot")
                .data(draw_data)
              .enter().append("circle")
              // Uses the enter().append() method
                .attr("class", () => {return 'dot-' + i + ' dot'}) // Assign a class for styling
                .attr("cx", function(d, i) { return that.lc_line_generator[opt.config.unit].xScaleLine(d.x) })
                .attr("cy", function(d, i) { return that.lc_line_generator[opt.config.unit].yScaleLine(d.y) })
                .attr("r", 2)
                .attr("linenum", i)
                .attr('unit', opt.config.unit)
                .style('fill', that.lc_linecolor[i])
                .style('stroke', '#fff')
                .style('stroke-width', '1.5px')
                .on('mouseover', circle_handleMouseOver)
                .on('mouseout', circle_handleMouseOut)
                .style('opacity', 0)
                .transition()
                .duration(2000)
                .style('opacity', 1)
          }

          this.lc_legend.selectAll('.legend_line').data([]).exit().remove()
          let legend = this.lc_legend.selectAll('.legend_line')
            .data(opt.config.legend)
            .enter()

          this.lc_legend_circle = legend.append('circle')
              .attr("class", "legend_line") // Assign a class for styling
              .attr("cx", (d, i) => { return that.lc_width * 0.04 })
              .attr("cy", (d, i) => { return that.lc_height * 0.15 * i + 20})
              .attr("r", 2)
              .style('fill', (d, i) => {return that.lc_linecolor[i]})
              .style('opacity', 0)
              .transition()
              .duration(1500)
              .style('opacity', 1)


          this.lc_legend_text = legend.append('text')
              .attr('x', function(d, i) { return that.lc_width * 0.04 + 10 })
              .attr("y", function(d, i) { return that.lc_height * 0.15 * i  + 3 + 20})
              .text((d,i) => {return d})
              .style('opacity', 0)
              .attr('class', 'legend_text')
              .transition()
              .duration(1500)
              .style('opacity', 1)
        }
        // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number

        function circle_handleMouseOver(d, i){
          // Use D3 to select element, change size
          d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 6)

          //use D3 to select line, change stroke
          let line_num = d3.select(this).attr('linenum'),
             unit = d3.select(this).attr('unit')

          for(var i=0; i<that.lc_pathcount; i++){
            let lineclass = 'line-' + i,
              dotclass = 'dot-' + i
            if(line_num == i){
              //selected line get more wide
              d3.select('.' + lineclass).transition().duration(300).style('stroke-width', '3px')
              //select scale
              // 3. Call the x axis in a group tag

              d3.selectAll('.x.axis').transition()
                  .duration(300).remove()

              d3.selectAll('.y.axis').transition()
                  .duration(300).remove()

              that.lc_svg_g.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate( 0," + +that.lc_height + ")")
                  .transition()
                  .duration(1000)
                  .call(d3.axisBottom(that.lc_line_generator[opt.config.unit]['xScaleAxis']).ticks(4))

              that.lc_svg_g.append("g")
                  .attr("class", "y axis")
                  .transition()
                  .duration(1000)
                  .call(d3.axisLeft(that.lc_line_generator[opt.config.unit]['yScaleAxis']))
                   // Create an axis component with d3.axisBottom

              d3.selectAll('.yAxisLabel').transition()
                  .duration(300).remove()
              d3.selectAll('.xAxisLabel').transition()
                  .duration(300).remove()

              that.lc_svg.append('text')
                .attr('x', function(d, i) { return that.lc_margin.left })
                .attr("y", function(d, i) { return 15})
                .text((d,j) => {return opt['data'][i].yLabel})
                .style('opacity', 0)
                .attr('class', 'legend_text yAxisLabel')
                .transition()
                .duration(1000)
                .style('opacity', 1)

              that.lc_svg.append('text')
                .attr('x', function(d, i) { return that.lc_margin.left + that.lc_width + 10})
                .attr("y", function(d, i) { return that.lc_margin.top + that.lc_height })
                .text((d,j) => {return opt['data'][i].xLabel})
                .style('opacity', 0)
                .attr('class', 'legend_text xAxisLabel')
                .transition()
                .duration(1000)
                .style('opacity', 1)

              let xfunc = that.lc_xScaleText_arr[i],
                  yfunc = that.lc_yScaleText_arr[i]

              // Specify where to put label of text
              d3.select('#line_chart_g').append("text")
                .attr('id', "lt_label")
                .attr('x', () => {
                  return +that.lc_line_generator[unit].xScaleLine(d.x) - 10
                  if(typeof(d.x) == 'object'){
                    return that.lc_line_generator[unit].xScaleLine(d.x)
                  } else {

                  }
                })
                .attr('y', () => {
                  return +that.lc_line_generator[unit].yScaleLine(d.y) - 10
                })
                .attr('fill', 'white')
                .text(function() {
                    if(typeof(d) != 'object'){
                      return;
                    } else {
                      let tex = ''
                      if(typeof(d.x) == 'object'){
                        tex = "X: " + (+d.x.getMonth() + 1) + "-" + d.x.getDate() + " Y: " + yfunc(d.y).toFixed(2)
                      } else {
                        tex = "X: " + xfunc(d.x) + " Y: " + yfunc(d.y).toFixed(2)
                      }
                      return tex;
                    }
                  });
            } else {
              d3.selectAll('.' + lineclass).transition().duration(300).style('opacity', 0.1)
              d3.selectAll('.' + dotclass).transition().duration(300).style('opacity', 0.1)
            }
          }

        }

        function circle_handleMouseOut(d){
          d3.select(this)
          .transition()
          .duration(300)
          .attr('r', 2)
          // Select text by id and then remove
          d3.select("#lt_label").remove();  // Remove text location

          //cancel line opacity, change stroke
          let line_num = d3.select(this).attr('linenum')

          for(var i=0; i<that.lc_pathcount; i++){
            let lineclass = 'line-' + i,
              dotclass = 'dot-' + i
            if(line_num == i){
              d3.select('.' + lineclass).transition().duration(300).style('stroke-width', '1px')
            } else {
              d3.selectAll('.' + lineclass).transition().duration(300).style('opacity', 1)
              d3.selectAll('.' + dotclass).transition().duration(300).style('opacity', 1)
            }
          }

        }
        //end of function draw_linechart
      },
      handle_feature_change_state(){
        // 前提：在有线图All的基础上进行添加色块
        // 收集基本信息 存储参数的变量
        // 获取已经绘制线图的类型
        // 根据线图类型获取x比例尺，根据比例尺绘制天气矩形
        // 在线图添加提示
        // 添加交互 鼠标mouseover矩形块时，矩形块边框高亮
        //

        let that = this
        action_handle()
        function action_handle(){
          //仅对坐标轴为All时绘制天气Rect
          //计算增加或者删除块
          let obj = {
            'status':3,
            'config': {
              'add': [],
              'remove': []
            }
          }

          that.feature_change_state.checkedNames.forEach((d,i) => {
            if(that.his_feature_config.checkedNames.indexOf(d) == -1){
              obj.config.add.push(d)
            }
          })

          that.his_feature_config.checkedNames.forEach((d,i) => {
            if(that.feature_change_state.checkedNames.indexOf(d) == -1){
              obj.config.remove.push(d)
            }
          })

          that.his_feature_config = JSON.parse(JSON.stringify(that.feature_change_state))

          if(that.last_axis_type == 'All'){
            if(obj.config.add.length != 0){
              // request data
              // draw data
              let dataName = 'getFeature' + obj.config.add[0]
              if(that.$store.state.DATA_STORE.hasOwnProperty(dataName)){
                addFeatureRect(JSON.parse(JSON.stringify(that.$store.state.DATA_STORE[dataName])))
              } else {
                  DataManager.getFeature({'val': obj.config.add[0]}).then((res) => {
                    let _data = {
                      'type': obj.config.add[0],
                      'data': res.data
                    }
                    that.$store.commit('UPDATE_DATA_STORE', {'name': dataName, 'data': _data})
                    addFeatureRect(_data)
                  }).catch(err => {
                    if(err){
                      console.log(err)
                      return ;
                    }
                  })
              }
            } else if(obj.config.remove.length != 0){
              removeFeatureRect({'type': obj.config.remove[0]})
              //removeFeatureRect()
            }
          }

        }
        function removeFeatureRect(config){
          let _rectclass = '.rect-' + config.type
          if(config.type == 0){
            d3.selectAll('.weatherRect_disselect').data([]).exit().transition().duration(300).remove()
            d3.selectAll('.legendtext0').remove()
            d3.selectAll('.legendrect0').remove()
          } else {
            d3.selectAll('.legendtext1').remove()
            d3.selectAll('.legendrect1').remove()
          }
          d3.selectAll(_rectclass).remove()
        }
        function addFeatureRect(config){

          let xScaleAxis = that.lc_line_generator['All']['xScaleAxis'],
            yScaleAxis = that.lc_line_generator['All']['yScaleAxis'],
            feature = config.data
            // width = xScale / 2
            // height = lc_height
            let half_rect_interval = (xScaleAxis(new Date(feature[1].time)) - xScaleAxis(new Date(feature[0].time))) / 2,
              g = that.lc_svg.append('g')
                  .attr("transform", "translate(" + that.lc_margin.left + "," + that.lc_margin.top + ")")
                  .attr('id', 'featureRect')

            for(let i=0;i<feature.length;i++){
              feature[i]['Time'] = new Date(feature[i].time)
              feature[i]['x'] = xScaleAxis(feature[i]['Time']) - half_rect_interval
              feature[i]['y'] = 0
              feature[i]['width'] = half_rect_interval * 2
              feature[i]['height'] = that.lc_height
            }

            //construct data
            //draw bar
            g.selectAll('.xRect')
              .data(feature)
              .enter()
              .append('rect')
              .attr('x', (d,i) => {return d.x})
              .attr('y', (d,i) => {return d.y})
              .attr('width', (d,i) => {return d.width})
              .attr('height', (d,i) => {
                if(config.type == 0){
                  //weather
                  return d.height
                } else {
                  return d.width
                }
                })
              .attr('date', (d,i) => {return d.time})
              .attr('class', (d,i) => {
                return config.type == 0 ? 'weatherRect_disselect' + ' rect-' + config.type :  ' rect-' + config.type
                })
              .style('opacity', (d,i) => {
                if(config.type == 0){
                  return d.rain == 1 ? 0.4 : 0
                } else {
                  if(d.holiday == '0'){
                    return 0
                  } else {
                    return 1
                  }
                }
                })
              .on('mouseover', rect_handleMouseOver)
              .on('mouseout', rect_handleMouseOut)

            //legend
            g.selectAll('.xRectLegend')
              .data([0,1])
              .enter()
              .append('rect')
              .attr('x', function(d, i) {
                if(config.type == 0){
                  //weather
                  return that.lc_width * 1.02 + 10
                } else {
                  return that.lc_width * 1.10 + 10
                }
                })
              .attr("y", function(d, i) { return that.lc_height * 0.15 * i  + 100 + 30})
              .attr('width', 10)
              .attr('height', 10)
              .style('opacity', 0)
              .attr('class', (d,i) => {
                if(config.type == 0){
                  return 'legend_feature_weather_rect' + i + ' legendrect0'
                } else {
                  return 'legend_feature_holi_rect' + i + ' legendrect1'
                }
              })
              .transition()
              .duration(300)
              .style('opacity', 1)

            g.selectAll('.xRectLegend')
              .data([0,1])
              .enter()
              .append('text')
              .attr('x', function(d, i) {
                if(config.type == 0){
                  //weather
                  return that.lc_width * 1.02 + 40
                } else {
                  return that.lc_width * 1.10 + 40
                }
                })
              .attr("y", function(d, i) { return that.lc_height * 0.15 * i  + 100 + 39})
              .text((d,i) => {
                if(config.type == 0){
                  //weather
                  return i == 0 ? '无雨' : '有雨'
                } else {
                  return i == 0 ? '工作' : '周末'
                }
                })
              .style("text-anchor", "middle")
              .attr('class', (d,i) => {
                if(config.type == 0){
                  return 'legend_feature_text_' + i + ' legendtext0'
                } else {
                  return 'legend_feature_text_' + i + ' legendtext1'
                }
              })


          function rect_handleMouseOver(d, i){
            let date = d3.select(this).attr('date'),
              coordinates = d3.mouse(this),
              x = coordinates[0],
              y = coordinates[1]

            d3.select('#featureRect').append('text').attr('id', 'recttext')
              .attr('x', x)
              .attr('y', y)
              .attr('fill', 'white')
              .text(date)

            d3.select(this).attr('class', 'weatherRect_select')
          }
          function rect_handleMouseOut(){
            d3.select(this).attr('class', 'weatherRect_disselect')
            d3.selectAll('#recttext').remove()

          }

        }

        function getFeatureRectStatus(){}
      }

    },
    mounted(){

     
      // this.init_heatmap() //previous
       calendar.init_heatmap()
    //   calendar.adddata()
    //   this.init_piechart()
      this.handle_linechart({
        'status': '0',
        'config': {
          'legend': ['运输需求量'],
          'legend_val': [0],
          'unit': 'Day'
        }
        //'config': ''
      })
    }
  }
</script>
<style>
.funcbar2_warp {
  position: absolute;
  z-index: 1;
  width: 98%;
  max-height: 90%;
  transform: translate(1%, -5%);
  height: 22%;
  bottom: 0;
  overflow: hidden;
  border-radius: 0.3em;
  box-shadow: 0 0 0 1px hsla(0, 0%, 100%, 0.3) inset,
    0 0.5em 1em rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

rect.bordered {
  stroke: #e6e6e6;
  stroke-width: 2px;
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
  fill: rgb(34, 94, 168);
  stroke: #fff;
  stroke-width: 2;
}

.focus circle {
  fill: none;
  stroke: steelblue;
}

.axis {
  color: rgb(170, 170, 170);
}

.tick {
  font-size: 9pt;
  font-family: Consolas, courier;
  fill: #aaa;
}

.legend_text {
  fill:rgb(170, 170, 170);
  font-family: initial;
  font-size: 12px;
}

.weatherRect_select {
  z-index: -1;
  stroke: yellow;
  stroke-width: 2px;
}

.weatherRect_disselect {
  z-index: -1;
  stroke: none;
  fill: grey;
  stroke-width: 0;
}

.holiRect{
  z-index: -1;
  stroke: none;
  fill: yellow;
  stroke-width: 0;
}

.legend_feature_weather_rect0{
  stroke: grey;
  fill: none;
  stroke-width: 1px;
}

.legend_feature_weather_rect1{
  stroke: grey;
  fill: grey;
  stroke-width: 1px;
}

.legend_feature_holi_rect0{
  stroke: yellow;
  fill: none;
  stroke-width: 1px;
}

.legend_feature_holi_rect1{
  stroke: yellow;
  fill: yellow;
  stroke-width: 1px;
}

.legend_feature_text_0{
  fill: rgb(170, 170, 170);
  font-family: initial;
  font-size: 12px;
}

.legend_feature_text_1{
  fill: rgb(170, 170, 170);
  font-family: initial;
  font-size: 12px;
}

.rect-1{
  fill: yellow;
}
</style>
