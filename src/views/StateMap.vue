<!-- ParentComponent.vue -->
<template>
  <div id="state-map" style="height: 100vh;">
    <h2>State info</h2>
    <p>Sub state: {{ stateName }}</p>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import L from 'leaflet';
import {useRoute , useRouter} from 'vue-router'
const route = useRoute();
const router = useRouter();
const selectedState = ref(route.params.state || "tmp");
const map = ref(null);

// listening stateSelected selectedState
// const handleStateSelected = (stateName) => {
//   selectedState.value = stateName;
//   console.log('test');
//   useRouter.push(`/map/${stateName.toLowerCase()}`);
//   updateStateMap(stateName);
// };

const updateStateMap = (stateName) => {
  // clear previous map
  if (map.value) {
    map.value.remove();
  }

  // new state map
  map.value = L.map('state-map').setView([-25.2744, 133.7751], 5);
  const cityIcon = L.icon({
    iconUrl: '/images/city.png',  
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });


  // import GeoJSON data
  fetch('/Geojson/states.geojson')
    
    .then(response => response.json())
    .then(data => {
      const stateData = data.features.find(feature => feature.properties.STATE_NAME.trim() == stateName.value);
      // console.log('stateData info:', stateData);
      if (stateData) {
        // add state layer
        const geojsonLayer = L.geoJSON(stateData, {
          style: {
            color: "#FF0000",
            weight: 2,
            fillOpacity: 0.4,
          },
        }).addTo(map.value);
        console.log({geojsonLayer});
        map.value.addLayer(geojsonLayer);
        // Upload state's cities GeoJSON 
        fetch(`/Geojson/${stateName.value.toLowerCase()}.geojson`)  // 假设城市的 GeoJSON 文件命名为州名_cities.geojson
          .then(response => response.json())
          .then(cityData => {
            window.cityClickHandler = (cityName) => {
              router.push({ name: "CityMap", params: { city: cityName } });
            };
            L.geoJSON(cityData, {
              onEachFeature: (feature, layer) => {
                layer.setIcon(cityIcon);

                const cityName = feature.properties.name;
                const cityLabel = L.divIcon({
                  className: 'city-label',
                  html: `
                    <div style="position: relative; cursor: pointer;" onclick="window.cityClickHandler('${cityName}')">
                      <img src="/images/city.png" style="position: absolute; top: 0; left: 0; width: 32px; height: 32px;" />
                      <div class="city-label-text" style="position: absolute; top: 35px; left: -16px; font-size: 12px; font-weight: bold; color: #000;">${cityName}</div>
                    </div>
                    `,
                  iconSize: [50, 50],  // whole label size
                  iconAnchor: [16, 50]  // local
                });

                layer.setIcon(cityLabel);

                layer.on("click", () => {
                  window.cityClickHandler(cityName);
                });
              },

            }).addTo(map.value);

            
          })
          .catch(error => console.error("加载城市 GeoJSON 失败:", error));
      }
    })
    .catch(error => console.error("加载州的 GeoJSON 失败:", error));
};
onMounted(() => {
  updateStateMap(selectedState);
});
</script>

