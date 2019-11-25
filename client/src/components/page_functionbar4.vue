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

    <h5 style="font-size: 1rem; color: grey"> Block Detail </h5>
    <div class="line-separator-2"></div>

    <div id="daily_line"></div>

    <div class="line-separator-2" style="transform: translate(50%, 10px)"></div>

    <Carousel class="car_blockdetail" v-model="blockdetail" arrow="never" loop style="transform: translate(0, 10px)">
      <CarouselItem>
        <div id="parabarchart"></div>
      </CarouselItem>
      <CarouselItem>
        <div id="angle_ring"></div>
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
    import POIbar from "@/vuex/POIbar.js";
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
                },
                view_type:0,
                sql_location:"angle_all_list where start_geo = 'w7w3y9'",
                POIInited: 0,
                buses_data: []
            };
        },
        mounted() {
            POIbar.initdata();
        },
        computed:{
            geohash_state () {
                return this.$store.state.geohash_state
            },
            calendar_state () {
                return this.$store.state.calendar_state
            },
            AllDayHour_state () {
                return this.$store.state.AllDayHour_state
            },
            buses_routes_state() {
                return this.$store.state.buses_routes_state
            }
        },
        watch:{
            change_buses_route:function(val){
                console.log(val);
            },
            geohash_state: function(val, oldVal){
                this.geohash = val.geohash;
                if(this.view_type === 0){
                    //this.sql_od_matrix = `od_all where start_geo = '${this.geohash}'`;
                    this.sql_location = `angle_all_list where start_geo = '${this.geohash}'`;
                }
                else if(this.view_type === 1){
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                }
                else if(this.view_type === 2){
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '${this.time_separate}'`;
                }

                this.handle_geohash_state();
                this.draw_location_ring();
                this.drawbarchart();
                this.changehead();
                if(this.buses_data.length != 0){
                    this.draw_buses_info(this.buses_data.routes);
                }

            },
            calendar_state: function(val, oldVal){
                let format = d3.timeFormat("%Y-%m-%d");
                this.date = format(new Date(val[0])).toString();
                let separate = {
                    '0-6':'0',
                    '6-10':'1',
                    '10-16':'2',
                    '16-20':'3',
                    '20-24':'4'
                };

                // 需要执行的代码
                if(this.view_type !== 2){
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                }
                else if(this.view_type === 2){
                    //console.log(time);
                    this.time_separate = separate[val[1].replace('时','')];
                    console.log(val[1])
                    console.log(this.time_separate)
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '${this.time_separate}'`;
                }

                //this.draw_od_matrix();
                this.draw_location_ring();
                this.drawbarchart();
                this.changehead();
            },
            AllDayHour_state: function(val, oldVal){
                console.log('all day hour -- state');
                this.view_type = val;
                this.changehead();
                // 需要执行的代码
                if(val === 0){
                    //this.sql_od_matrix = `od_all where start_geo = '${this.geohash}'`;
                    //this.draw_od_matrix(this.geohash);
                    this.sql_location = `angle_all_list where start_geo = '${this.geohash}'`;
                    //this.draw_location_ring();
                }
                else if(val === 1){
                    ////////////////////
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    //this.draw_od_matrix();
                    ////////////////////
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                    //this.draw_location_ring();
                    //////////////////////
                }
                else if(val === 2){
                    ////////////////////
                    ////this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    //this.draw_od_matrix();
                    ////////////////////
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '0'`;
                    this.draw_location_ring();
                    //////////////////////
                }
            },
            buses_routes_state(val, oldVal) {
                //console.log(val)
                if(val.length != 0){
                    this.draw_buses_info(val.routes)
                }
                this.buses_data = val
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
                    drawdata.push([i, d.count, d.target])
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
                    let overtext = d[2] + ': ' + drawdata[i][1]
                    ovflow_bar_con.append('text')
                        .attr('x', ovflow_bar_xScale(drawdata[i][0]))
                        .attr('y', () => {return ovflow_bar_yScale(drawdata[i][1]) - 10})
                        .text(overtext)
                        .attr('class', 'bartips')
                }

                function bar_handleMouseOut(d, i){
                    d3.select(this).attr('fill', that.color[mes.title].disselected)
                    d3.select('.bartips').remove()
                }

                function bar_handleMouseClick(d, i){
                    console.log(d)
                    console.log('click -> ', d[2])
                    that.$store.commit('bar_geohash_state', d[2])
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
            },
            changehead() {
                let that = this;
                let selectrange = this.AllDayHour_state;
                let date = this.calendar_state[0]; //获取当前的时间和时间段
                let witchhour = this.calendar_state[1];
                let text = null;
                switch (selectrange) {
                    case 0:
                        text = "整个时间跨度内信息";
                        break;
                    case 1:
                        if (date == null) {
                            text = "2017-05-01信息";
                        } else {
                            text = "" + date + "信息";
                        }
                        break;
                    case 2:
                        if (date == null) {
                            text = "2017-05-01 0时-6时信息";
                        } else {
                            if (witchhour == null) {
                                text = "" + date + " 0时-6时信息";
                            } else {
                                text = "" + date + " " + witchhour;
                            }
                        }
                        break;
                    default:
                        break;
                }
                document.querySelector("#app > div.information > p").innerHTML=text;
                //document.querySelector("#page_functionbar3\\.vue > div:nth-child(2) > h5").innerHTML=text;
            },
            draw_location_ring() {
                this.$http
                    .get("query", {
                        params: {
                            table: this.sql_location
                        }
                    })
                    .then(res => {
                        //console.log(res.body);
                        if (res.body[0])
                            draw(eval(res.body[0].count));
                        else
                            d3.select("#angle_ring").html('');
                    });

                let draw = dataset => {

                    let pie_width = document.getElementById("angle_ring").clientWidth,
                        pie_height = document.getElementById("angle_ring").clientHeight,
                        pie_margin = {top: pie_height*0.1 , right: pie_width*0.1, bottom: pie_height*0.15, left: pie_width*0.1};
                    pie_width = pie_width - pie_margin.left - pie_margin.right
                    pie_height = pie_height - pie_margin.top - pie_margin.bottom

                    let rdata = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                    let max_index = 0,
                        min_index = 0;

                    for (let index = 0; index < dataset.length; index++) {
                        if (dataset[index] === d3.max(dataset)) {
                            max_index = index;
                            break;
                        }
                    }

                    for (let index = 0; index < dataset.length; index++) {
                        if (dataset[index] === d3.min(dataset)) {
                            min_index = index;
                            break;
                        }
                    }

                    d3.select("#angle_ring").html("");

                    let pie_svg = d3.select("#angle_ring")
                        .append("svg")
                        .attr("width", pie_width + pie_margin.left + pie_margin.right)
                        .attr("height", pie_height + pie_margin.top + pie_margin.bottom);

                    pie_svg.append('text')
                        .attr('x', () => {return pie_width / 2.5})
                        .attr('y', () => {return  pie_margin.top / 1.3})
                        .text('Angle count')
                        .attr('class', 'bartitle')

                    let pie = d3.pie();

                    let piedata = pie(rdata);

                    let outerRadius = pie_width / 4; //外半径
                    let innerRadius = outerRadius / 2; //内半径
                    let markerSize = innerRadius; //三角标记大小

                    let KOUSHAOLV = d3.rgb(93, 190, 138);
                    let HEYELV = d3.rgb(26, 104, 64);
                    let color = d3.interpolate(KOUSHAOLV, HEYELV);
                    let linear = d3
                        .scaleLinear()
                        .domain([0, d3.max(dataset, d => d)])
                        .range([0, 1]);

                    let arc = d3
                        .arc() //弧生成器
                        .innerRadius(innerRadius) //设置内半径
                        .outerRadius(outerRadius); //设置外半径

                    let arcs = pie_svg
                        .selectAll("g")
                        .attr("class", "chart")
                        .data(piedata)
                        .enter()
                        .append("g")
                        .attr( "transform", "translate(" + (pie_margin.left + pie_width / 2.1) + "," + (pie_margin.top + pie_height / 2) + ")");

                    arcs.append("path")
                        .attr("fill", function (d, i) {
                            //console.log(color(linear(dataset[i])));
                            return color(linear(dataset[i]));
                        })
                        .attr("d", function (d) {
                            return arc(d);
                        });

                    let marker = d3.symbol()
                        .size(markerSize)
                        .type(d3.symbolTriangle);

                    pie_svg
                        .append("g")
                        .attr("transform", function () {
                            let widthT =Math.sin((piedata[max_index].startAngle + piedata[max_index].endAngle)/2) * (innerRadius - 10);
                            let heightT = Math.cos((piedata[max_index].startAngle + piedata[max_index].endAngle)/2) * (innerRadius - 10);
                            return "translate(" +((pie_margin.left + pie_width / 2.1) + widthT) +"," +((pie_margin.top + pie_height / 2.1) - heightT) + ")";
                        })
                        .append("path")
                        .attr("d", marker)
                        .attr("fill", color(linear(dataset[max_index])))
                        .attr("transform", function () {
                            let ang = ((max_index - 0.5) * (2 * Math.PI)) / 12;
                            return "rotate(" + ((ang - Math.PI / 2) / Math.PI) * 180 + ")";
                        });

                    pie_svg
                        .append("g")
                        .attr("transform", function () {
                            let widthT = Math.sin((piedata[min_index].startAngle + piedata[min_index].endAngle) / 2) *(innerRadius - 10);
                            let heightT =Math.cos((piedata[min_index].startAngle + piedata[min_index].endAngle) / 2) *(innerRadius - 10);
                            return "translate(" +((pie_margin.left + pie_width / 2.1) + widthT) + "," +((pie_margin.top + pie_height / 2.1) - heightT) +")";
                        })
                        .append("path")
                        .attr("d", marker)
                        .attr("fill", color(linear(dataset[min_index])))
                        .attr("transform", function () {
                            let ang = ((min_index - 0.5) * (2 * Math.PI)) / 12;
                            return "rotate(" + ((ang - Math.PI / 2) / Math.PI) * 180 + ")";
                        });

                    let updataMark = pie_svg
                        .selectAll("g")
                        .attr("class", "chart")
                        .data(piedata)
                        .enter()
                        .append("g")
                        .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");

                    updataMark
                        .append("path")
                        .attr("d", function (d) {
                            return marker(d);
                        })
                        .attr("fill", function (d, i) {
                            return color(linear(dataset[i]));
                        });


                    let texts = pie_svg.selectAll('.chart')
                        .data(['180', '150', '120', '90', '60', '30', '0', '330', '300', '270', '240', '210'])
                        .append('text')
                        .attr('x', (d, i) => Math.sin(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr('y', (d, i) => Math.cos(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr("text-anchor", "middle") //文字居中
                        .attr("font-size", "80%")//文字大小
                        .attr("text-anchor", "middle") //文字居中
                        .attr("fill", "rgb(170, 170, 170)")
                        .text((d, i) => d)
                        .attr("transform", "translate(" + 0 + "," + 3 + ")")
                };
            },
            drawbarchart() {
                if(!this.POIInited){
                    POIbar.initchart();
                    this.POIInited = !this.POIInited
                }
                let geoh = this.geohash_state.geohash;
                if (geoh == null) return;
                let date = this.calendar_state[0]; //获取当前的时间和时间段
                let format = d3.timeFormat("%Y-%m-%d");
                date = format(new Date(date)).toString();
                let witchhour = this.calendar_state[1];
                //console.log(date);
                let selectrange = this.AllDayHour_state;
                switch (selectrange) {
                    case 0:
                        POIbar.getdata(
                            "table=traffictype_all where start_geo='" + geoh + "'",
                            geoh
                        );
                        break;
                    case 1:
                        if (date == null) {
                            POIbar.getdata(
                                "table=traffictype_day where start_geo='" +
                                geoh +
                                "' and date='2017-05-01'",
                                geoh
                            );
                        } else {
                            POIbar.getdata(
                                "table=traffictype_day where start_geo='" +
                                geoh +
                                "' and date='" +
                                date +
                                "'",
                                geoh
                            );
                        }
                        break;
                    case 2:
                        if (date == null) {
                            POIbar.getdata(
                                "table=traffictype_hour where start_geo='" +
                                geoh +
                                "' and date='2017-05-01' and timeSeparete='0'",
                                geoh
                            );
                        } else {
                            let h = 0;
                            switch (witchhour) {
                                case "0-6时":
                                    h = 0;
                                    break;
                                case "6-10时":
                                    h = 1;
                                    break;
                                case "10-16时":
                                    h = 2;
                                    break;
                                case "16-20时":
                                    h = 3;
                                    break;
                                case "20-14时":
                                    h = 4;
                                    break;
                                default:
                                    break;
                            }
                            POIbar.getdata(
                                "table=traffictype_hour where start_geo='" +
                                geoh +
                                "' and date='" + date + "' and timeSeparete='" + h + "'",
                                geoh
                            );
                        }
                        break;
                    default:
                        break;
                }
            },
            draw_buses_info(data) {

                //console.log(data);

                let that = this;

                let myChart = this.$echarts.init(document.getElementById("buses_info"));

                let option = null;

                option = {
                    title: {
                        show: false,
                        text: '公交路线数: ' + data.length,
                        //x: "", //水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                        y: "0", //垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
                        textStyle: {
                            //文字颜色
                            color: "#57ff22",
                            fontStyle: "normal",
                            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                            fontWeight: "lighter",
                            //字体系列
                            fontFamily: "sans-serif",
                            //字体大小
                            fontSize: 14
                        }
                    },
                    series: {
                        type: 'graph',
                        layout: 'force',
                        animation: false,
                        roam: true,
                        label: {
                            normal: {
                                show: true,
                                color: '#FFF',
                                position: 'right'
                            }
                        },
                        symbolSize: 20,
                        itemStyle: {
                            normal: {
                                color: "#c96b2b",
                            }
                        },
                        data: data.map((d, i) => {
                            return {id: i, name: d, category: i}
                        }),
                        categories: data.map((d, i) => {
                            return {name: i}
                        }),
                        force: {
                            initLayout: 'gird',
                            // gravity: 0
                            layoutAnimation: true,
                            repulsion: 40,
                        }
                    }
                };

                myChart.on('click', (params) => {
                    console.log(params.name);
                    that.$store.commit('buses_route', params.name);
                });

                if (option && typeof option === "object") {
                    myChart.setOption(option, true);
                }
            },
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
    right: 1%;
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

  #angle_ring{
    height: 190px;
  }

  #parabarchart{
    height: 190px;
  }

  #buses_info {
    height: 190px;
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


  #parabarchart .axis text {
    font: 10px sans-serif;
  }

  #parabarchart .axis path,
  #parabarchart .axis line {
    fill: none;
    stroke: white;
    shape-rendering: crispEdges;
  }
  #parabarchart h2 {
    font: 1rem sans-serif;
    color: grey !important;
  }
  #parabarchart h5 {
    font: 15px sans-serif !important;
    color: grey !important;
  }
  #parabarchart text,
  #parabarchart .bars text {
    font: 10px sans-serif;
    fill: rgb(170, 170, 170);
  }
  .bar--negative {
    fill: #1a6840;
  }
  .bar--positive {
    fill: steelblue;
  }
</style>
