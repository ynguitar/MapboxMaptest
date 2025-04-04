<template>
  <div id="app">
    <router-view></router-view>  <!-- 这个地方会动态切换 Home.vue 和 MapView.vue -->
  </div>
</template>

<script setup>
</script>

<style>
/* 让背景更符合生化危机风格 */
body {
  margin: 0;
  background: black;
  color: white;
  font-family: Arial, sans-serif;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: c; /* 确保地图背景透明 */
}
</style>