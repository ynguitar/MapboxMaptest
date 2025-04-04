<template>
  <div id="map" style="height: 100vh;"></div>
</template>

<script setup>
import { onMounted} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from "vue-router";
//import { createRouter, createWebHistory } from 'vue-router';
const router = useRouter()
// 定义 Vue 事件
// const emit = defineEmits(['stateSelected']);
onMounted(() => {
  // 创建地图
  const map = L.map('map').setView([-25.2744, 133.7751], 4);
  
  // 加载 GeoJSON 数据
  fetch('/Geojson/states.geojson')  // 确保路径正确
    .then(response => response.json())
    .then(data => {
      // 创建 GeoJSON 图层
      const geojsonLayer = L.geoJSON(data, {
        style: () => ({
          color: "#0078A8",
          weight: 2,
          fillOpacity: 0.3,
        }),
        onEachFeature: (feature, layer) => {
          const stateName = feature.properties.STATE_NAME;  // 获取州名

          // 绑定鼠标悬停提示
          layer.bindTooltip(stateName, { permanent: false, direction: "center" });
          
          // 点击事件 - 触发 Vue 事件
          layer.on("click", () => {
            router.push({ name: "MapState", params: { state: stateName } });
            
          });
        }
      });
      map.addLayer(geojsonLayer);
      
    })
    .catch(error => console.error("加载 GeoJSON 失败:", error));
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
