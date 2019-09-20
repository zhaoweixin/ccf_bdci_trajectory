<template>
  <div style="height:500px;width:100%;text-align:left;">
    <div ref="basicMapbox" style="height:500px;width:100%;"></div>
    <pre id='info'></pre>
    <!-- <pre id='coordinates' class='coordinates'></pre> -->
  </div>
</template>
<script>
import mapboxgl from 'mapbox-gl'

export default {
  data () {
    return {
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化
    init () {
        mapboxgl.accessToken = 'pk.eyJ1Ijoid2VpeGluemhhbyIsImEiOiJjazBqYnFwY3owOGV4M25uMXlnc2tweTcxIn0.7Pk6JhKBB-nogxXiNTGnZQ'
        var coordinates = document.getElementById('coordinates');
        const map = new mapboxgl.Map({
          container: this.$refs.basicMapbox,
          style: 'mapbox://styles/mapbox/dark-v9',
          center: [110.296322,20.018466], // 设置地图中心
          zoom: 8,  // 设置地图比例
        })
        
        // 使用定位模块
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserLocation: true,
            zoom: 14,
        }))
        // 使用距离
        map.addControl(new mapboxgl.ScaleControl({
          maxWidth: 80, // 空间最大宽度，单位像素
          unit: 'metric'
        }))
        
        // 建立一个标记点
        var marker = new mapboxgl.Marker({
            draggable: true
        })

        // 画一根线
        map.on('load', function(){
          map.addLayer({
            'id': "route",
            "type": "line",
            "source": {
              "type": "geojson",
              "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                  "type": "LineString",
                  "coordinates":[
                    [110.3645,20.0353],
                    [110.3665,22]
                  ]
                }
              }
            },
            "layout": {
              "line-join": "round",
              "line-cap": "round"
              },
              "paint": {
              "line-color": "#888",
              "line-width": 8
            }
          })
        })
        function onDragEnd() {
            var lngLat = marker.getLngLat();
            coordinates.style.display = 'block';
            coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
        }
        marker.on('dragend', onDragEnd);

        // 点击获取经纬度模块&点击标记点
        map.on('click', function (e) {
            document.getElementById('info').innerHTML = JSON.stringify(e.point) + '<br />' + JSON.stringify(e.lngLat)
            marker.setLngLat([e.lngLat.lng,e.lngLat.lat]).addTo(map)
        })
        
    },
    drawgrid(){

    }
  },
  computed: {
  }
}
</script>
<style>
@import url('../../node_modules/mapbox-gl/dist/mapbox-gl.css');
.coordinates {
    background: rgba(0,0,0,0.5);
    color: #fff;
    position: absolute;
    bottom: 10px;
    left: 10px;
    padding:5px 10px;
    margin: 0;
    font-size: 11px;
    line-height: 18px;
    border-radius: 3px;
    display: none;
}
</style>