<template>
  <div id="page_functionbar4.vue" class="funcbar_warp_bar4">

    <div class="funcbar_warp_header">
      <h4>区块信息栏</h4>
      <div class="line-separator-1"></div>
    </div>

    <div class="funcbar_warp_header">
      <h5 style="font-size: 1rem"> Block Overview </h5>
      <div class="line-separator-2"></div>
    </div>

    <Carousel class="car_blockoverview" v-model="blockoverview" arrow="never" loop>
        <CarouselItem>
            <div id="ovflowin_bar"></div>
        </CarouselItem>
        <CarouselItem>
            <div id="ovflowout_bar"></div>
        </CarouselItem>
    </Carousel>

      <h5 style="font-size: 1rem"> Block Detail </h5>
      <div class="line-separator-2"></div>

    <div id="daily_line"></div>

    <div class="line-separator-2" style="transform: translate(50%, 10px)"></div>

    <Carousel class="car_blockdetail" v-model="blockdetail" arrow="never" loop style="transform: translate(0, 10px)">
      <CarouselItem>
        <div id="angle_ring"></div>
      </CarouselItem>
      <CarouselItem>
        <div id="barchart"></div>
      </CarouselItem>
      <CarouselItem>
        <div id="buses_info"></div>
      </CarouselItem>
    </Carousel>

  </div>
</template>
<script>
import DataManager from '../data/DataManager'
import * as d3 from "d3";
export default {
    name: "page_functionbar4",
    data() {
        return {
            geohash: "w7w3y9",
            date:'2017-05-01',
            time_separate:'0',
            inited: 0,
            blockoverview:0,
            blockdetail:0,
            color: {
                'Flow In': {
                    'selected': 'white',
                    'disselected': 'rgb(0,236,251)'
                },
                'Flow Out': {
                    'selected': 'white',
                    'disselected': 'rgb(242,254,195)'
                }
            }
        };
    },
    mounted() {},
    computed:{
        geohash_state () {
            return this.$store.state.geohash_state
        }
    },
    watch:{
        geohash_state: function(val, oldVal){
            this.handle_geohash_state()
        }
    },
    methods: {
        draw_ovflow_bar(mes){

            let that = this;
            let width = document.getElementById(mes.id).clientWidth,
                height = document.getElementById(mes.id).clientHeight,
                margin = {top: height*0.1 , right: width*0.1, bottom: height*0.15, left: width*0.1},
                drawdata = []

                width = width - margin.left - margin.right,
                height = height - margin.top - margin.bottom

            let svg = d3.select('#' + mes.id).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)

            //format draw data
            mes.data.forEach((d,i) => {
                drawdata.push([i, d.count, d.source])
            })

            let ovflow_bar_xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1).domain(drawdata.map((d) => {return d[0]})),
                ovflow_bar_yScale = d3.scaleLinear().rangeRound([height, 0]).domain([0, d3.max(drawdata, (d)=> {return d[1]})]),
                ovflow_bar_con = svg.append('g')
                ovflow_bar_con.attr("transform", "translate(" + (margin.left + margin.right) + "," + margin.top + ")")

            ovflow_bar_con.append('g').attr('class', 'xAxis')
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(ovflow_bar_xScale).tickValues(ovflow_bar_xScale.domain().filter(function(d,i){ return !(i%2)})))

            ovflow_bar_con.append("g").attr('class', 'yAxis')
                .call(d3.axisLeft(ovflow_bar_yScale))
                .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Speed");

            ovflow_bar_con.append('g').selectAll('.xxxbar')
                .data(drawdata)
                .enter().append("rect")
                .attr("class", "blockbar_disselect")
                .attr("x", function (d) {
                    return ovflow_bar_xScale(d[0]);
                })
                .attr("y", function (d) {
                    return ovflow_bar_yScale(0);
                })
                .attr("width", ovflow_bar_xScale.bandwidth())
                .attr("height", function (d) {
                    return height - ovflow_bar_yScale(0);
                })
                .attr('fill', ()=>{
                    return that.color[mes.title].disselected
                })
                .on('mouseover', bar_handleMouseOver)
                .on('mouseout', bar_handleMouseOut)
                .on('click', bar_handleMouseClick)

            ovflow_bar_con.selectAll('rect')
                .transition()
                .duration(800)
                .attr('y', (d) => { return ovflow_bar_yScale(d[1]);})
                .attr('height', (d) => {return height - ovflow_bar_yScale(d[1]);})
                .delay((d,i) => {return(i*100)})


            svg.append('text')
                    .attr('x', () => {return width / 2 + margin.left / 2})
                    .attr('y', () => {return margin.top})
                    .text(mes.title)
                    .attr('class', 'bartitle')

            function bar_handleMouseOver(d, i){
                d3.select(this).attr('fill', that.color[mes.title].selected)

                ovflow_bar_con.append('text')
                    .attr('x', ovflow_bar_xScale(drawdata[i][0]))
                    .attr('y', () => {return ovflow_bar_yScale(drawdata[i][1]) - 10})
                    .text(drawdata[i][1])
                    .attr('class', 'bartips')
            }

            function bar_handleMouseOut(d, i){
                d3.select(this).attr('fill', that.color[mes.title].disselected)
                d3.select('.bartips').remove()
            }

            function bar_handleMouseClick(d, i){
                console.log('click -> ', d[i][2])
            }

        },
        draw_daily_line(mes){
            let that = this;
            let width = document.getElementById(mes.id).clientWidth,
                height = document.getElementById(mes.id).clientHeight,
                margin = {top: height*0.1 , right: width*0.15, bottom: height*0.25, left: width*0.15},
                flowin_axisMin = Math.min.apply(null, mes.block_daily_flowin.average.concat(mes.block_daily_flowout.count)),
                flowin_axisMax = Math.max.apply(null, mes.block_daily_flowin.average.concat(mes.block_daily_flowout.count)),
                flowout_axisMin = Math.min.apply(null, mes.block_daily_flowout.average.concat(mes.block_daily_flowout.count)),
                flowout_axisMax = Math.max.apply(null, mes.block_daily_flowout.average.concat(mes.block_daily_flowout.count)),
                timerange = mes.block_daily_flowin.timerange

            width = width - margin.left - margin.right,
            height = height - margin.top - margin.bottom
            let line_xAxis = d3.scaleTime().domain(d3.extent([new Date(mes.block_daily_flowin.startdate), new Date(mes.block_daily_flowin.enddate)])).range([0, width]),
            line_inout_xAxis = d3.scaleLinear().domain([0, mes.block_daily_flowin.average.length-1]).range([0, width]),
            line_in_yAxis = d3.scaleLinear().domain([0, flowin_axisMax]).range([height, 0]),
            line_out_yAxis = d3.scaleLinear().domain([0, flowout_axisMax]).range([height, 0]),
            svg = d3.select('#' + mes.id).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom),
            daily_line_con = svg.append('g').attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")


            let config = [{'text': 'flowin avg', 'data': mes.block_daily_flowin.average, 'color': 'rgb(0,236,251)', 'opacity': 0.3, 'class': '_fia', 'type': 'in'},
                {'text': 'flowin', 'data': mes.block_daily_flowin.count, 'color': 'rgb(0,236,251)', 'opacity': 1, 'class': '_fi', 'type': 'in'},
                {'text': 'flowout avg', 'data': mes.block_daily_flowout.average, 'color': 'rgb(242,254,195)', 'opacity': 0.3, 'class': '_foa', 'type': 'out'},
                {'text': 'flowout', 'data': mes.block_daily_flowout.count, 'color': 'rgb(242,254,195)', 'opacity': 1, 'class': '_fo', 'type': 'out'}]

            daily_line_con.append('g').attr('class', 'xAxis')
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(line_xAxis).ticks(4))

            daily_line_con.append('g').attr('class', 'left_yAxis')
                .call(d3.axisLeft(line_in_yAxis))

            daily_line_con.append('g').attr('class', 'right_yAxis')
                .attr("transform", () => {
                    let x = +width
                    return "translate(" + x + ",0)"
                })
                .call(d3.axisRight(line_out_yAxis))

            daily_line_con.append('text')
                    .attr('x', () => {return width / 3.5})
                    .attr('y', () => {return 0})
                    .text('Flow Count')
                    .attr('class', 'bartitle')


            var flowin_linegenerator = d3.line()
                .x(function(d) {return line_inout_xAxis(d[0])})
                .y(function(d) {return line_in_yAxis(d[1])})
                .curve(d3.curveMonotoneX)

            var flowout_linegenerator = d3.line()
                .x(function(d) {return line_inout_xAxis(d[0])})
                .y(function(d) {return line_out_yAxis(d[1])})
                .curve(d3.curveMonotoneX)

            config.forEach((v, j) => {
                let linegenerator = v.type == 'in' ? flowin_linegenerator : flowout_linegenerator

                daily_line_con.append('path')
                    .datum(v.data.map((d,i) => {return [i, d]}))
                    .attr("class", "flowline")
                    .attr('d', linegenerator)
                    .style('stroke', v.color)
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
                    .style('opacity', v.opacity)


                let legend_x =  width / 1.5 * (j%2),
                    legend_y =  height + margin.bottom / 3 + (15 * (Math.floor(j/2) + 1)),
                    x_offset = 10,
                    y_offset = 5

                daily_line_con.append('circle')
                    .attr("class",  () => {return 'block_detail_legend'}) // Assign a class for styling
                    .attr("cx", () => { return legend_x })
                    .attr("cy", () => { return legend_y })
                    .attr("r", 2)
                    .style('fill', v.color)
                    .style('opacity', 0)
                    .transition()
                    .duration(3000)
                    .style('opacity',  v.opacity)

                daily_line_con.append('text')
                    .attr('x', () => { return legend_x + x_offset })
                    .attr("y", () => { return legend_y + y_offset})
                    .text(() => { return v.text})
                    .style('opacity', 0)
                    .attr('class', 'legend_text')
                    .transition()
                    .duration(3000)
                    .style('opacity', 1)
            })

        },

        update_ovflow_bar(mes){
            d3.select('#' + mes.id).selectAll("svg").remove()
            this.draw_ovflow_bar(mes)
        },
        update_daily_line(mes){
            d3.select('#' + mes.id).selectAll("svg").remove()
            this.draw_daily_line(mes)
        },

        handle_geohash_state(){
            let that = this

            DataManager.getRectDetail(that.geohash_state).then((res) => {
                if(!this.inited){
                    this.inited = !this.inited
                    this.draw_ovflow_bar({
                        'id': 'ovflowin_bar',
                        'data': res.data.block_overview_flowin,
                        'title': 'Flow In'
                    })
                    this.draw_ovflow_bar({
                        'id': 'ovflowout_bar',
                        'data': res.data.block_overview_flowout,
                        'title': 'Flow Out'
                    })
                    this.draw_daily_line({
                        'id': 'daily_line',
                        'block_daily_flowin': res.data.block_daily_flowin,
                        'block_daily_flowout': res.data.block_daily_flowout,
                        'title': 'Daily'
                    })
                } else {
                    this.update_ovflow_bar({
                        'id': 'ovflowin_bar',
                        'data': res.data.block_overview_flowin,
                        'title': 'Flow In'
                    })
                    this.update_ovflow_bar({
                        'id': 'ovflowout_bar',
                        'data': res.data.block_overview_flowout,
                        'title': 'Flow Out'
                    })
                    this.update_daily_line({
                        'id': 'daily_line',
                        'block_daily_flowin': res.data.block_daily_flowin,
                        'block_daily_flowout': res.data.block_daily_flowout,
                        'title': 'Daily'
                    })
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }
}
</script>
<style>
.funcbar_warp_bar4 {
  position: absolute;
  z-index: 1;
  width: 12.5%;
  max-height: 90%;
  /*transform: translate(1660px, 60px);*/
  right: 15%;
  top: 6%;
  height: 70%;
  /*overflow:hidden;*/
  border-radius: 0.3em;
  box-shadow: 0 0 0 1px hsla(0, 0%, 100%, 0.3) inset,
    0 0.5em 1em rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  font-size: 14px;
}
.funcbar_warp_header {
  padding-top: 10px;
  color: grey !important;
}

.car_blockoverview{
    height: 209px;
}

.car_blockdetail{
    height: 210px;
}

#ovflowin_bar {
    height: 175px;
}

#ovflowout_bar {
    height: 175px;
}


#daily_line {
    height: 230px;
}

.left_yAxis{
    color: rgb(0,236,251);
}
.right_yAxis{
    color: rgb(242,254,195);
}

.yAxis{
    color: rgb(170, 170, 170);
}

.xAxis{
    color: rgb(170, 170, 170);
}
.bartips{
    fill: white;
    text-anchor: middle;
}

.bartitle{
    fill: rgb(170, 170, 170);
    font-weight: bold;
}

</style>
