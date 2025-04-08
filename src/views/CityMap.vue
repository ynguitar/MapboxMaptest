<template>
  <div id="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import 'mapbox-gl/dist/mapbox-gl.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { ref } from 'vue';
import {useRoute} from 'vue-router'



function getNearestSuburb(mouseLng, mouseLat, suburbList) {
  let nearest = null;
  let minDistance = Infinity;

  suburbList.forEach(suburb => {
    const dx = suburb.longitude - mouseLng;
    const dy = suburb.latitude - mouseLat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = suburb;
    }
  });

  return nearest;
}

async function getSuburbsData(cityName) {
  const geojsonPath = `/Geojson/suburb_${cityName}.geojson`;
  const suburbList = [];

  try {
    const response = await fetch(geojsonPath);
    const geoJSONData = await response.json();

    geoJSONData.features.forEach((feature) => {
      const suburbName = feature.properties.name || "Unnamed Suburb";
      const coordinates = feature.geometry.coordinates;

      let longitude, latitude;
      if (feature.geometry.type === 'Point') {
        longitude = coordinates[0];
        latitude = coordinates[1];
      } else if (feature.geometry.type === 'MultiPoint') {
        longitude = coordinates[0][0];
        latitude = coordinates[0][1];
      } else {
        console.warn("Unsupported geometry type:", feature.geometry.type);
        return;
      }

      suburbList.push({
        suburbName: suburbName,
        latitude: latitude,
        longitude: longitude,
      });
    });
    
    return suburbList;  // 返回数组
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
    return [];  // 返回空数组
  }
}

export default {
  setup() {
    const route = useRoute();
    const selectedCity = route.params.city.toLowerCase(); 
    return { selectedCity };
  },
  data() {
    return {
      map: null,
      popup: null

    };
  },


  


  

  async mounted() {
    const cityName = this.selectedCity;

    this.suburbList = await getSuburbsData(cityName)
      console.log('suburb list info: ',typeof(this.suburbList))
      mapboxgl.accessToken =
      "pk.eyJ1IjoibnlhbjAwMjUiLCJhIjoiY204dHBvdjdjMGRxajJyb2NhbTRuYnVzOCJ9.002RhpjH1--fp6uxHi1viA";


    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v11",
      center: this.center || [144.9631, -37.8136],
      zoom: 16,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    this.map.on("load", () => {
      this.add3DBuildings();

      this.map.on('mousemove', (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      const nearestSuburb = getNearestSuburb(lng, lat, this.suburbList);
      if (!nearestSuburb) return;

      const popupContent = `
        <div style="color: black; font-size: 14px;">
        <strong>最近区域:</strong> ${nearestSuburb.suburbName}<br/>
        <strong>花粉信息:</strong> ${'Level 1' || '未知'}
      `;

      // 确保 popup 是提前创建好的
      if (!this.popup) {
        this.popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });
      }

      this.popup
        .setLngLat([lng, lat])
        .setHTML(popupContent)
        .addTo(this.map);
    });

    // 鼠标移出地图，清除 popup
    this.map.on('mouseleave', () => {
      if (this.popup) {
        this.popup.remove();
      }
    });
      
    });



    
    this.map.on('render', () => {
      // const layers = this.map.getStyle().layers;
      // layers.forEach((layer, index) => {
      //       console.log(`Layer ${index}: ${layer.id}`);
      //     });
    });

    this.map.on('style.load', () => {
      // const customLayer = this.createCustomLayer(this.map);
      // this.map.addLayer(customLayer, 'waterway-label');
      // const particleLayer = this.addParticlesWithThreeJS(this.map);
      // this.map.addLayer(particleLayer, 'waterway-label');
      var suburbID = 0;
      console.log(this.suburbList);
      this.suburbList.forEach(suburb => {
      // console.log(`Suburb: ${suburb.suburbName}, Latitude: ${suburb.latitude}, Longitude: ${suburb.longitude}`);
      const particleLayer = this.pollenpointLayer(this.map,suburbID,[suburb.longitude,suburb.latitude]);
      this.map.addLayer(particleLayer, 'waterway-label');
      suburbID += 1;
    });
      
    });
    

  },
  methods: {
    generateLayerId(subid) {
      return 'layer-' + String(subid);
    },
    pollenpointLayer(map,subid,suburbs) {
      const modelOrigin = suburbs;
    const modelAltitude = 20;
    const modelRotate = [Math.PI / 2, 0, 0];
    const layerid = this.generateLayerId(subid)
    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: map.painter.context.gl,
      antialias: true
    });
    renderer.autoClear = false;

    
    const particleCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < particleCount; i++) {
      const lng = 151.2093 + (Math.random() - 0.5) * 0.8;
      const lat = -33.8688 + (Math.random() - 0.5) * 0.8;
      const altitude = 300;

      const merc = mapboxgl.MercatorCoordinate.fromLngLat({ lng, lat }, altitude);

      positions.push(merc.x, merc.y, merc.z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0xff8800,
      size: 12,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    
    return {
      id: layerid, 
      type: 'custom',
      renderingMode: '3d',
      onAdd: function() {},
      render: function (gl, matrix) {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        camera.projectionMatrix = m.multiply(l);
        renderer.resetState();
        renderer.render(scene, camera);
        map.triggerRepaint();
      }
    };
    },

    
    add3DBuildings() {
      const layers = this.map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout["text-field"]
      )?.id;

      this.map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
      console.log(`Layer ${labelLayerId}`);
      // layers.forEach((layer, index) => {
      //       console.log(`Layer ${index}: ${layer.id}`);
      //     });
    },

    
addParticlesWithThreeJS(map) {
      // const map = this.map;
      // // const layers = this.map.getStyle().layers;
      // // const labelLayerId = layers.find(
      // //   (layer) => layer.type === "symbol" && layer.layout["text-field"]
      // // )?.id;
      // const customLayer = {
      //   id: "threejs-particles",
      //   type: "custom",
      //   renderingMode: "3d",
      //   onAdd: (map, gl) => {
      //     // 初始化 Three.js 场景
      //     this.scene = new THREE.Scene();

      //     this.camera = new THREE.Camera();

      //     this.renderer = new THREE.WebGLRenderer({
      //       canvas: map.getCanvas(),
      //       context: gl,
      //       antialias: true,
      //     });
      //     this.renderer.autoClear = false;

      //     // 粒子几何
      //     const geometry = new THREE.BufferGeometry();
      //     const particleCount = 1000;
      //     const positions = [];

      //     for (let i = 0; i < particleCount; i++) {
      //       const lng = 151.2093 + (Math.random() - 0.5) * 0.01;
      //       const lat = -33.8688 + (Math.random() - 0.5) * 0.01;
      //       const altitude = 3;

      //       const merc = mapboxgl.MercatorCoordinate.fromLngLat(
      //         { lng, lat },
      //         altitude
      //       );

      //       positions.push(merc.x, merc.y, merc.z);
      //     }

      //     geometry.setAttribute(
      //       "position",
      //       new THREE.Float32BufferAttribute(positions, 3)
      //     );

      //     // 粒子材质
      //     const material = new THREE.PointsMaterial({
      //       color: 0xff8800,
      //       size: 8,
      //       sizeAttenuation: false,
      //       opacity: 0.8,
      //       transparent: true,
      //     });

      //     this.particles = new THREE.Points(geometry, material);
      //     this.scene.add(this.particles);
      //     // console.log("is renderer using map's GL context?", this.renderer.getContext() === gl);
      //   },
        
      //   render: (gl, matrix) => {

      //     const m = new THREE.Matrix4().fromArray(matrix);
      //     this.camera.projectionMatrix = m;
      //     this.renderer.render(this.scene, this.camera);
      //     // this.map.triggerRepaint(); // 重绘

      //   },
      // };

      

      // map.addLayer(customLayer,'continent-label');

      
  const modelOrigin = [151.2093, -33.8688];
  const modelAltitude = 20;
  const modelRotate = [Math.PI / 2, 0, 0];

  const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };

  // Three.js 必备组件
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const renderer = new THREE.WebGLRenderer({
    canvas: map.getCanvas(),
    context: map.painter.context.gl,
    antialias: true
  });
  renderer.autoClear = false;

  // 生成粒子
  const particleCount = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < particleCount; i++) {
    const lng = 151.2093 + (Math.random() - 0.5) * 0.8;
    const lat = -33.8688 + (Math.random() - 0.5) * 0.8;
    const altitude = 300;

    const merc = mapboxgl.MercatorCoordinate.fromLngLat({ lng, lat }, altitude);

    positions.push(merc.x, merc.y, merc.z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xff8800,
    size: 12,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.8
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 返回官方风格的 Custom Layer
  return {
    id: 'threejs-particles',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function () {
      // 已在外部构造，onAdd中无操作也OK
    },
    render: function (gl, matrix) {
      const rotationX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        modelTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        modelTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        modelTransform.rotateZ
      );

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          modelTransform.translateX,
          modelTransform.translateY,
          modelTransform.translateZ
        )
        .scale(
          new THREE.Vector3(
            modelTransform.scale,
            -modelTransform.scale, // 注意 Y 轴反转！
            modelTransform.scale
          )
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

      camera.projectionMatrix = m.multiply(l);

      renderer.resetState();
      renderer.render(scene, camera);
      map.triggerRepaint();
    }
  };
    },

createCustomLayer (map) {
    const modelOrigin = [151.2093, -33.8688];
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
      const camera = new THREE.Camera();
      const scene = new THREE.Scene();

      const directionalLight1 = new THREE.DirectionalLight(0xffffff);
      directionalLight1.position.set(0, -70, 100).normalize();
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff);
      directionalLight2.position.set(0, 70, 100).normalize();
      scene.add(directionalLight2);

      const loader = new GLTFLoader();
      loader.load(
        'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
        (gltf) => {
          scene.add(gltf.scene);
        }
      );

      const renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: map.painter.context.gl,
        antialias: true
      });

      renderer.autoClear = false;

      return {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: () => {
          // Add logic that runs on layer addition if necessary.
        },
        render: (gl, matrix) => {
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX
          );
          const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          camera.projectionMatrix = m.multiply(l);
          renderer.resetState();
          renderer.render(scene, camera);
          map.triggerRepaint();
        }
      };
    },

  },
  
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100vh;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
