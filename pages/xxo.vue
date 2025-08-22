<script setup lang="ts">
import { ClientOnly } from "#components";
import { onUnmounted } from "vue";

onUnmounted(() => {
  const scene = document.querySelector("a-scene");
  if (scene?.exitVR) scene.exitVR();
  if (scene?.renderer?.xr) scene.renderer.xr.enabled = false;
  const video = document.querySelector("video");
  if (video?.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <ClientOnly>
    <div class="fullscreen">
      <a-scene
        vr-mode-ui="enabled: true"
        arjs="sourceType: webcam; debugUIEnabled: true"
        renderer="logarithmicDepthBuffer: true;"
      >
        <a-camera gps-new-camera="gpsMinDistance: 1"></a-camera>
        <a-box
          id="box"
          color="red"
          scale="2 2 2"
          position="0 2 -15"
          rotation="0 180 0"
          visible="true"
        >
        </a-box>
      </a-scene>
    </div>
  </ClientOnly>
</template>

<style scoped>
.fullscreen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 9999;
}

a-scene {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  z-index: 9999;
}
</style>
