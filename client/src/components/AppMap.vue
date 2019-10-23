<template>
  <div id="map" ref="basicMapbox"></div>
</template>

<script>

    import mapboxgl from 'mapbox-gl'
    import * as d3 from 'd3'
    import coordtrans from 'coordtransform'
    import ngeohash from 'ngeohash'

    /*String.prototype.toCSV = function(){
         let data = [];
         let relArr = this.split("\n");
         if(relArr.length > 1) {
             let title = relArr[0].split(',');
             let title_arr = title.keys();
             for(let key = 1, len = relArr.length-1; key < len; key++) {
                 let values = relArr[key];
                 let objArr = values.split(",");
                 let obj = {};
                 for(let i=0;i<title.length;i++){
                     obj[title[title_arr.next().value]] = objArr[i];
                 }
                 data.push(obj);
                 title_arr = title.keys();
             }
         }
         return data;
     };*/

    export default {
        name: "AppMap",
        data() {
            return {
                //data
                geo_routes:{},
                buses_data:[],

                //init config
                map: null,
                date:'2017-05-01',
                sql_table:'od_all_count',
                od_type:'od'
            }
        },
        created() {
        },
        beforeMount(){
        },
        mounted() {
            //数据加载
            this.load_buses_data();
            this.load_geo_routes();

            //地图处理
            this.map_config();
            this.grid_draw();
            this.geohash_init();

        },
        methods: {

            /*----------------------------------------/
            * Fun - 初始化地图配置
            * @map_config()
            /-----------------------------------------*/
            map_config() {
                mapboxgl.accessToken = 'pk.eyJ1Ijoid2VpeGluemhhbyIsImEiOiJjazBqYnFwY3owOGV4M25uMXlnc2tweTcxIn0.7Pk6JhKBB-nogxXiNTGnZQ';
                this.map = new mapboxgl.Map({
                    container: this.$refs.basicMapbox,
                    style: 'mapbox://styles/mapbox/dark-v9',
                    center: [110.32953682031234,19.973591989780688], // 设置地图中心
                    zoom: 11  // 设置地图比例
                    //pitch:50
                });
                // this.map.on('click',(e)=>{
                //     console.log(e.lngLat);
                // })
            },

            /*----------------------------------------/
            * Fun - 绘制公交路线
            * @load_buses() 加载本地公交数据
            * @buses_draw() 绘制公交路线及站点
            /-----------------------------------------*/
            load_buses(){
                this.$http.get('dataset/buses_data/buses_data.json').then((res) => {
                    //.log(res.body);
                    this.buses_draw(res.body);
                });
            },
            buses_draw(data){
                //console.log(data);
                let feature_buslines = [];
                let feature_buspoints = [];
                let stations = [];

                data.forEach(d=>{
                    //station geo data
                    d.stations.forEach(s=>{
                        if(stations.indexOf(s.name) === -1){
                            stations.push(s.name);
                            feature_buspoints.push({
                                "type": "Feature",
                                "properties": {
                                    "color": '#ff4f6a',
                                    "opacity":0.5,
                                    "radius":2
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": this.coordtrans_bdtowgs84(s.position)
                                }
                            });
                        }
                        else {
                        }
                    });
                    //buses line data
                    feature_buslines.push({
                        "type": "Feature",
                        "properties": {
                            color:'#ffeb3d',
                            name:parseInt(d.name)+'路'
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": d.path.map(s =>{
                                let bd09togcj02=coordtrans.bd09togcj02(s[0],s[1]);
                                return coordtrans.gcj02towgs84(bd09togcj02[0],bd09togcj02[1])
                            })
                        }
                    });
                });
                //this.map.on('load',  ()=>{

                //console.log(feature_buslines);
                this.map.addSource("buses_stations_source", {
                    "type": "geojson",
                    'data':  {
                        "type": "FeatureCollection",
                        "features": feature_buspoints
                    }
                });
                this.map.addLayer({
                    'id':'buses_stations_layer',
                    'source': 'buses_stations_source',
                    "type": "circle",
                    'layout': {},
                    'paint': {
                        'circle-color': ['get','color'],
                        'circle-opacity': ['get','opacity'],
                        'circle-radius':['get','radius']
                    }
                });

                this.map.addSource('buses_routes_source',{
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": feature_buslines
                    }
                });
                this.map.addLayer({
                    "id": "buses_routes_layer",
                    "type": "line",
                    "source":'buses_routes_source',
                    "layout": {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    "paint": {
                        "line-color": ['get','color'],
                        "line-width": 0.3,
                        "line-opacity": 0.4
                    }
                });

                //});
            },

            /*----------------------------------------/
            * Fun - 绘制行政区域
            * @load_district() 加载本地行政区域数据
            * @district_draw() 绘制行政区域
            /-----------------------------------------*/
            load_district(){
                this.$http.get('dataset/district_data/district.json').then((res) => {
                    let district = res.body;
                    district.forEach((d)=>{
                        d.polyline = d.polyline.split(';').map((d)=>{
                            return d.split(',');
                        });
                    });
                    this.district_draw(district);
                    //console.log(this.district);
                });
            },
            district_draw(data){
                //console.log(data);
                let feature_lines = [];
                let feature_polygons = [];
                let district_color = ['#ff722c','#ff4f6a','#48b6ff','#3dffaf'];

                data.forEach((d,i)=>{
                    feature_lines.push({
                        "type": "Feature",
                        "properties": {
                            color:district_color[i]
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": d.polyline
                        }
                    });

                    feature_polygons.push({
                        'type': 'Feature',
                        "properties": {
                            'color': district_color[i],
                        },
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [d.polyline]
                        }
                    });
                });
                //this.map.on('load', ()=>{
                // this.map.addSource('district_polygon_source',{
                //     'type': 'geojson',
                //     'data': {
                //         "type": "FeatureCollection",
                //         "features": feature_polygons
                //     }
                // });
                //
                // this.map.addLayer({
                //     'id': 'district_polygon_layer',
                //     'type': 'fill',
                //     'source': 'district_polygon_source',
                //     'layout': {},
                //     'paint': {
                //         'fill-color': ['get','color'],
                //         //'fill-outline-color':'#FFFFFF',
                //         'fill-opacity': .1,
                //     }
                // });

                //district outline
                this.map.addSource('district_outline_source',{
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": feature_lines
                    }
                });
                this.map.addLayer({
                    "id": "district_outline_layer",
                    "type": "line",
                    "source":'district_outline_source',
                    "layout": {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    "paint": {
                        "line-color": ['get','color'],
                        "line-width": 1
                    }
                });
                //});
            },

            /*----------------------------------------/
             * Fun - 绘制POI
             * @load_poi() 加载POI数据
             * @poi_draw() 绘制POI散点图
             * @poi_heatmap() 绘制POI热力图
            /-----------------------------------------*/
            load_poi(){
                this.$http.get('poi_haikou',{
                    params: {
                        //sql:'where type="餐饮服务"'
                        // sql:'where type="公司企业"'
                        sql:'where type="购物服务"'
                    },
                }).then((res) => {
                    //console.log(res.body);
                    this.poi_draw(res.body);
                    //this.poi_heatmap(res.body);
                });
            },
            poi_draw(data){

                let poi_points = [];

                data.forEach(d=>{
                    poi_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": '#4cff3d',
                            "opacity":0.1,
                            "radius":2
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": this.coordtrans_bdtowgs84([d.lng,d.lat])
                        }
                    });
                });

                //this.map.on('load',()=>{

                this.map.addSource("poi_points_source", {
                    "type": "geojson",
                    'data':  {
                        "type": "FeatureCollection",
                        "features": poi_points
                    }
                });
                this.map.addLayer({
                    'id':'poi_points_layer',
                    'source': 'poi_points_source',
                    "type": "circle",
                    'layout': {},
                    'paint': {
                        'circle-color': ['get','color'],
                        'circle-opacity': ['get','opacity'],
                        'circle-radius':['get','radius']
                    }
                });
                // });
            },
            poi_heatmap(data){

                let poi_points = [];

                data.forEach(d=>{
                    poi_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": '#4cff3d',
                            "opacity":0.1,
                            "radius":2
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": this.coordtrans_bdtowgs84([d.lng,d.lat])
                        }
                    });
                });

                //this.map.on('load',()=>{
                //heatemap
                this.map.addSource('poi_heatmap_source', {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": poi_points
                    }
                });
                this.map.addLayer({
                    "id": "poi_heatmap_layer",
                    "type": "heatmap",
                    "layout":{
                    },
                    "source": "poi_heatmap_source",
                    "maxzoom": 14,
                    "paint": {
                        // Increase the heatmap color weight weight by zoom level
                        // heatmap-intensity is a multiplier on top of heatmap-weight
                        "heatmap-intensity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9, 1,
                            15, 3
                        ],
                        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                        // Begin color ramp at 0-stop with a 0-transparancy color
                        // to create a blur-like effect.
                        "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0, "rgba(33,102,172,0)",
                            0.2, "rgb(65,105,255)",
                            0.4, "rgb(75,250,154)",
                            0.6, "rgb(0,255,43)",
                            0.8, "rgb(205,205,10)",
                            1, "rgb(150,10,10)"
                        ],
                        // Adjust the heatmap radius by zoom level
                        "heatmap-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9, 2,
                            15, 20
                        ],
                        // Transition from heatmap to circle layer by zoom level
                        "heatmap-opacity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9, 1,
                            15, 0
                        ]
                    }
                });

            },

            /*----------------------------------------/
             * Fun - 绘制网格
             * @grid_grid() 加载POI数据
            /-----------------------------------------*/
            grid_draw(){

                let lng_step =  0.01098632812591;
                let lat_step =  0.00550243344991;
                let start_lng = 110.1708984375 - 10 * lng_step;
                let start_lat = 20.06682819570 + 10 * lat_step;

                //let coord = [110.1708984375, 20.06653319570559]; //left up
                //let coord = [110.181884765625, 20.06653319570559]; //right up
                //let coord = [110.181884765625, 20.06103076225598]; //right down
                //let coord = [110.1708984375, 20.06653319570559]; //left down

                let features_line = [];

                for(let i=0;i<=90;i++){
                    features_line.push({
                        'type': 'Feature',
                        'properties': {
                            'color': 'rgb(181,124,71)'
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [start_lng + lng_step * i,start_lat],
                                [start_lng + lng_step * i,start_lat - lat_step * 110]
                            ]
                        }
                    });
                }

                for(let i=0;i<=110;i++) {
                    features_line.push({
                        'type': 'Feature',
                        'properties': {
                            'color': 'rgb(181,124,71)'
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [start_lng, start_lat - lat_step * i],
                                [start_lng + lng_step * 90, start_lat - lat_step * i]
                            ]
                        }
                    });

                }

                // this.map.on('click',  (e)=> {
                //     console.log(e.lngLat);
                //     console.log(ngeohash.encode(e.lngLat.lat, e.lngLat.lng,6));
                //     // new mapboxgl.Popup()
                //     //     .setLngLat(e.lngLat)
                //     //     .setHTML(e.lngLat)
                //     //     .addTo(this.map);
                // });

                this.map.on('load',  () =>{

                    this.map.addSource('gird_source',{
                        'type': 'geojson',
                        'data':{
                            'type': 'FeatureCollection',
                            features:features_line
                        }
                    });

                    this.map.addLayer({
                        'id': 'gird_layer',
                        'type': 'line',
                        'source': {
                            'type': 'geojson',
                            'data':{
                                'type': 'FeatureCollection',
                                features:features_line
                            }
                        },
                        'paint': {
                            'line-width': 0.1,
                            'line-color': ['get', 'color']
                        }
                    });

                });

            },

            /*----------------------------------------/
             * Fun - 点击网格事件
             * @geohash_init() 初始化OD格子Source&&Layer
             * @geohash_update()  更新OD网格
             * ////起点热点区域 | 终点热点区域////
            /-----------------------------------------*/
            geohash_init(){

                let default_bbox = ngeohash.decode_bbox('w7w3y9');

                this.map.on('load',  () =>{

                    this.map.addSource('click_polygon_source',{
                        'type': 'geojson',
                        'data': {
                            "type": "FeatureCollection",
                            "features": [{
                                'type': 'Feature',
                                "properties": {},
                                'geometry': {
                                    'type': 'Polygon',
                                    'coordinates': [[
                                        [default_bbox[1], default_bbox[0]],
                                        [default_bbox[3], default_bbox[0]],
                                        [default_bbox[3], default_bbox[2]],
                                        [default_bbox[1], default_bbox[2]]
                                    ]]
                                }
                            }]
                        }
                    });
                    this.map.addLayer({
                        'id': 'click_polygon_layer',
                        'type': 'fill',
                        'source': 'click_polygon_source',
                        'layout': {},
                        'paint': {
                            'fill-color': 'rgba(0,0,0,0)',
                            'fill-outline-color':'#57ff22'
                        }
                    });

                    this.map.addSource('od_polygon_source',{
                        'type': 'geojson',
                        'data': {
                            "type": "FeatureCollection",
                            "features": []
                        }
                    });
                    this.map.addLayer({
                        'id': 'od_polygon_layer',
                        'type': 'fill',
                        'source': 'od_polygon_source',
                        'layout': {},
                        'paint': {
                            'fill-color': ['get','color'],
                            // 'fill-outline-color':'#FFFFFF',
                            'fill-opacity': ['get','value'],
                        }
                    });

                    this.map.addSource("geo_stations_source", {
                        "type": "geojson",
                        'data':  {
                            "type": "FeatureCollection",
                            "features": []
                        }
                    });
                    this.map.addLayer({
                        'id':'geo_stations_layer',
                        'source': 'geo_stations_source',
                        "type": "circle",
                        'layout': {},
                        'paint': {
                            'circle-color': ['get','color'],
                            'circle-opacity': ['get','opacity'],
                            'circle-radius':['get','radius']
                        }
                    });
                    this.map.addSource('geo_routes_source',{
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": []
                        }
                    });
                    this.map.addLayer({
                        "id": "geo_routes_layer",
                        "type": "line",
                        "source":'geo_routes_source',
                        "layout": {
                            "line-join": "round",
                            "line-cap": "round"
                        },
                        "paint": {
                            "line-color": ['get','color'],
                            "line-width": 0.3,
                            "line-opacity": 0.4
                        }
                    });

                    this.map.on('mouseenter','od_polygon_layer',e =>{
                        this.map.getCanvas().style.cursor = 'pointer';
                    });

                    this.map.on('mouseleave','od_polygon_layer',() =>{
                        this.map.getCanvas().style.cursor = '';
                    });

                    this.map.on('click','od_polygon_layer',() =>{
                        //alert(e.features[0].properties.value);
                    });

                    //初始化OD
                    this.geohash_update();
                });

                this.map.on('click',(e)=> {
                    let curr_geohash = ngeohash.encode(e.lngLat.lat, e.lngLat.lng, 6);

                    // new mapboxgl.Popup()
                    //     .setLngLat([e.lngLat.lng, e.lngLat.lat])
                    //     .setHTML('<APP_POI></APP_POI>')
                    //     .addTo(this.map);

                    let bbox = ngeohash.decode_bbox(curr_geohash);
                    let features_polygon = [{
                        'type': 'Feature',
                        "properties": {
                        },
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[
                                [bbox[1], bbox[0]],
                                [bbox[3], bbox[0]],
                                [bbox[3], bbox[2]],
                                [bbox[1], bbox[2]]
                            ]]
                        }
                    }];

                    this.map.getSource('click_polygon_source').setData({
                        "type": "FeatureCollection",
                        "features": features_polygon
                    });

                    //更新格子
                    this.geohash_update(curr_geohash);
                });
            },
            geohash_update(curr_geohash='w7w3y9'){

                //初始化
                this.map.getSource('od_polygon_source').setData({
                    "type": "FeatureCollection",
                    "features": []
                });

                this.map.getSource('geo_stations_source').setData({
                    "type": "FeatureCollection",
                    "features": []
                });

                this.map.getSource('geo_routes_source').setData({
                    "type": "FeatureCollection",
                    "features": []
                });

                //更新geohash_state
                this.$store.commit('geohash_state',{geohash:curr_geohash});

                //当前geohash公交路线
                //console.log(this.geo_routes[curr_geohash]);
                this.draw_geo_buses(curr_geohash);

                this.$http.get('query',{
                    params:{
                        table: `${this.sql_table} where start_geo = '${curr_geohash}'`

                    }}).then((res) => {
                    update(res.body);
                    //console.log(res.body)
                });

                //更新OD
                let update = (data)=> {

                    let features_polygon = [];

                    let linear = d3.scaleLinear()
                        .domain([0, d3.max(data,(d)=>d.count)+5])
                        .range([0.1, .8]);

                    //console.log(d3.max(data,(d)=>d.count));

                    data.forEach(d =>{

                        let bbox = ngeohash.decode_bbox(d.dest_geo);

                        let color = '';

                        if(this.od_type === 'od')
                            color = '#04759D';
                        else
                            color = '#d8363a';

                        //console.log(linear(d.count));

                        features_polygon.push({
                            'type': 'Feature',
                            "properties": {
                                'color': color,
                                'value': linear(d.count)
                            },
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[
                                    [bbox[1],bbox[0]],
                                    [bbox[3],bbox[0]],
                                    [bbox[3],bbox[2]],
                                    [bbox[1],bbox[2]]
                                ]]
                            }
                        });
                    });

                    this.map.getSource('od_polygon_source').setData({
                        "type": "FeatureCollection",
                        "features": features_polygon
                    });
                }

            },

            /*----------------------------------------/
             * Fun - 加载公交路线
             * @load_geo_routes()
             * @load_buses_data()
             * @draw_geo_buses()
            /-----------------------------------------*/
            load_geo_routes(){
                this.$http.get('dataset/buses_data/geo_routes.json').then(res=>{
                    this.geo_routes = res.body;
                    //console.log(this.geo_routes);
                });
            },
            load_buses_data(){
                this.$http.get('dataset/buses_data/buses_data.json').then(res=>{
                    this.buses_data = res.body;
                });
            },
            draw_geo_buses(curr_geohash='w7w3y9'){
                let routes = this.geo_routes[curr_geohash]?this.geo_routes[curr_geohash]:[]

                //公交路线
                this.$store.commit('buses_routes_state',{routes:routes.map(d=>parseInt(d)+'路')});

                //console.log(routes);
                let data = this.buses_data.filter(d=>{
                    return routes.includes(d.name);
                });

                //console.log(data);

                let feature_buslines = [];
                let feature_buspoints = [];
                let stations = [];

                data.forEach(d=>{
                    //station geo data
                    d.stations.forEach(s=>{
                        if(stations.indexOf(s.name) === -1){
                            stations.push(s.name);
                            feature_buspoints.push({
                                "type": "Feature",
                                "properties": {
                                    "color": '#ff4f6a',
                                    "opacity":0.5,
                                    "radius":2
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": this.coordtrans_bdtowgs84(s.position)
                                }
                            });
                        }
                        else {
                        }
                    });
                    //buses line data
                    feature_buslines.push({
                        "type": "Feature",
                        "properties": {
                            color:'#ffeb3d',
                            name:parseInt(d.name)+'路'
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": d.path.map(s =>{
                                let bd09togcj02=coordtrans.bd09togcj02(s[0],s[1]);
                                return coordtrans.gcj02towgs84(bd09togcj02[0],bd09togcj02[1])
                            })
                        }
                    });
                });

                //this.map.on('load',  ()=>{
                this.map.getSource('geo_stations_source').setData({
                    "type": "FeatureCollection",
                    "features": feature_buspoints
                });

                this.map.getSource('geo_routes_source').setData({
                    "type": "FeatureCollection",
                    "features": feature_buslines
                });
                //});

            },

            coordtrans_bdtowgs84(lnglat){
                let bd09togcj02 = coordtrans.bd09togcj02(lnglat[0], lnglat[1]);
                return coordtrans.gcj02towgs84(bd09togcj02[0], bd09togcj02[1])
            },
        },
        watch:{
            //监控控制面板图层按钮
            '$store.state.map_state':{
                handler(){
                    //console.log(this.$store.state.map_state);
                    let map_state = this.$store.state.map_state;

                    //地图网格
                    //console.log(map_state.gird_layer);
                    map_state.gird_layer? this.map.setLayoutProperty('gird_layer', 'visibility', 'visible'):
                        this.map.setLayoutProperty('gird_layer', 'visibility', 'none');

                    //POI
                    //console.log(map_state.poi_layer);
                    map_state.poi_layer? this.load_poi():
                        this.map.getLayer('poi_points_layer')?
                            this.map.removeLayer('poi_points_layer')&this.map.removeSource('poi_points_source'):null;

                    //公交路网
                    //console.log(map_state.buses_layer);
                    map_state.buses_layer? this.load_buses():
                        this.map.getLayer('buses_routes_layer')?
                            this.map.removeLayer('buses_routes_layer')&this.map.removeLayer('buses_stations_layer')&
                            this.map.removeSource('buses_routes_source')&this.map.removeSource('buses_stations_source'):null;

                    //行政区划
                    //console.log(map_state.district_layer);
                    map_state.district_layer? this.load_district():
                        this.map.getLayer('district_outline_layer')?
                            this.map.removeLayer('district_outline_layer')&this.map.removeSource('district_outline_source'):null;

                },
                deep:true
            },
            "$store.state.AllDayHour_state":{
                handler(type){

                    //All
                    if(type === 0){
                        //OD
                        if(this.od_type === 'od'){
                            this.sql_table = 'od_all_count'
                        }
                        //DO
                        else{
                            this.sql_table = 'do_all_count'
                        }
                        this.geohash_update();
                    }
                    else if(type === 1){
                        //OD
                        if(this.od_type === 'od'){
                            this.sql_table = 'od_'+this.date.replace(/-/g,'');
                        }
                        //DO
                        else{
                            this.sql_table = 'do_'+this.date.replace(/-/g,'');
                        }
                        this.geohash_update();
                    }
                }
            },
            "$store.state.calendar_state": function(date) {
                this.date = date[0];
                //OD
                if(this.od_type === 'od'){
                    this.sql_table = 'od_'+this.date.replace(/-/g,'');
                }
                //DO
                else{
                    this.sql_table = 'do_'+this.date.replace(/-/g,'');
                }
                this.geohash_update();
            },
            //"$store.state.od_type":{
            // handler(type){
            //  this.od_type = type;
            // }
            // }
        }
    }
</script>

<style>

  @import url('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
  #map{
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .mapboxgl-ctrl-bottom-left,
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-logo{
    display: none;
  }

</style>
