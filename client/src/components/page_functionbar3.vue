<template>
  <div id="page_functionbar3.vue" class="funcbar_warp_bar2">
    <div class="funcbar_warp_header">
      <h4>聚类信息栏</h4>
      <div class="line-separator-1"></div>
    </div>
    <div class="funcbar_warp_header">
      <h5 style="font-size: 1rem"></h5>
      <div class="line-separator-2"></div>
    </div>
    <!--    <div id="od_matrix"></div>-->

    <Carousel class="carousel" v-model="value1" arrow="never" loop>
      <CarouselItem>
        <div class="demo-carousel" id="geo_start"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-carousel" id="geo_dest"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-carousel" id="geo_time"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-carousel" id="geo_distance"></div>
      </CarouselItem>
    </Carousel>

    <h5 style="font-size: 1rem">TEST</h5>
    <div class="line-separator-2"></div>

    <Carousel class="carousel" v-model="value2" arrow="never" loop>
      <CarouselItem>
        <div class="demo-h-carousel" id="geo_h_start"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-h-carousel" id="geo_h_dest"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-h-carousel" id="geo_h_time"></div>
      </CarouselItem>
      <CarouselItem>
        <div class="demo-h-carousel" id="geo_h_distance"></div>
      </CarouselItem>
    </Carousel>

    <h5 style="font-size: 1rem">TEST</h5>
    <div class="line-separator-2"></div>

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
                view_type:0,
                value1: 0,
                value2:0,
                value3:0
            };
        },
        mounted() {
            POIbar.initchart();
            POIbar.initdata();

            document.querySelector("#page_functionbar3\\.vue > div:nth-child(2) > h5").innerHTML=`按天聚类信息`;
            //this.block_bar_chart('2','1','出发区域',"geo_start");
            //this.block_bar_chart('1','1','到达区域',"geo_dest");
            //this.block_bar_chart('3','1','出发时间',"geo_time");
            //this.block_bar_chart('4','1','出行距离',"geo_distance");

            document.querySelectorAll("h5")[3].innerHTML=`按时段聚类信息`;


            //this.block_bar_chart2('2','1','出发区域',"geo_h_start");
            //this.block_bar_chart2('1','1','到达区域',"geo_h_dest");
            //this.block_bar_chart2('3','1','出发时间',"geo_h_time");
            //this.block_bar_chart2('4','1','出行距离',"geo_h_distance");

            document.querySelectorAll("h5")[4].innerHTML=`其他辅助信息`;
            //this.draw_buses_info(this.buses_data);
        },
        updated(){
        },
        methods: {
            draw_od_matrix() {
                //console.log('draw_od_matrix');
                this.$http.get('query', {
                    params: {
                        table: this.sql_od_matrix
                    }
                }).then(res => {
                    //console.log(res.body[0]);
                    draw(res.body[0]);
                });

                let draw = (geo_data) => {

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
                            data.push({row: i, col: j, value: geo_data.matrix[i][j]});
                        }
                    }

                    let a = d3.rgb(0, 0, 0, 0);	//无色
                    let b = d3.rgb(0, 185, 0);	//绿色

                    let compute = d3.interpolate(a, b);

                    let linear = d3.scaleLinear()
                        .domain([0, d3.max(geo_data.matrix, (d) => {
                            return d3.max(d, s => s);
                        })])
                        .range([0, 1]);

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
                        .attr("fill", (d) => compute(linear(d.value)))
                        .on('mouseover', function () {
                        })
                        .on('mouseout', function () {
                        })
                        .style("opacity", 0)
                        .transition()
                        .duration(300)
                        .style("opacity", .8);

                    cards_g.selectAll('rect').append('title').text(d => d.value)
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
                        if (res.body[0])
                            draw(eval(res.body[0].count));
                        else
                            d3.select("#angle_ring").html('');
                    });

                let draw = dataset => {
                    //console.log(dataset);
                    let pie_width = 256;
                    let pie_height = 180;
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
                        .attr(
                            "transform",
                            "translate(" + (pie_margin.left + pie_width / 2.1) + "," + (pie_margin.top + pie_height / 2) + ")"
                        );
                    arcs
                        .append("path")
                        .attr("fill", function (d, i) {
                            //console.log(color(linear(dataset[i])));
                            return color(linear(dataset[i]));
                        })
                        .attr("d", function (d) {
                            return arc(d);
                        });
                    let marker = d3
                        .symbol()
                        .size(markerSize)
                        .type(d3.symbolTriangle);
                    pie_svg
                        .append("g")
                        .attr("transform", function () {
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
                                ((pie_margin.left + pie_width / 2.1) + widthT) +
                                "," +
                                ((pie_margin.top + pie_height / 2.1) - heightT) +
                                ")"
                            );
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
                                ((pie_margin.left + pie_width / 2.1) + widthT) +
                                "," +
                                ((pie_margin.top + pie_height / 2.1) - heightT) +
                                ")"
                            );
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
                        .attr(
                            "transform",
                            "translate(" + pie_width / 2 + "," + pie_height / 2 + ")"
                        );
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
                        //.exit()
                        .append('text')
                        //.attr('transform',(d)=>{
                        //   //console.log(d);
                        //   return "translate("+arc.centroid(d)+")";
                        // })
                        .attr('x', (d, i) => Math.sin(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr('y', (d, i) => Math.cos(i * Math.PI * 2 / rdata.length) * (outerRadius + 10))
                        .attr("text-anchor", "middle") //文字居中
                        .attr("font-size", "80%")//文字大小
                        .attr("text-anchor", "middle") //文字居中
                        .attr("fill", "#FFF")
                        .text((d, i) => d)
                        .attr("transform", "translate(" + 0 + "," + 3 + ")")


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
                            return {name: d.key, value: d.values.length};
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
                            show: false
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
                            textStyle: {color: "white"}
                        },
                        series: [
                            {
                                name: "POI类型",
                                type: "pie",
                                radius: ["45%", "80%"],
                                center: ['50%', '50%'],
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
            draw_buses_info(data) {

                //console.log(data);

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

                if (option && typeof option === "object") {
                    myChart.setOption(option, true);
                }
            },
            changehead() {
                let that = this;

                let selectrange = that.$store.state.AllDayHour_state;
                let date = that.$store.state.calendar_state[0]; //获取当前的时间和时间段
                let witchhour = that.$store.state.calendar_state[1];
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
            drawbarchart() {
                let geoh = this.$store.state.geohash_state.geohash;
                if (geoh == null) return;
                let date = this.$store.state.calendar_state[0]; //获取当前的时间和时间段
                let format = d3.timeFormat("%Y-%m-%d");
                date = format(new Date(date)).toString();
                let witchhour = this.$store.state.calendar_state[1];
                //console.log(date);
                let selectrange = this.$store.state.AllDayHour_state;
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

            ///////////////////////////////
            //////2019-11-18///////////////
            ///////////////////////////////
            create_cluster_legend() {

            },
            //add block_flow
            block_bar_chart(type, cluster_type, title, container) {

                let that = this;

                let echarts = this.$echarts;

                document.getElementById(container).style.width = 256 + 'px';
                document.getElementById(container).style.height = 190 + 'px';

                let myChart = this.$echarts.init(document.getElementById(container));

                this.$http.get('query', {
                    params: {
                        table: `cluster_d_${type} where d_cluster=${cluster_type}`
                    }
                }).then(res => {
                    //console.log(res.body);
                    if (type === '3') {
                        draw_charts(res.body);
                    }
                    else if(type === '4'){
                        draw_charts(res.body.sort((a, b) => {
                            return parseInt(b.ordercount) - parseInt(a.ordercount);
                        }).slice(0, 20).sort((a,b) => a.dis_divide-b.dis_divide));
                    }
                    else {
                        draw_charts(res.body.sort((a, b) => {
                            return parseInt(b.ordercount) - parseInt(a.ordercount);
                        }).slice(0, 20).sort(() => 0.5 - Math.random()));
                    }

                });

                function draw_charts(data) {
                    let xAxisData = [];
                    let data1 = [];
                    for (let i = 0; i < data.length; i++) {
                        xAxisData.push(data[i][Object.keys(data[i])[1]]);
                        data1.push(data[i].ordercount);
                    }

                    myChart.on('click', (params) => {
                        //console.log(params.name);
                        that.$store.commit('bar_geohash_state', params.name);
                    });

                    let option = {
                        //backgroundColor: '#0d235e',
                        title: {
                            text: `类别 ${cluster_type + title}流量TOP20`,
                            x: 'center',
                            textStyle: {
                                //文字颜色
                                color: "#ffffff",
                                //字体风格,'normal','italic','oblique'
                                fontStyle: "normal",
                                //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                                fontWeight: "100",
                                //字体系列
                                fontFamily: "sans-serif",
                                //字体大小
                                fontSize: 12
                            },
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            top: '15%',
                            right: '5%',
                            left: '15%',
                            bottom: '12%'
                        },
                        xAxis: [{
                            type: 'category',
                            data: xAxisData,
                            axisLine: {
                                lineStyle: {
                                    color: 'rgba(255,255,255,0.12)'
                                }
                            },
                            axisLabel: {
                                show: false,
                                margin: 10,
                                color: '#e2e9ff',
                                textStyle: {
                                    fontSize: 14
                                },
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: 'rgba(255,255,255,0.12)'
                                }
                            }
                        }],
                        yAxis: [{
                            axisLabel: {
                                color: '#e2e9ff',
                                textStyle: {
                                    fontSize: 10
                                },
                                formatter: function (d) {
                                    return d / 1000 + 'k';
                                },
                            },
                            axisLine: {},
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: 'rgba(255,255,255,0.12)'
                                }
                            }
                        }],
                        series: [{
                            type: 'bar',
                            data: data1,
                            itemStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(0,244,255,1)' // 0% 处的颜色
                                    }, {
                                        offset: 1,
                                        color: 'rgba(0,77,167,1)' // 100% 处的颜色
                                    }], false),
                                    barBorderRadius: [30, 30, 30, 30],
                                    shadowColor: 'rgba(0,160,221,1)',
                                    shadowBlur: 4,
                                }
                            },
                            label: {
                                normal: {
                                    show: false,
                                    lineHeight: 30,
                                    width: 80,
                                    height: 30,
                                    backgroundColor: 'rgba(0,160,221,0.1)',
                                    borderRadius: 200,
                                    position: ['-8', '-60'],
                                    distance: 1,
                                    formatter: [
                                        '    {d|●}',
                                        ' {a|{c}}   \n',
                                        '    {b|}'
                                    ].join(','),
                                    rich: {
                                        d: {
                                            color: '#3CDDCF',
                                        },
                                        a: {
                                            color: '#fff',
                                            align: 'center',
                                        },
                                        b: {
                                            width: 1,
                                            height: 30,
                                            borderWidth: 1,
                                            borderColor: '#234e6c',
                                            align: 'left'
                                        },
                                    }
                                }
                            }
                        }]
                    };

                    myChart.setOption(option);
                }
            },
            block_line_chart(type, cluster_type, title, container) {
                let that = this;
                let echarts = this.$echarts;
                document.getElementById(container).style.width = 256 + 'px';
                document.getElementById(container).style.height = 200 + 'px';

                let myChart = this.$echarts.init(document.getElementById(container));

                this.$http.get('query', {
                    params: {
                        table: `cluster_d_4`
                    }
                }).then(res => {
                    //console.log(d3.nest().key(d => d.d_cluster).entries(res.body));
                    draw(d3.nest().key(d => d.d_cluster).entries(res.body));
                });

                function draw(data) {

                    let option = {
                        //backgroundColor: '#394056',
                        title: {
                            show:false,
                            text: '请求数',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 16,
                                color: '#F1F1F3'
                            },
                            left: '6%'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                lineStyle: {
                                    color: '#57617B'
                                }
                            }
                        },
                        legend: {
                            show:false,
                            icon: 'rect',
                            itemWidth: 14,
                            itemHeight: 5,
                            itemGap: 13,
                            data: ['', '', ''],
                            right: '4%',
                            textStyle: {
                                fontSize: 12,
                                color: '#F1F1F3'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: [{
                            type: 'value',
                            boundaryGap: false,
                            axisLine: {
                                lineStyle: {
                                    color: '#57617B'
                                }
                            },
                            data: [0,10000]
                        }, {
                            axisPointer: {
                                show: false
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#57617B'
                                }
                            },
                            axisTick: {
                                show: false
                            },
                            position: 'bottom',
                            offset: 20,
                            data: []
                        }],
                        yAxis: [{
                            type: 'value',
                            name: '单位（%）',
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#57617B'
                                }
                            },
                            axisLabel: {
                                margin: 10,
                                textStyle: {
                                    fontSize: 14
                                }
                            }
                        }],
                        series: [{
                            name: '移动',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 5,
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    width: 1
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(137, 189, 27, 0.3)'
                                    }, {
                                        offset: 0.8,
                                        color: 'rgba(137, 189, 27, 0)'
                                    }], false),
                                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                                    shadowBlur: 10
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: 'rgb(137,189,27)',
                                    borderColor: 'rgba(137,189,2,0.27)',
                                    borderWidth: 12

                                }
                            },
                            data: [220, 182, 191, 134, 150, 120, 110, 125, 145, 122, 165, 122]
                        }, {
                            name: '电信',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 5,
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    width: 1
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(0, 136, 212, 0.3)'
                                    }, {
                                        offset: 0.8,
                                        color: 'rgba(0, 136, 212, 0)'
                                    }], false),
                                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                                    shadowBlur: 10
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: 'rgb(0,136,212)',
                                    borderColor: 'rgba(0,136,212,0.2)',
                                    borderWidth: 12

                                }
                            },
                            data: [120, 110, 125, 145, 122, 165, 122, 220, 182, 191, 150]
                        }, {
                            name: '联通',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 5,
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    width: 1
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0,
                                        color: 'rgba(219, 50, 51, 0.3)'
                                    }, {
                                        offset: 0.8,
                                        color: 'rgba(219, 50, 51, 0)'
                                    }], false),
                                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                                    shadowBlur: 10
                                }
                            },
                            itemStyle: {
                                normal: {

                                    color: 'rgb(219,50,51)',
                                    borderColor: 'rgba(219,50,51,0.2)',
                                    borderWidth: 12
                                }
                            },
                            data: [220, 182, 125, 145, 122, 191, 134, 150, 120, 110, 165, 122]
                        }, ]
                    };

                    myChart.setOption(option);
                }
            },

            /////////////////////
            block_bar_chart2(type,cluster_type,title,container){

                let that = this;

                document.getElementById(container).style.width = 256 + 'px';
                document.getElementById(container).style.height = 190 + 'px';

                let myChart = this.$echarts.init(document.getElementById(container));

                this.$http.get('query', {
                    params: {
                        table: `cluster_h_${type} where h_cluster=${cluster_type}`
                    }
                }).then(res => {
                    //console.log(res.body);
                    if (type === '3') {
                        draw(res.body);
                    } else if(type === '4'){
                        draw(res.body.sort((a, b) => {
                            return parseInt(b.ordercount) - parseInt(a.ordercount);
                        }).slice(0, 20).sort((a,b) => a.dis_divide-b.dis_divide));
                    }
                    else {
                        draw(res.body.sort((a, b) => {
                            return parseInt(b.ordercount) - parseInt(a.ordercount);
                        }).slice(0, 20).sort(() => 0.5 - Math.random()));
                    }
                });

                function draw(dataset) {
                    console.log(dataset);
                    let data = dataset.map(d=>d.ordercount);
                    let xdata = dataset.map(d=>d[Object.keys(d)[1]]);
                    let option = {
                        //backgroundColor: "#ea5a25",
                        tooltip: {
                            trigger: "item",
                            show: true
                        },
                        title: {
                            text: `时段 ${cluster_type+title}流量TOP20`,
                            x: 'center',
                            textStyle: {
                                //文字颜色
                                color: "#ffffff",
                                //字体风格,'normal','italic','oblique'
                                fontStyle: "normal",
                                //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                                fontWeight: "100",
                                //字体系列
                                fontFamily: "sans-serif",
                                //字体大小
                                fontSize: 12
                            },
                        },
                        grid: {
                            left: "5%",
                            top: "15%",
                            bottom: "15%",
                            right: "5%",
                            containLabel: true
                        },
                        xAxis: {
                            data: xdata,
                            formatter: "",
                            type: 'category',
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: '#fff' ,
                                    width:.1
                                }
                            },
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                show: false,
                                margin: 10,
                                color: '#e2e9ff',
                                textStyle: {
                                    fontSize: 14
                                },
                            },
                        },
                        yAxis: {
                            type: 'value',
                            //splitNumber: 4,
                            //interval: 50,
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: '#fff' ,
                                    width:.1
                                },

                            },
                            axisLine: {
                                show: false,
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                color: '#fff',
                                fontSize: 10
                            }
                        },
                        series: [{
                            type: 'bar',
                            animation: true,
                            barWidth: 4,
                            data: data,
                            tooltip: {
                                show: false
                            },
                            itemStyle: {
                                color: "#f2fec3"
                            },
                        },
                            {
                                type: 'scatter',
                                data: data,
                                symbolSize: 8,
                                itemStyle: {
                                    borderWidth: 0,
                                    opacity: 1,
                                    color: "#f2fec3"
                                }
                            }

                        ]
                    };

                    myChart.setOption(option);

                    myChart.on('click', (params) => {
                        //console.log(params.name);
                        that.$store.commit('bar_geohash_state', params.name);
                    });
                }
            }
        },
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
                    //this.draw_od_matrix();
                    this.draw_location_ring();
                    //***********************************************************************************************//

                    //this.draw_poi_ring(this.geohash);
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
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                }
                else if(this.view_type === 2){
                    //console.log(time);
                    this.time_separate = separate[newdata[1].replace('时','')];
                    console.log(newdata[1])
                    console.log(this.time_separate)
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    this.sql_location = `angle_hour_list where start_geo = '${this.geohash}' and date = '${this.date}' and timeSeparate = '${this.time_separate}'`;
                }

                //this.draw_od_matrix();
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
                    //this.sql_od_matrix = `od_all where start_geo = '${this.geohash}'`;
                    //this.draw_od_matrix(this.geohash);
                    this.sql_location = `angle_all_list where start_geo = '${this.geohash}'`;
                    //this.draw_location_ring();
                }
                else if(newdata === 1){
                    ////////////////////
                    //this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
                    //this.draw_od_matrix();
                    ////////////////////
                    this.sql_location = `angle_day_list where start_geo = '${this.geohash}' and date = '${this.date}'`;
                    //this.draw_location_ring();
                    //////////////////////
                }
                else if(newdata === 2){
                    ////////////////////
                    ////this.sql_od_matrix = `od_day where start_geo = '${this.geohash}' and day = '${this.date}'`;
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
    }
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

  h5{
    color: grey !important;
  }

  .funcbar_warp_header {
    padding-top: 10px;
    color: grey !important;
  }

  .carousel{
    width: 100%;
    height: 27.7%;
  }

  #barchart,
  #poi_ring,
  #angle_ring,
  #buses_info {
    width: 256px;
    height: 200px;
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
    fill: #1a6840;
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
  #barchart h2 {
    font: 1rem sans-serif;
    color: grey !important;
  }
  #barchart h5 {
    font: 15px sans-serif !important;
    color: grey !important;
  }
  #barchart text,
  #barchart .bars text {
    font: 10px sans-serif;
    fill: rgb(170, 170, 170);
  }
</style>>
