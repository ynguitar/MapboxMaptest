<template>
  <div class="home">
    <h1>生化危机地图</h1>
    <button @click="goToMap">进入生化危机风格地图</button>
  </div>
</template>

<script setup>
import { useRouter} from 'vue-router'


const router = useRouter()
const goToMap = () => {
  router.push('/map')  // 跳转到地图页面
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background: radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(10,10,10,1) 100%);
}

h1 {
  color: red;
  text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.8);
}

button {
  padding: 10px 20px;
  font-size: 18px;
  color: white;
  background: red;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: darkred;
}
</style>
