<template>
    <div id="map" ref="basicMapbox"></div>
</template>

<script>
    import mapboxgl from 'mapbox-gl'
    import ngeohash from 'ngeohash'
    import { scale } from 'd3'

    export default {
        name: "AppMap",
        data() {
            return {
                map: null,
                accessToken: 'pk.eyJ1Ijoid2VpeGluemhhbyIsImEiOiJjazBqYnFwY3owOGV4M25uMXlnc2tweTcxIn0.7Pk6JhKBB-nogxXiNTGnZQ',
                data:null
            }
        },
        created() {
            this.get_data();
        },
        mounted() {
            this.init_map();
        },
        methods: {
            init_map() {
                mapboxgl.accessToken = this.accessToken;
                this.map = new mapboxgl.Map({
                    container: this.$refs.basicMapbox,
                    style: 'mapbox://styles/mapbox/dark-v9',
                    center: [110.296322, 20.018466], // 设置地图中心
                    zoom: 10,  // 设置地图比例
                    //pitch:50
                });
            },
            get_data(name = 'start_geohash') {
                this.$http.get(`query?name=${ name }`).then((res) => {
                    this.data = res.body;
                    //console.log(res.body);
                    this.draw_map();
                });
            },
            draw_map() {

                let self = this;

                let feature_points = [];
                //let featture_polygon = [];

                let color_scale = ["#23D561","#9CD523","#F1E229","#FFBF3A","#FB8C00","#FF5252"];

                let threshold=scale.threshold()
                    .domain([.1,.3,.5,.7,.9])
                    .range(color_scale);

                let size = 50;

                let pulsingDot = {
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
                };

                this.data.forEach(d =>{

                    let lnglat = ngeohash.decode(d[Object.keys(d)[0]]);
                    //let bbox = ngeohash.decode_bbox(d.geohash_start_index);

                    feature_points.push({
                        "type": "Feature",
                        "properties": {
                            "color": threshold(d.value),
                            "opacity":0.5,
                            "radius":5,
                            'value':d.value
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lnglat.longitude, lnglat.latitude]
                        }
                    });

                    //grid map
                    /*featture_polygon.push({
                        'type': 'Feature',
                        "properties": {
                            "coordinates": [lnglat.longitude, lnglat.latitude],
                            'geohash':d.geohash_start_index,
                            'color':threshold(d.value),
                            'value': d.geohash_start_sum
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
                    });*/
                });

                this.map.on('load',  () =>{

                    //rotateCamera(0);

                    this.map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

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


                    // this.map.addSource('geohash_polygon_source',{
                    //     'type': 'geojson',
                    //     'data': {
                    //         "type": "FeatureCollection",
                    //         "features": featture_polygon
                    //     }
                    // });
                    //
                    // this.map.addLayer({
                    //     'id':'geohash_polygon_hover',
                    //     'type': 'fill',
                    //     'source': 'geohash_polygon_source',
                    //     'paint': {
                    //         'fill-opacity':.2,
                    //         'fill-outline-color':'#FFFFFF'
                    //     },
                    //     'layout': {},
                    //     "filter": ["==", "geohash", ""],
                    //     "minzoom":8,
                    //     "maxzoom":14,
                    // });
                    //
                    // this.map.addLayer({
                    //     'id': 'geohash_polygon_layer',
                    //     'type': 'fill',
                    //     'source': 'geohash_polygon_source',
                    //     "minzoom":8,
                    //     "maxzoom":14,
                    //     'layout': {},
                    //     'paint': {
                    //         'fill-color': ['get','color'],
                    //         //'fill-outline-color':'#FFFFFF',
                    //         'fill-opacity': .8,
                    //     }
                    // },'geohash_polygon_hover');

                    this.map.addSource("geohash_points_source", {
                        "type": "geojson",
                        'data':  {
                            "type": "FeatureCollection",
                            "features": feature_points
                        }
                    });
                    this.map.addLayer({
                        'id':'geohash_points_layer',
                        'source': 'geohash_points_source',
                        "type": "circle",
                        'layout': {},
                        'paint': {
                            'circle-color': ['get','color'],
                            'circle-opacity': ['get','opacity'],
                            'circle-radius':['get','radius']
                        }
                    });

                    this.map.addLayer({
                        "id": "points",
                        "type": "symbol",
                        "source": {
                            "type": "geojson",
                            "data": {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [110.3192138671875,20.025330804294114]
                                    }
                                }]
                            }
                        },
                        "layout": {
                            "icon-image": "pulsing-dot"
                        }
                    });

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

                // let rotateCamera = (timestamp) =>{
                // // clamp the rotation between 0 -360 degrees
                // // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
                //     this.map.rotateTo((timestamp / 100) % 360, {duration: 0});
                // // Request the next frame of the animation.
                //     requestAnimationFrame(rotateCamera);
                // }

            }
        },
    }
</script>

<style>
    @import url('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
    #map{
        position: relative;
        float: left;
        width: 55%;
        height: 65%;
    }
</style>
