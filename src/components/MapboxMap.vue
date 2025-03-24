<template>
  <div id="map" style="height: 100vh;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import mapboxgl from 'mapbox-gl';

// 设置 Mapbox Token (你需要从 Mapbox 获取一个 Token)
mapboxgl.accessToken = 'pk.eyJ1IjoibnlhbjAwMjUiLCJhIjoiY204bjUxcnZ3MGx3MDJrb3B5ZTAxYzMzMyJ9.fV61bVVng4j4eWKoYesd1w';

onMounted(() => {
  // 创建 Mapbox 地图实例
  const map = new mapboxgl.Map({
    container: 'map', // DOM 元素的 ID，地图将会显示在这个元素中
    style: 'mapbox://styles/mapbox/streets-v11', // 选择地图样式
    center: [133.7751, -25.2744], // 设置地图中心位置（澳大利亚的经纬度）
    zoom: 4, // 设置地图初始缩放级别
    pitch: 45, // 设置地图的倾斜角度（启用 3D）
    bearing: -17.6, // 设置地图的旋转角度
  });

  // 启用 3D 地图视图
  map.on('load', () => {
    map.setTerrain({
      source: 'mapbox-dem', // DEM 数据源用于 3D 地形
      exaggeration: 1.5, // 设置地形夸张程度
    });

    // 加载 3D 建筑物
    map.addLayer({
      'id': 'buildings',
      'type': 'fill-extrusion',
      'source': {
        'type': 'vector',
        'url': 'mapbox://mapbox.3d-buildings',
      },
      'source-layer': 'building',
      'paint': {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': ['get', 'height'], // 使用建筑物的高度属性来显示建筑物
        'fill-extrusion-base': ['get', 'min_height'], // 设置建筑物的底部高度
        'fill-extrusion-opacity': 0.6,
      },
    });
  });
});
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>

