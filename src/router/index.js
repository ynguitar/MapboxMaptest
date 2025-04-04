import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomePage.vue'
import MapView from '../views/MapboxMap.vue'
import StateView from '../views/StateMap.vue'
import CityMap from '../views/CityMap.vue'
// define route
const routes = [
  { path: '/', component: Home },        
  { path: '/map', component: MapView },   
  { 
    path: '/map/:state', 
    name: "MapState", 
    component: StateView 
  },
  {
    path: '/map/state/:city',  // dynamic :city
    name: 'CityMap',
    component: CityMap,
    props: true, 
  },
]

// create route instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
