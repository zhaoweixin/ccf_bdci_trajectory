<template>
  <div id="page_functionbar3.vue" class="funcbar_warp_bar2">
    <div class="funcbar_warp_header">
      <h4>信息栏</h4>
      <div class="line-separator-1"></div>
    </div>
    <div class="funcbar_warp_header">
      <h5 style="font-size: 1rem"></h5>
      <div class="line-separator-2"></div>
    </div>

    <div id="od_matrix"></div>
    <div id="barchart"></div>
    <div id="location_info">
      <Tabs size="small"  @on-click="tabs_func">
        <TabPane label="区域方向">
          <div id="angle_ring"></div>
        </TabPane>
        <TabPane label="区域POI">
          <div id="poi_ring"></div>
        </TabPane>
        <TabPane label="公交信息">
          <div id="buses_info"></div>
        </TabPane>
      </Tabs>
    </div>

  </div>
</template>
<script>
    import * as d3 from "d3";
    import POIbar from "@/vuex/POIbar.js";
    export default {
        name: "page_functionbar3",
        data() {
            return {
                geohash: "w7w3y9",
                date:'2017-05-01',
                time_separate:'0',
                buses_data:[],
                sql_od_matrix:"od_all where start_geo = 'w7w3y9'",
                sql_location:"angle_all_list where start_geo = 'w7w3y9'",
                view_type:0
            };
        },
        mounted() {
            POIbar.initchart();
            POIbar.initdata();
        },
        updated(){
        },
        methods: {
            tabs_func(name){
                //console.log(name);
                if(name === 0)
                    this.draw_location_ring(this.geohash);
                else if(name === 1)
                    this.draw_poi_ring(this.geohash);
                else
                    this.draw_buses_info(this.buses_data);
            },
            draw_od_matrix() {
                //console.log('draw_od_matrix');
                this.$http.get('query',{
                    params:{
                        table: this.sql_od_matrix
                    }
                }).then(res=>{
                    //console.log(res.body[0]);
                    draw(res.body[0]);
                });

                let draw = (geo_data)=>{

                    //重绘
                    d3.select("#od_matrix").html("");

                    //tittle
                    d3.select("#od_matrix").append('h5').html('TOP5-OD');

                    let width = document.getElementById("od_matrix").clientWidth;
                    let height = document.getElementById("od_matrix").clientHeight;

                    let gird_size = 30;


                    geo_data.dest_geo = eval(geo_data.dest_geo);
                    geo_data.matrix = eval(geo_data.matrix);

                    //console.log(width,height);
                    let svg = d3
                        .select("#od_matrix")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    let data = [];
                    let geohash_label = geo_data.dest_geo;
                    let matrix_len = geo_data.dest_geo.length;

                    for (let i = 0; i < matrix_len; i++) {
                        for (let j = 0; j < matrix_len; j++) {
                            data.push({ row: i, col: j,value:geo_data.matrix[i][j] });
                        }
                    }

                    let a = d3.rgb(0,0,0,0);	//无色
                    let b = d3.rgb(0,185,0);	//绿色

                    let compute = d3.interpolate(a,b);

                    let linear = d3.scaleLinear()
                        .domain([0,d3.max(geo_data.matrix,(d)=>{
                            return d3.max(d,s=>s);
                        })])
                        .range([0,1]);

                    let label_row_g = svg
                        .append("g")
                        .attr("transform", "translate(" + 20 + ",0)");

                    let label_row = label_row_g
                        .selectAll(".label_row")
                        .data(geohash_label)
                        .enter()
                        .append("text")
                        .attr("class", "label_row")
                        .attr("x", -5)
                        .attr("y", (d, i) => i * gird_size + 45)
                        .text(d => d)
                        .style("text-anchor", "start")
                        .style("opacity", 0)
                        .transition()
                        .duration(300)
                        .style("opacity", 1);

                    let label_col_g = svg
                        .append("g")
                        .attr("transform", "translate(" + 0 + ",0)");
                    let label_col = label_row_g
                        .selectAll(".label_col")
                        .data(geohash_label)
                        .enter()
                        .append("text")
                        .attr("class", "label_col")
                        .attr("x", (d, i) => i * gird_size + 40)
                        .attr("y", height * 0.95)
                        .text(d => d)
                        .attr("transform", (d, i) => {
                            return "rotate(-20, " + i * gird_size + " " + height + ")";
                        })
                        .style("text-anchor", "start")
                        .style("opacity", 0)
                        .transition()
                        .duration(300)
                        .style("opacity", 1);

                    let cards_g = svg
                        .append("g")
                        .attr(
                            "transform",
                            "translate(" + ((width - 150) / 2 + 20) + "," + 20 + ")"
                        );

                    let cards = cards_g.selectAll(".od_card")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("class", "od_card")
                        .attr("x", d => d.row * gird_size)
                        .attr("y", d => d.col * gird_size)
                        .attr("width", gird_size)
                        .attr("height", gird_size)
                        .attr("fill", (d)=>compute(linear(d.value)))
                        .on('mouseover',function () {
                        })
                        .on('mouseout',function () {
                        })
                        .style("opacity", 0)
                        .transition()
                        .duration(300)
                        .style("opacity", .8);

                    cards_g.selectAll('rect').append('title').text(d=>d.value)
                }
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
                        if(res.body[0])
                            draw(eval(res.body[0].count));
                        else
                            d3.select("#angle_ring").html('');
                    });

                let draw = dataset => {
                    //console.log(dataset);
                    let pie_width = document.getElementById("location_info").clientWidth;
                    let pie_height = document.getElementById("location_info").clientHeight - 40;
                    //pie_width = pie_height < pie_width ? pie_height : pie_width;
                    //let dataset = [100,200,300,0,1100,1000,900,800,700,600,500,400];
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

                    let pie_svg = d3
                        .select("#angle_ring")
                        .append("svg")
                        .attr("width", pie_width)
                        .attr("height", pie_height);

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
                        .domain([0, d3.max(dataset,d=>d)])
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
                        .attr(
                            "transform",
                            "translate(" + pie_width / 2 + "," + pie_height / 2 + ")"
                        );
                    arcs
                        .append("path")
                        .attr("fill", function(d, i) {
                            //console.log(color(linear(dataset[i])));
                            return color(linear(dataset[i]));
                        })
                        .attr("d", function(d) {
                            return arc(d);
                        });
                    let marker = d3
                        .symbol()
                        .size(markerSize)
                        .type(d3.symbolTriangle);
                    pie_svg
                        .append("g")
                        .attr("transform", function() {
                            let widthT =
                                Math.sin(
                                    (piedata[max_index].startAngle + piedata[max_index].endAngle) /
                                    2
                                ) *
                                (innerRadius - 10);
                            let heightT =
                                Math.cos(
                                    (piedata[max_index].startAngle + piedata[max_index].endAngle) /
                                    2
                                ) *
                                (innerRadius - 10);
                            return (
                                "translate(" +
                                (pie_width / 2 + widthT) +
                                "," +
                                (pie_height / 2 - heightT) +
                                ")"
                            );
                        })
                        .append("path")
                        .attr("d", marker)
                        .attr("fill", color(linear(dataset[max_index])))
                        .attr("transform", function() {
                            let ang = ((max_index - 0.5) * (2 * Math.PI)) / 12;
                            return "rotate(" + ((ang - Math.PI / 2) / Math.PI) * 180 + ")";
                        });
                    pie_svg
                        .append("g")
                        .attr("transform", function() {
                            let widthT =
                                Math.sin(
                                    (piedata[min_index].startAngle + piedata[min_index].endAngle) /
                                    2
                                ) *
                                (innerRadius - 10);
                            let heightT =
                                Math.cos(
                                    (piedata[min_index].startAngle + piedata[min_index].endAngle) /
                                    2
                                ) *
                                (innerRadius - 10);
                            return (
                                "translate(" +
                                (pie_width / 2 + widthT) +
                                "," +
                                (pie_height / 2 - heightT) +
                                ")"
                            );
                        })
                        .append("path")
                        .attr("d", marker)
                        .attr("fill", color(linear(dataset[min_index])))
                        .attr("transform", function() {
                            let ang = ((min_index - 0.5) * (2 * Math.PI)) / 12;
                            return "rotate(" + ((ang - Math.PI / 2) / Math.PI) * 180 + ")";
                        });
                    let updataMark = pie_svg
                        .selectAll("g")
                        .attr("class", "chart")
                        .data(piedata)
                        .enter()
                        .append("g")
                        .attr(
                            "transform",
                            "translate(" + pie_width / 2 + "," + pie_height / 2 + ")"
                        );
                    updataMark
                        .append("path")
                        .attr("d", function(d) {
                            return marker(d);
                        })
                        .attr("fill", function(d, i) {
                            return color(linear(dataset[i]));
                        });


                    let texts =  pie_svg.selectAll('.chart')
                        .data(['180','150','120','90','60','30','0','330','300','270','240','210'])
                        //.exit()
                        .append('text')
                        //.attr('transform',(d)=>{
                        //   //console.log(d);
                        //   return "translate("+arc.centroid(d)+")";
                        // })
                        .attr('x', (d,i) => Math.sin(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr('y', (d,i) => Math.cos(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr("text-anchor", "middle") //文字居中
                        .attr("font-size", "80%")//文字大小
                        .attr("text-anchor", "middle") //文字居中
                        .attr("fill","#FFF")
                        .text((d,i)=>d)
                        .attr("transform","translate("+0+","+3+")")


                    //////////////////////

                    /*let color_category = [
                        "#00FFFF",
                        "#00FF00",
                        "#FFFF00",
                        "#FF8C00",
                        "#FE8463"
                    ];

                    let inner_color = d3.scaleOrdinal(color_category);

                    let inner_dataset = [0,0,0,0,0].map(d=>Math.random()*50);

                    let inner_piedata = pie(inner_dataset);
                    //
                    let mini_outerRadius = 30; // 外半径
                    let mini_innerRadius = 0; // 内半径
                    let mini_arc = d3
                        .arc() // 弧生成器
                        .innerRadius(mini_innerRadius) // 设置内半径
                        .outerRadius(mini_outerRadius); // 设置外半径

                    let mini_arcs = pie_svg
                        .selectAll(".inner_group")
                        .data(inner_piedata)
                        .enter()
                        .append("g")
                        .attr("class", "inner_group");

                    mini_arcs.attr(
                        "transform",
                        "translate(" + pie_width / 2 + "," + pie_height / 2 + ")"
                    );

                    mini_arcs
                        .append("path")
                        .attr("fill", (d, i) => inner_color(i))
                        .attr("d", d => mini_arc(d))
                        .attr("stroke", "#FFFFFF")
                        .style("opacity", 0.4);*/

                    /////////////////////
                };
            },
            draw_poi_ring(curr_geohash) {
                let that = this;
                this.$http
                    .get("query", {
                        params: {
                            table: `poi_geohash where geo_hash = '${curr_geohash}'`
                        }
                    })
                    .then(res => {
                        //console.log(res.body);
                        let data = d3
                            .nest()
                            .key(d => d.type)
                            .entries(res.body);
                        //console.log(data);
                        draw_chart(data);
                        //this.$store.commit('poi_state',{data:data})
                    });

                function draw_chart(data) {
                    // 基于准备好的dom，初始化echarts实例
                    data = data
                        .map(d => {
                            return { name: d.key, value: d.values.length };
                        })
                        .filter(d => d.value > 1)
                        .filter(d => d.name !== "地名地址信息")
                        .filter(d => d.name !== "通行设施")
                        .filter(d => d.name !== "汽车维修")
                        .filter(d => d.name !== "[]");

                    let legend_data = data.map(d => d.name);

                    let myChart = that.$echarts.init(document.getElementById("poi_ring"));
                    // 绘制图表
                    myChart.setOption({
                        title: {
                            x: "center", //水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                            y: "0", //垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
                            text: "区域POI分布比例",
                            textStyle: {
                                //文字颜色
                                color: "#ffffff",
                                //字体风格,'normal','italic','oblique'
                                fontStyle: "normal",
                                //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                                fontWeight: "bold",
                                //字体系列
                                fontFamily: "sans-serif",
                                //字体大小
                                fontSize: 18
                            },
                            show:false
                        },
                        tooltip: {
                            confine: true,
                            trigger: "item",
                            formatter: "{a} <br/>{b}: {c} ({d}%)"
                        },
                        legend: {
                            show: false,
                            orient: "vertical",
                            x: "center",
                            data: legend_data,
                            textStyle: { color: "white" }
                        },
                        series: [
                            {
                                name: "POI类型",
                                type: "pie",
                                radius: ["45%", "80%"],
                                center : [ '50%', '50%' ],
                                avoidLabelOverlap: false,
                                label: {
                                    normal: {
                                        show: false,
                                        position: "center"
                                    },
                                    emphasis: {
                                        show: true,
                                        textStyle: {
                                            fontSize: "15",
                                            fontWeight: "bold"
                                        }
                                    }
                                },
                                labelLine: {
                                    normal: {
                                        show: true
                                    }
                                },
                                data: data
                            }
                        ]
                    });
                }
            },
            draw_buses_info(data){

                console.log(data);

                let myChart = this.$echarts.init(document.getElementById("buses_info"));

                let option = null;

                option = {
                    title:{
                        show:false,
                        text:'公交路线数: '+data.length,
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
                                show:true,
                                color:'#FFF',
                                position: 'right'
                            }
                        },
                        symbolSize:20,
                        itemStyle: {
                            normal: {
                                color: "#c96b2b",
                            }
                        },
                        data: data.map((d,i)=>{
                            return {id:i,name:d,category:i}
                        }),
                        categories:data.map((d,i)=>{
                            return {name:i}
                        }),
                        force: {
                            initLayout: 'gird',
                            // gravity: 0
                            layoutAnimation:true,
                            repulsion: 40,
                        }
                    }
                };

                if (option && typeof option === "object") {
                    myChart.setOption(option, true);
                }

            },

            changehead() {
                let that=this;

                var selectrange = that.$store.state.AllDayHour_state;
                var date = that.$store.state.calendar_state[0]; //获取当前的时间和时间段
                var witchhour = that.$store.state.calendar_state[1];
                var text = null;
                switch (selectrange) {
                    case 0:
                        text = "选中位置整个时间跨度内信息";
                        break;
                    case 1:
                        if (date == null) {
                            text = "选中位置2017-05-01信息";
                        }
                        else{
                            text="选中位置"+date+"信息";
                        }
                        break;
                    case 2:
                        if(date==null)
                        {
                            text="选中位置2017-05-01 0时-6时信息";
                        }
                        else{
                            if(witchhour==null){
                                text="选中位置"+date+" 0时-6时信息";
                            }
                            else{
                                //console.log(witchhour)
                                switch (parseInt(witchhour)) {
                                    case 0:
                                        text="选中位置"+date+" 0时-6时信息";
                                        break;
                                    case 1:
                                        text="选中位置"+date+" 6时-10时信息";
                                        break;
                                    case 2:
                                        text="选中位置"+date+" 10时-16时信息";
                                        break;
                                    case 3:
                                        text="选中位置"+date+" 16时-20时信息";
                                        break;
                                    case 4:
                                        text="选中位置"+date+" 20时-14时信息";
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                document.querySelector("#page_functionbar3\\.vue > div:nth-child(2) > h5").innerHTML=text;

            },
            drawbarchart() {
                var geoh = this.$store.state.geohash_state.geohash;
                if (geoh == null) return;
                var date = this.$store.state.calendar_state[0]; //获取当前的时间和时间段
                var witchhour = this.$store.state.calendar_state[1];
                //console.log(date);
                var selectrange = this.$store.state.AllDayHour_state;
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
                            POIbar.getdata(
                                "table=traffictype_hour where start_geo='" +
                                geoh +
                                "' and date='" +
                                date +
                                "' and timeSeparete='" +
                                witchhour +
                                "'",
                                geoh
                            );
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        components: {},
        computed: {},
        watch: {
            "$store.state.geohash_state": {
                handler(state) {

                    console.log('geohash_state');

                    //************************更新geohash**********************
                    //console.log(state.geohash);
                    this.geohash = state.geohash;
                    //*****************************************************

                    //////////////////////////////////////////////////////////////////////////////////////////////////
                    if(this.view_type === 0){
                        this.sql_od_matrix = `od_all where start_geo = '${this.geohash}'`;
                        this.sql_location = `angle_all_list where start_geo = '${this.geohash}'`;
                    }
                    else if(this.view_type === 1){
                        this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                        this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                    }
                    else if(this.view_type === 2){
                        this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                        this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '${this.time_separate}'`;
                    }
                    this.draw_od_matrix();
                    this.draw_location_ring();
                    //***********************************************************************************************//

                    this.draw_poi_ring(this.geohash);
                    //this.draw_buses_info(this.buses_data);
                    this.drawbarchart();
                    this.changehead();
                },
                deep: true
            },
            "$store.state.calendar_state": function(newdata, olddata) {
                console.log('calendar_state');
                let format = d3.timeFormat("%Y-%m-%d");
                this.date = format(new Date(newdata[0])).toString();

                let separate = {
                    '0-6':'0',
                    '6-10':'1',
                    '10-16':'2',
                    '16-20':'3',
                    '20-24':'4'
                };

                // 需要执行的代码
                if(this.view_type !== 2){
                    this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                }
                else if(this.view_type === 2){
                    //console.log(time);
                    this.time_separate = separate[newdata[1].replace('时','')];

                    this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '${this.time_separate}'`;
                }

                this.draw_od_matrix();
                this.draw_location_ring();

                this.drawbarchart();
                this.changehead();
            },
            "$store.state.AllDayHour_state": function(newdata, olddata) {
                console.log('all day hour -- state');
                this.view_type = newdata;
                this.changehead();
                // 需要执行的代码
                if(newdata === 0){
                    this.sql_od_matrix = `od_all where start_geo = '${this.geohash}'`;
                    this.draw_od_matrix(this.geohash);
                    this.sql_location = `angle_all_list where start_geo = '${this.geohash}'`;
                    //this.draw_location_ring();
                }
                else if(newdata === 1){
                    ////////////////////
                    this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.draw_od_matrix();
                    ////////////////////
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                    //this.draw_location_ring();
                    //////////////////////
                }
                else if(newdata === 2){
                    ////////////////////
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    //this.draw_od_matrix();
                    ////////////////////
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '0'`;
                    this.draw_location_ring();
                    //////////////////////
                }
            },
            '$store.state.buses_routes_state':{
                handler(state){
                    //console.log(state.routes);
                    this.buses_data = state.routes;
                    //this.draw_buses_info(this.buses_data)
                },
                deep:true
            }
        }
    };
</script>
<style>
  .funcbar_warp_bar2 {
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
  #od_matrix {
    height: 30%;
    /*background-color: #71ff70;*/
  }
  #od_matrix h5{
    position: absolute;
    left: 40%;
    z-index: 10;
    font: 15px sans-serif;
    color: grey !important;
  }

  #od_matrix .od_card {
    stroke: #e6e6e6;
    stroke-width: 1px;
  }

  #od_matrix text {
    fill: rgb(170, 170, 170);
    font-size: 12px;
  }

  #barchart {
    height: 30%;
  }
  #location_info {
    height: 28%;
    z-index: 1;
  }
  #poi_ring,#angle_ring,#buses_info{
    width:100%;
    height: 100%;
  }

  .ivu-tabs-bar {
    margin-bottom: 0;
  }

  .inner_div {
    position: absolute;
    z-index: 999;
    background-color: #fff;
  }
  .bar--positive {
    fill: steelblue;
  }

  .bar--negative {
    fill: #1A6840;
  }
  #barchart .axis text {
    font: 10px sans-serif;
  }

  #barchart .axis path,
  #barchart .axis line {
    fill: none;
    stroke: white;
    shape-rendering: crispEdges;
  }
  #barchart h2{
    font: 1rem sans-serif;
    color: grey !important;
  }
  #barchart h5{
    font: 15px sans-serif !important;
    color: grey !important;
  }
  #barchart .bars text {
    font: 10px sans-serif;
    fill: rgb(170, 170, 170);
  }
</style>>
