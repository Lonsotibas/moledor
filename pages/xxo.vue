<script setup lang="ts">
import * as THREE from "three";
import * as THREEx from "@ar-js-org/ar.js/three.js/build/ar-threex-location-only";

let canvas: HTMLElement | undefined;

onMounted(() => {
  canvas = document.getElementById("canvas") || undefined;
  main();
});

const main = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1.33, 0.1, 10000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });

  const arjs = new THREEx.LocationBased(scene, camera);
  const cam = new THREEx.WebcamRenderer(renderer);

  const geom = new THREE.BoxGeometry(20, 20, 20);
  const mtl = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(geom, mtl);

  arjs.add(box, -33.440035, -70.674399);
  arjs.startGps();

  const render = () => {
    if (
      canvas?.width != canvas?.clientWidth ||
      canvas?.height != canvas?.clientHeight
    ) {
      renderer.setSize(canvas?.clientWidth, canvas?.clientHeight, false);
      const aspect = canvas?.clientWidth / canvas?.clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    cam.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};
</script>

<template>
  <main class="view">
    <canvas id="canvas"></canvas>
  </main>
</template>

<style>
#canvas {
  width: 100%;
  height: 100%;
}
</style>
