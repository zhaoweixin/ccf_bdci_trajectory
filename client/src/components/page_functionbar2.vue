<template>
    <div class="funcbar2_warp">
        <div id="heatmap" style="width:50%; height:100%; float:right">
            <div id="chart"></div>
        </div>
    </div>
</template>
<script>
    //import DataManager from './DataManager'
    import * as d3 from 'd3'
    import DataManager from '../data/DataManager'
    export default{
        name: 'page_functionbar2',
        data(){
            return {}
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
                    colors = ["#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
                    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
                    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"],
                    datasets = ["http://localhost:3000/test", "http://localhost:3000/test"];

                var svg = d3.select("#chart").append("svg")
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
                        const response = await DataManager.getTestData()
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
            }
        },
        mounted(){
            this.init_heatmap()
        }
    }
</script>
<style>

.funcbar2_warp{
    position: absolute;
    z-index: 1;
    width:98%;
    max-height: 90%;
    transform: translate(1%, 850px);
    height:20%;
    background:hsla(0,0%,100%,.25) border-box;
	overflow:hidden;
	border-radius:.3em;
	box-shadow:0 0 0 1px hsla(0,0%,100%,.3) inset,0 .5em 1em rgba(0,0,0,0.6);
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

</style>
