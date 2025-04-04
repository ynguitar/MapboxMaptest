<template>
  <div id="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import * as Three from "three";
export default {
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibnlhbjAwMjUiLCJhIjoiY204dHBvdjdjMGRxajJyb2NhbTRuYnVzOCJ9.002RhpjH1--fp6uxHi1viA";

    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v11",
      center: this.center || [151.2093, -33.8688], // 默认悉尼
      zoom: 13,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    this.map.on("load", () => {
      this.add3DBuildings();
      this.addParticlesWithThreeJS();
    });
  },
  methods: {
    // 添加 3D 建筑
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
    },
    addParticlesWithThreeJS() {
    const map = this.map;

    const customLayer = {
      id: "threejs-particles",
      type: "custom",
      renderingMode: "3d",
      onAdd: (map, gl) => {
        // 初始化 Three.js 场景
        this.scene = new Three.Scene();

        this.camera = new Three.Camera();

        this.renderer = new Three.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });
        this.renderer.autoClear = false;

        // 粒子几何
        const geometry = new Three.BufferGeometry();
        const particleCount = 1000;
        const positions = [];

        for (let i = 0; i < particleCount; i++) {
          const lng = 151.2093 + (Math.random() - 0.5) * 0.01;
          const lat = -33.8688 + (Math.random() - 0.5) * 0.01;
          const altitude = Math.random() * 100;

          const merc = mapboxgl.MercatorCoordinate.fromLngLat(
            { lng, lat },
            altitude
          );

          positions.push(merc.x, merc.y, merc.z);
        }

        geometry.setAttribute(
          "position",
          new Three.Float32BufferAttribute(positions, 3)
        );

        // 粒子材质
        const material = new Three.PointsMaterial({
          color: 0xff8800,
          size: 5,
          sizeAttenuation: true,
          opacity: 0.8,
          transparent: true,
        });

        this.particles = new Three.Points(geometry, material);
        this.scene.add(this.particles);
      },

      render: (gl, matrix) => {
        const m = new Three.Matrix4().fromArray(matrix);
        this.camera.projectionMatrix = m;
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint(); // 重绘
      },
    };

    map.addLayer(customLayer);
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
