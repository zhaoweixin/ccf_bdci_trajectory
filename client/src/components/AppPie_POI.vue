<template>
  <div id="poi_chart">
  </div>
</template>

<script>

    import * as d3 from 'd3'

    export default {
        name: "AppPie_POI",
        data(){
            return {
            }
        },
        mounted(){
            //this.draw();
        },
        methods:{
            draw(data) {
                // 基于准备好的dom，初始化echarts实例
                data = data.map(d=>{
                    return {name:d.key,value:d.values.length};
                })
                    .filter(d=>d.value>1)
                    .filter(d=>d.name !== '地名地址信息')
                    .filter(d=>d.name !== '通行设施')
                    .filter(d=>d.name !== '汽车维修')
                    .filter(d=>d.name !== '[]');

                let legend_data =data.map(d=>d.name);

                let myChart = this.$echarts.init(document.getElementById('poi_chart'));
                // 绘制图表
                myChart.setOption({
                    title:{
                        x:'center',//水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                        y: '20',//垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
                        text:'区域POI分布比例',
                        textStyle:{
                            //文字颜色
                            color:'#ffffff',
                            //字体风格,'normal','italic','oblique'
                            fontStyle:'normal',
                            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                            fontWeight:'bold',
                            //字体系列
                            fontFamily:'sans-serif',
                            //字体大小
                            fontSize:18
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        show:false,
                        orient: 'vertical',
                        x: 'left',
                        data: legend_data,
                        textStyle: {color: 'white'}
                    },
                    series: [{
                        name: 'POI类型',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: true
                            }
                        },
                        data: data
                    }]
                })
            }
        },
        watch:{
            '$store.state.poi_state':{
                handler(data){
                    //console.log(data.data);
                    //this.data = data;
                    this.draw(data.data);
                },
                deep:true
            }
        }

    }
</script>

<style scoped>
  #poi_chart{
    position: absolute;
    right: 0;
    top:15%;
    width: 300px;
    height: 350px;
    border-radius:.3em;
    box-shadow:0 0 0 1px hsla(0,0%,100%,.3) inset,0 .5em 1em rgba(0,0,0,0.6);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
</style>
