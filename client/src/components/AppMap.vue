<template>
  <div id="map" ref="basicMapbox"></div>
</template>

<script>
    import mapboxgl from 'mapbox-gl'
    //import d3 from 'd3'
    import { scaleLinear,scaleThreshold, nest, rgb, interpolate } from 'd3'
    import coordtrans from 'coordtransform'
    import ngeohash from 'ngeohash'

    String.prototype.toCSletray = function(){
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
    };

    export default {
        name: "AppMap",
        data() {
            return {
                map: null,
                data_day:null
            }
        },
        created() {
        },
        beforeMount(){
        },
        mounted() {
            this.map_config();
            this.grid_draw();
            this.od_geohash_init();
            this.gird_click();
            //this.load_all_order();
            //this.load_day_order();
            //this.load_district()
            //this.load_geohash();
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
                    center: [110.302071,19.9], // 设置地图中心
                    zoom: 11  // 设置地图比例
                    //pitch:50
                });

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
                            color:'#ffeb3d'
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
                this.map.on('load', ()=>{
                    this.map.addSource('district_polygon_source',{
                        'type': 'geojson',
                        'data': {
                            "type": "FeatureCollection",
                            "features": feature_polygons
                        }
                    });

                    this.map.addLayer({
                        'id': 'district_polygon_layer',
                        'type': 'fill',
                        'source': 'district_polygon_source',
                        'layout': {},
                        'paint': {
                            'fill-color': ['get','color'],
                            //'fill-outline-color':'#FFFFFF',
                            'fill-opacity': .1,
                        }
                    });

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
                });
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
                    //this.poi_draw(res.body);
                    this.poi_heatmap(res.body);
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
             * @gird_click()   绘制当前点击geohash
             * @od_geohash_init() 初始化OD格子Source&&Layer
             * @od_geohash_update()  更新OD网格
             * ////起点热点区域 | 终点热点区域////
            /-----------------------------------------*/
            gird_click(){

                this.map.on('load',()=>{
                    this.map.addSource('click_polygon_source',{
                        'type': 'geojson',
                        'data': {
                            "type": "FeatureCollection",
                            "features": []
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
                });

                this.map.on('click',(e)=> {
                    let curr_geohash = ngeohash.encode(e.lngLat.lat, e.lngLat.lng, 6);
                    let bbox = ngeohash.decode_bbox(curr_geohash);
                    //console.log(bbox);

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

                    this.$http.get('query',{
                        params:{
                            // table:"odcount where start_geo ='"+curr_geohash+"'"
                            table: `odcount where start_geo = '${curr_geohash}'`
                        }}).then((res) => {
                        this.od_geohash_update(res.body);
                        //console.log(res.body)
                    });
                });
            },
            od_geohash_init(){
                this.map.on('load',  () =>{
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

                    this.map.on('mouseenter','od_polygon_layer',e =>{
                        this.map.getCanvas().style.cursor = 'pointer';
                    });

                    this.map.on('mouseleave','od_polygon_layer',() =>{
                        this.map.getCanvas().style.cursor = '';
                    });

                    this.map.on('click','od_polygon_layer',() =>{
                        //alert(e.features[0].properties.value);
                    });
                });
            },
            od_geohash_update(data){

                let features_polygon = [];

                let color_scale = ["#23D561","#9CD523","#F1E229","#FFBF3A","#FB8C00","#FF5252"];

                let a = rgb(66,251,75);
                let b = rgb(255,0,7);
                let color = interpolate(a,b);

                let threshold=scaleThreshold()
                    .domain([.1,.2,.3,.5,.8])
                    .range(color_scale);

                let linear = scaleLinear()
                    .domain([0, 1])
                    .range([0, 1]);

                data.forEach(d =>{

                    let bbox = ngeohash.decode_bbox(d.dest_geo);

                    features_polygon.push({
                        'type': 'Feature',
                        "properties": {
                            'color':"#ee2d3e",
                            'value': parseFloat(d.value) +0.1
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

            },


            //--------------施工现场！！！！-----------------------------//
            load_all_order() {
                this.$http.get('query',{
                    params:{
                        table:'end_geohash'
                    }}).then((res) => {
                    this.geohash_draw(res.body);
                    //console.log(res.body);
                });
            },
            geohash_draw(data){

                let self = this;
                let feature_points = [];
                let features_polygon = [];

                let color_scale = ["#23D561","#9CD523","#F1E229","#FFBF3A","#FB8C00","#FF5252"];

                let a = rgb(66,251,75);
                let b = rgb(255,0,7);
                let color = interpolate(a,b);

                let threshold=scaleThreshold()
                    .domain([.1,.2,.3,.5,.8])
                    .range(color_scale);

                let linear = scaleLinear()
                    .domain([0, 1])
                    .range([0, 1]);

                //let size = 50;

                console.log(color(linear(0.5)));

                /*let pulsingDot = {
                    width: size,
                    height: size,
                    data: new Uint8Array(size * size * 4),

                    onAdd: function() {
                        let canvas = document.createElement('canvas');
                        canvas.width = this.width;
                        canvas.height = this.height;
                        this.context = canvas.getContext('2d');
                    },

                    render: function() {
                        let duration = 1000;
                        let t = (performance.now() % duration) / duration;

                        let radius = size / 2 * 0.3;
                        let outerRadius = size / 2 * 0.7 * t + radius;
                        let context = this.context;

                        // draw outer circle
                        context.clearRect(0, 0, this.width, this.height);
                        context.beginPath();
                        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
                        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                        context.fill();

                        // // draw inner circle
                        // context.beginPath();
                        // context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                        // context.fillStyle = 'rgba(255, 100, 100, 0)';
                        // context.strokeStyle = 'white';
                        // context.lineWidth = 0 + 4 * (1 - t);
                        // context.fill();
                        // context.stroke();

                        // update this image's data with data from the canvas
                        this.data = context.getImageData(0, 0, this.width, this.height).data;

                        // keep the map repainting
                        self.map.triggerRepaint();

                        // return `true` to let the map know that the image was updated
                        return true;
                    }
                };*/

                data.forEach(d =>{
                    let lnglat = ngeohash.decode();
                    let bbox = ngeohash.decode_bbox(d.geohash_index);
                    feature_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": color(linear(d.value)).toString(),
                            //"opacity":0.5,
                            "radius":5,
                            'value':d.value
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lnglat.longitude, lnglat.latitude]
                        }
                    });
                    //grid map
                    features_polygon.push({
                        'type': 'Feature',
                        "properties": {
                            "coordinates": [lnglat.longitude, lnglat.latitude],
                            'geohash':d.geohash_index,
                            'color':"#ee2d3e",
                            'value': parseFloat(d.value) + 0.1
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
                this.map.on('load',  () =>{
                    //rotateCamera(0);
                    //this.map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
                    //heatemap
                    /*this.map.addSource('heatmap_source', {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": feature_points
                        }
                    });
                    this.map.addLayer({
                        "id": "heatmap_layer",
                        "type": "heatmap",
                        "layout":{
                        },
                        "source": "heatmap_source",
                        "maxzoom": 14,
                        "paint": {
                            "heatmap-weight": [
                                "interpolate",
                                ["linear"],
                                ["get", "value"],
                                0, 0,
                                1, 1
                            ],
                            "heatmap-intensity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                8, 0,
                                14, 1
                            ],
                            "heatmap-color": [
                                "interpolate",
                                ["linear"],
                                ["heatmap-density"],
                                0, "rgb(33,102,172)",
                                0.2, "rgb(65,105,255)",
                                0.4, "rgb(75,250,154)",
                                0.6, "rgb(0,255,43)",
                                0.8, "rgb(205,205,10)",
                                1, "rgb(150,10,10)"
                            ],
                            "heatmap-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                8, 80,
                                14, 140
                            ],
                            "heatmap-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                8, 0,
                                14, 1
                            ]
                        }
                    }, 'waterway-label');*/
                    this.map.addSource('geohash_polygon_source',{
                        'type': 'geojson',
                        'data': {
                            "type": "FeatureCollection",
                            "features": features_polygon
                        }
                    });

                    this.map.addLayer({
                        'id': 'geohash_polygon_layer',
                        'type': 'fill',
                        'source': 'geohash_polygon_source',
                        "minzoom":8,
                        "maxzoom":14,
                        'layout': {},
                        'paint': {
                            'fill-color': ['get','color'],
                            //'fill-outline-color':'#FFFFFF',
                            'fill-opacity': ['get','value'],
                        }
                    });
                    // this.map.addSource("geohash_points_source", {
                    //     "type": "geojson",
                    //     'data':  {
                    //         "type": "FeatureCollection",
                    //         "features": feature_points
                    //     }
                    // });
                    // this.map.addLayer({
                    //     'id':'geohash_points_layer',
                    //     'source': 'geohash_points_source',
                    //     "type": "circle",
                    //     'layout': {},
                    //     'paint': {
                    //         'circle-color': ['get','color'],
                    //         'circle-opacity': ['get','opacity'],
                    //         'circle-radius':['get','radius']
                    //     }
                    // });

                    this.map.on('mouseenter','geohash_points_layer',()=>{
                        this.map.getCanvas().style.cursor = 'pointer';
                    });
                    this.map.on('mouseleave','geohash_points_layer',()=>{
                        this.map.getCanvas().style.cursor = '';
                    });
                    this.map.on('click','geohash_points_layer',(e)=>{
                        alert(e.features[0].geometry.coordinates)
                    });
                    // this.map.on('mouseenter','geohash_polygon_layer',e =>{
                    //     this.map.getCanvas().style.cursor = 'pointer';
                    //     this.map.setFilter('geohash_polygon_hover', ["!=", "geohash", e.features[0].properties.geohash]);
                    // });
                    //
                    // this.map.on('mouseleave','geohash_polygon_layer',() =>{
                    //     this.map.getCanvas().style.cursor = '';
                    //     this.map.setFilter('geohash_polygon_hover', ['!=', 'geohash', '']);
                    // });
                    //
                    // this.map.on('click','geohash_polygon_layer',() =>{
                    //     //alert(e.features[0].properties.value);
                    // });
                });
            },


            load_day_order(){
                this.$http.get('dataset/geohash/2017-05-01.csv').then((res) => {
                    let data = nest().key(d=>d.start_geo).entries(res.body.toCSletray());
                    this.data_day = data;
                    //console.log(data);
                    //this.geo_day_draw(data);
                    //this.geo_day_heatmap(data);
                    this.order_lines(data);
                });
            },
            geo_day_draw(data) {
                //console.log(data[0]);
                let test_data = data[0];
                //let origin_lnglat = ngeohash.decode(data[0].key);

                let feature_points = [];

                // feature_points.push({
                //     "type": "Feature",
                //     "properties": {
                //         // "color": threshold(d.value),
                //         "color": "#1bff14",
                //         "opacity": 0.5,
                //         "radius": 10
                //     },
                //     "geometry": {
                //         "type": "Point",
                //         "coordinates": [origin_lnglat.longitude, origin_lnglat.latitude]
                //     }
                // });

                let color_scale = ["#23D561","#9CD523","#F1E229","#FFBF3A","#FB8C00","#FF5252"];

                let threshold=scaleThreshold()
                    .domain([10,50,200,1000,10000])
                    .range(color_scale);

                test_data.values.forEach(d=>{

                    let lnglat = ngeohash.decode(d.start_geo);

                    feature_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": threshold(parseInt(d.count_start_geo)),
                            "geohash":d.start_geo,
                            //: "#3f61ff",
                            "opacity": 0.5,
                            "radius": 5
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lnglat.longitude, lnglat.latitude]
                        }
                    });
                });

                this.map.on('load',()=>{

                    this.map.addSource("geohash_day_source", {
                        "type": "geojson",
                        'data': {
                            "type": "FeatureCollection",
                            "features": feature_points
                        }
                    });

                    this.map.addLayer({
                        'id': 'geohash_day_layer',
                        'source': 'geohash_day_source',
                        "type": "circle",
                        'layout': {},
                        'paint': {
                            'circle-color': ['get', 'color'],
                            'circle-opacity': ['get', 'opacity'],
                            'circle-radius': ['get', 'radius']
                        }
                    });
                });

                this.map.on('mouseenter', 'geohash_day_layer', () => {
                    this.map.getCanvas().style.cursor = 'pointer';
                });

                this.map.on('mouseleave', 'geohash_day_layer', () => {
                    this.map.getCanvas().style.cursor = '';
                });

                this.map.on('click', 'geohash_day_layer', (e) => {
                    console.log(e.features[0].properties)
                });
            },
            geo_day_heatmap(data){

                let test_data = data[0];
                let poi_points = [];
                test_data.values.forEach(d=>{

                    let lnglat = ngeohash.decode(d.start_geo);

                    poi_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": '#4cff3d',
                            "opacity":0.1,
                            "radius":2,
                            "mag":d.count_start_geo
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lnglat.longitude, lnglat.latitude]
                        }
                    });
                });

                this.map.on('load',()=>{
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
                        "maxzoom": 12,
                        "paint": {
                            // Increase the heatmap weight based on frequency and property magnitude
                            "heatmap-weight": [
                                "interpolate",
                                ["linear"],
                                ["get", "mag"],
                                0, 0,
                                500, 1
                            ],
                            // Increase the heatmap color weight weight by zoom level
                            // heatmap-intensity is a multiplier on top of heatmap-weight
                            "heatmap-intensity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                9, 3,
                                12, 4
                            ],
                            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                            // Begin color ramp at 0-stop with a 0-transparancy color
                            // to create a blur-like effect.
                            "heatmap-color": [
                                "interpolate",
                                ["linear"],
                                ["heatmap-density"],
                                0, "rgba(33,102,172,0)",
                                0.2, "rgb(103,169,207)",
                                0.4, "rgb(209,229,240)",
                                0.6, "rgb(253,219,199)",
                                0.8, "rgb(239,138,98)",
                                1, "rgb(178,24,43)"
                            ],
                            // Adjust the heatmap radius by zoom level
                            "heatmap-radius": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                9, 10,
                                12, 50
                            ],
                            // Transition from heatmap to circle layer by zoom level
                            "heatmap-opacity": [
                                "interpolate",
                                ["linear"],
                                ["zoom"],
                                9, 1,
                                14, 0
                            ],
                        }
                    });
                });

            },
            order_lines(data){

                let data_test = data[200];

                let features_test = [];
                let features_nodes = [];

                let center = ngeohash.decode(data_test.key);
                //console.log(center);

                features_nodes.push({
                    "type": "Feature",
                    "properties": {
                        'color': 'rgb(181,74,51)',
                        "opacity":.8,
                        "radius":10
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [center.longitude, center.latitude]
                    }
                });

                data_test.values.forEach(d=>{

                    //console.log(d[Object.keys(d)[5]]);

                    let lngLat = ngeohash.decode(d.dest_geo);

                    features_test.push({
                        'type': 'Feature',
                        'properties': {
                            'color': 'rgb(181,74,51)',
                            'value':Math.sqrt(d[Object.keys(d)[5]]) * 0.1,
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [center.longitude,center.latitude],
                                [lngLat.longitude,lngLat.latitude]
                            ]
                        }
                    });

                    features_nodes.push({
                        "type": "Feature",
                        "properties": {
                            "color": '#ffeb3d',
                            "opacity":0.2,
                            "radius":1,
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lngLat.longitude, lngLat.latitude]
                        }
                    });
                });

                this.map.on('load',  () =>{


                    this.map.addSource('lines_source',{
                        'type': 'geojson',
                        'data':{
                            'type': 'FeatureCollection',
                            features:features_test
                        }
                    });

                    this.map.addLayer({
                        'id': 'lines_layer',
                        'type': 'line',
                        'source': 'lines_source',
                        'paint': {
                            'line-width': ['get','value'],
                            'line-color': ['get', 'color']
                        }
                    });

                    this.map.addSource("nodes_source", {
                        "type": "geojson",
                        'data': {
                            "type": "FeatureCollection",
                            "features": features_nodes
                        }
                    });

                    this.map.addLayer({
                        'id': 'nodes_layer',
                        'source': 'nodes_source',
                        "type": "circle",
                        'layout': {},
                        'paint': {
                            'circle-color': ['get', 'color'],
                            'circle-opacity': ['get', 'opacity'],
                            'circle-radius': ['get', 'radius']
                        }
                    });

                });


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

                    //公交路网
                    //console.log(map_state.buses_layer);
                    map_state.buses_layer? this.load_buses():
                        this.map.getLayer('buses_routes_layer')?
                            this.map.removeLayer('buses_routes_layer')&this.map.removeLayer('buses_stations_layer')&
                            this.map.removeSource('buses_routes_source')&this.map.removeSource('buses_stations_source'):null;

                    //地图网格
                    //console.log(map_state.gird_layer);
                    map_state.gird_layer? this.map.setLayoutProperty('gird_layer', 'visibility', 'visible'):
                        this.map.setLayoutProperty('gird_layer', 'visibility', 'none');

                },
                deep:true
            }
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
