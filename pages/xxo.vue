<script setup lang="ts">
import fitoUrl from "../assets/models/Afirmaoo_el_fito_textured_mesh_medpoly_glb.glb?url";
import patitasUrl from "../assets/models/Patitas_arriba_textured_mesh_medpoly_glb.glb?url";
import pictoreskaUrl from "../assets/models/Pictoresca_textured_mesh_medpoly_glb.glb?url";
import panchoUrl from "../assets/models/Pancho_celu_textured_mesh_medpoly_glb.glb?url";
import enredadoUrl from "../assets/models/Enredado_textured_mesh_medpoly_glb.glb?url";
import mounstroUrl from "../assets/models/Mounstro69_textured_mesh_medpoly_glb.glb?url";
import camaUrl from "../assets/models/Cama_textured_mesh_medpoly_glb.glb?url";

const WORLD_RADIUS = 6;  // metres; camera starts at centre, models on the ring
const WORLD_Y      = 1.6; // eye height

const BASE_MODELS = [
  { id: "fito",       label: "El Fito",    src: fitoUrl },
  { id: "patitas",    label: "Patitas",    src: patitasUrl },
  { id: "pictoresca", label: "Pictoresca", src: pictoreskaUrl },
  { id: "pancho",     label: "Pancho",     src: panchoUrl },
  { id: "enredado",   label: "Enredado",   src: enredadoUrl },
  { id: "mounstro",   label: "Mounstro",   src: mounstroUrl },
  { id: "cama",       label: "Cama",       src: camaUrl },
];

// ── UI state ──────────────────────────────────────────────────────────────────
type Overlay = "https-error" | "orient-perm" | null;
const overlay      = ref<Overlay>(null);
const selectedId   = ref(BASE_MODELS[0].id); // used in preview mode
const approachedId = ref<string | null>(null); // which model camera has flown to
const modelScale   = ref(1);
const previewMode  = ref(false); // false = world; true = single-model inspect

// ── Imperative DOM refs ───────────────────────────────────────────────────────
let videoEl:         HTMLVideoElement | null = null;
let aScene:          HTMLElement | null = null;
let aCam:            HTMLElement | null = null;
let previewEntity:   HTMLElement | null = null;
let sceneReadyTimer: ReturnType<typeof setTimeout> | null = null;
let camAnimFrame:    number | null = null;
const worldEntities = new Map<string, HTMLElement>();

function attr(el: HTMLElement, name: string, value: string) {
  el.setAttribute(name, value);
}

// ── Camera fly-to animation ───────────────────────────────────────────────────
// Animates the A-Frame camera's Three.js object3D position directly so it
// works alongside look-controls (which only touches the quaternion).
function animateCamera(tx: number, ty: number, tz: number, dur = 900) {
  if (!aCam) return;
  if (camAnimFrame !== null) { cancelAnimationFrame(camAnimFrame); camAnimFrame = null; }
  const obj = (aCam as any).object3D;
  const sx = obj.position.x, sy = obj.position.y, sz = obj.position.z;
  const t0 = performance.now();
  function tick(now: number) {
    const t = Math.min((now - t0) / dur, 1);
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
    obj.position.set(sx + (tx - sx) * e, sy + (ty - sy) * e, sz + (tz - sz) * e);
    camAnimFrame = t < 1 ? requestAnimationFrame(tick) : null;
  }
  camAnimFrame = requestAnimationFrame(tick);
}

// ── Camera feed ───────────────────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    videoEl = document.createElement("video");
    videoEl.setAttribute("autoplay", "");
    videoEl.setAttribute("muted", "");
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("webkit-playsinline", "");
    Object.assign(videoEl.style, {
      position: "fixed", top: "0", left: "0",
      width: "100%", height: "100%",
      objectFit: "cover", zIndex: "1", background: "#000",
    });
    videoEl.srcObject = stream;
    document.body.appendChild(videoEl);
    try { await videoEl.play(); } catch { /* muted+playsinline allows autoplay */ }
  } catch (err) {
    console.error("Camera error:", err);
  }
}

// ── A-Frame scene ─────────────────────────────────────────────────────────────
function buildScene() {
  aScene = document.createElement("a-scene");
  attr(aScene, "vr-mode-ui", "enabled: false");
  attr(aScene, "renderer",   "antialias: true; alpha: true;");
  attr(aScene, "background", "transparent: true");
  aScene.className = "ar-scene";

  aCam = document.createElement("a-camera");
  // look-controls uses DeviceOrientationEvent (gyroscope) on mobile for camera rotation.
  // touchEnabled: false keeps our own touch handlers in control.
  attr(aCam, "look-controls", "enabled: true; touchEnabled: false; magicWindowTrackingEnabled: true");
  attr(aCam, "wasd-controls", "enabled: false");
  attr(aCam, "position",      `0 ${WORLD_Y} 0`);
  aScene.appendChild(aCam);

  let done = false;
  function onSceneReady() {
    if (done) return;
    done = true;
    if (sceneReadyTimer) { clearTimeout(sceneReadyTimer); sceneReadyTimer = null; }
    const r = (aScene as any).renderer;
    if (r) r.setClearColor(0x000000, 0);
    buildWorldEntities();
    if (previewMode.value) activatePreview();
  }
  aScene.addEventListener("loaded", onSceneReady, { once: true });
  sceneReadyTimer = setTimeout(onSceneReady, 1500);

  document.body.appendChild(aScene);
}

// ── World entities ────────────────────────────────────────────────────────────
function buildWorldEntities() {
  if (!aScene) return;
  const s  = modelScale.value;
  const sv = `${s} ${s} ${s}`;
  BASE_MODELS.forEach((m, i) => {
    const angle = (i / BASE_MODELS.length) * 2 * Math.PI;
    const x = +(Math.sin(angle) * WORLD_RADIUS).toFixed(2);
    const z = +(-Math.cos(angle) * WORLD_RADIUS).toFixed(2);
    const el = document.createElement("a-entity");
    attr(el, "gltf-model", m.src);
    attr(el, "position",   `${x} ${WORLD_Y} ${z}`);
    attr(el, "scale",      sv);
    attr(el, "visible",    previewMode.value ? "false" : "true");
    aScene!.appendChild(el);
    worldEntities.set(m.id, el);
  });
}

// ── Preview mode (inspect single model up close as camera child) ──────────────
function activatePreview() {
  if (!aCam) return;
  if (previewEntity) { previewEntity.remove(); previewEntity = null; }

  previewEntity = document.createElement("a-entity");
  attr(previewEntity, "position", "0 0 -2");
  const s = modelScale.value;
  attr(previewEntity, "scale", `${s} ${s} ${s}`);
  updatePreviewModel();
  aCam.appendChild(previewEntity);

  worldEntities.forEach((el) => attr(el, "visible", "false"));
}

function updatePreviewModel() {
  if (!previewEntity) return;
  const m = BASE_MODELS.find((m) => m.id === selectedId.value)!;
  attr(previewEntity, "gltf-model", m.src);
}

function deactivatePreview() {
  if (previewEntity) { previewEntity.remove(); previewEntity = null; }
  approachedId.value = null;
  animateCamera(0, WORLD_Y, 0, 600); // snap camera back to world centre
  worldEntities.forEach((el) => attr(el, "visible", "true"));
}

// ── World-mode approach / return ──────────────────────────────────────────────
function approachModel(id: string) {
  if (!aScene) return;
  const idx   = BASE_MODELS.findIndex((m) => m.id === id);
  const angle = (idx / BASE_MODELS.length) * 2 * Math.PI;
  const d     = WORLD_RADIUS - 2; // stop 2 m in front of the model
  animateCamera(
    Math.sin(angle) * d,
    WORLD_Y,
    -Math.cos(angle) * d,
  );
  approachedId.value = id;
}

function returnToCenter() {
  animateCamera(0, WORLD_Y, 0);
  approachedId.value = null;
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(previewMode, (on) => {
  if (!aScene) return;
  if (on) activatePreview(); else deactivatePreview();
});

watch(selectedId, () => {
  if (previewMode.value) updatePreviewModel();
});

watch(modelScale, () => {
  const s  = modelScale.value;
  const sv = `${s} ${s} ${s}`;
  if (previewMode.value && previewEntity) attr(previewEntity, "scale", sv);
  else worldEntities.forEach((el) => attr(el, "scale", sv));
});

// ── Preview touch controls (drag = rotate, pinch = scale) ────────────────────
let previewRotY     = 0;
let lastTouchX      = 0;
let pinchStartDist  = 0;
let pinchStartScale = 1;

function onTouchStart(e: TouchEvent) {
  if (!previewMode.value) return;
  if (e.touches.length === 1) {
    lastTouchX = e.touches[0].clientX;
  } else if (e.touches.length === 2) {
    pinchStartDist  = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    pinchStartScale = modelScale.value;
  }
}

function onTouchMove(e: TouchEvent) {
  if (!previewMode.value || !previewEntity) return;
  const t = e.target as HTMLElement;
  if (t.closest?.(".picker, .scale-box, .mode-toggle, .btn-back, .btn-return")) return;
  e.preventDefault();
  if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastTouchX;
    lastTouchX = e.touches[0].clientX;
    previewRotY -= dx * 0.5;
    attr(previewEntity, "rotation", `0 ${previewRotY} 0`);
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    modelScale.value = parseFloat(
      Math.min(3, Math.max(0.1, pinchStartScale * (dist / pinchStartDist))).toFixed(2)
    );
  }
}

// ── Scale buttons ─────────────────────────────────────────────────────────────
function bumpScale(d: number) {
  modelScale.value = parseFloat(Math.min(3, Math.max(0.1, modelScale.value + d)).toFixed(2));
}

// ── iOS 13+ DeviceOrientation permission ──────────────────────────────────────
async function grantOrientPerm() {
  try { await (DeviceOrientationEvent as any).requestPermission(); } catch { }
  await startCamera();
  buildScene();
  overlay.value = null;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!window.isSecureContext) { overlay.value = "https-error"; return; }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove",  onTouchMove,  { passive: false });

  if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
    overlay.value = "orient-perm";
  } else {
    startCamera().then(() => buildScene());
  }
});

onUnmounted(() => {
  if (sceneReadyTimer) { clearTimeout(sceneReadyTimer); sceneReadyTimer = null; }
  if (camAnimFrame !== null) { cancelAnimationFrame(camAnimFrame); camAnimFrame = null; }
  document.removeEventListener("touchstart", onTouchStart);
  document.removeEventListener("touchmove",  onTouchMove);
  if (videoEl) {
    (videoEl.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
    videoEl.remove(); videoEl = null;
  }
  if (aScene) { (aScene as any).exitVR?.(); aScene.remove(); aScene = null; }
  worldEntities.clear();
});
</script>

<template>
  <div class="hud">
    <button class="btn-back" @click="$router.back()" aria-label="Volver">
      <Icon name="solar:arrow-left-bold" size="22px" />
    </button>

    <!-- Return-to-centre button (world mode, when near a model) -->
    <Transition name="fade">
      <button
        v-if="!previewMode && approachedId"
        class="btn-return"
        @click="returnToCenter"
      >
        <Icon name="solar:map-point-wave-bold-duotone" size="18px" />
        Volver al centro
      </button>
    </Transition>

    <!-- Permission / error overlays -->
    <Transition name="fade">
      <div v-if="overlay" class="overlay">
        <template v-if="overlay === 'https-error'">
          <Icon name="solar:lock-keyhole-bold-duotone" size="52px" style="color:#ff6b6b" />
          <p class="ol-title">Se necesita HTTPS</p>
          <p class="ol-body">Ejecuta: <code>nuxt dev --https</code></p>
        </template>
        <template v-else-if="overlay === 'orient-perm'">
          <Icon name="solar:smartphone-rotate-angle-bold-duotone" size="52px" style="color:#ffd166" />
          <p class="ol-title">Activar cámara AR</p>
          <p class="ol-body">Toca para activar la cámara y los sensores de movimiento.</p>
          <button class="btn-primary" @click="grantOrientPerm">Iniciar AR</button>
        </template>
      </div>
    </Transition>

    <!-- HUD -->
    <template v-if="!overlay">

      <!-- Mode toggle -->
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: !previewMode }"
          @click="previewMode = false"
        >Mundo</button>
        <button
          class="mode-btn"
          :class="{ active: previewMode }"
          @click="previewMode = true"
        >Vista previa</button>
      </div>

      <!-- Context hint -->
      <p class="hint">
        {{ previewMode
          ? 'Arrastra para rotar · Pellizca para escalar'
          : approachedId ? 'Acercándose · toca Volver al centro para alejarse' : 'Rota tu teléfono · toca un modelo para acercarte' }}
      </p>

      <!-- Scale -->
      <div class="scale-box">
        <button class="scale-btn" @click="bumpScale(0.25)">+</button>
        <span class="scale-val">{{ modelScale }}×</span>
        <button class="scale-btn" @click="bumpScale(-0.25)">−</button>
      </div>

      <!-- Model picker -->
      <!-- World mode: tap to fly camera to that model -->
      <!-- Preview mode: tap to switch displayed model -->
      <nav class="picker" aria-label="Seleccionar modelo">
        <button
          v-for="m in BASE_MODELS"
          :key="m.id"
          class="chip"
          :class="{ active: previewMode ? selectedId === m.id : approachedId === m.id }"
          @click="previewMode ? (selectedId = m.id) : approachModel(m.id)"
        >{{ m.label }}</button>
      </nav>

    </template>
  </div>
</template>

<style scoped>
.hud {
  position: fixed; inset: 0; z-index: 3;
  pointer-events: none;
  touch-action: none;
}
.btn-back, .btn-return, .overlay, .mode-toggle,
.scale-box, .picker, .mode-btn { pointer-events: auto; }

/* ── Back ── */
.btn-back {
  position: absolute;
  top: max(16px, env(safe-area-inset-top)); left: 16px;
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  color: #fff; display: grid; place-items: center; cursor: pointer;
}

/* ── Return to centre ── */
.btn-return {
  position: absolute;
  top: max(16px, env(safe-area-inset-top)); right: 16px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 999px; border: none;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  color: #ffd166; font-size: 0.78rem; font-weight: 600; cursor: pointer;
  white-space: nowrap;
}

/* ── Overlay ── */
.overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 18px; background: rgba(0,0,0,0.88);
  color: #fff; text-align: center; padding: 32px 24px;
}
.ol-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.ol-body  { font-size: 0.9rem; max-width: 300px; line-height: 1.6; margin: 0; opacity: 0.85; }
code { background: rgba(255,255,255,0.1); border-radius: 6px; padding: 2px 6px; font-size: 0.85em; }
.btn-primary {
  padding: 12px 32px; border-radius: 999px; border: none;
  background: #ffd166; color: #000; font-weight: 700; font-size: 0.95rem; cursor: pointer;
}

/* ── Mode toggle ── */
.mode-toggle {
  position: absolute;
  top: max(16px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
  display: flex; gap: 4px;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  border-radius: 999px; padding: 4px;
}
.mode-btn {
  padding: 6px 14px; border-radius: 999px; border: none;
  background: transparent; color: rgba(255,255,255,0.6);
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mode-btn.active { background: #ffd166; color: #000; }

/* ── Hint ── */
.hint {
  position: absolute;
  top: max(72px, calc(env(safe-area-inset-top) + 56px));
  left: 0; right: 0; text-align: center;
  font-size: 0.75rem; color: rgba(255,255,255,0.45);
  pointer-events: none;
}

/* ── Scale ── */
.scale-box {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  border-radius: 14px; padding: 10px 8px;
}
.scale-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2); background: transparent;
  color: #fff; font-size: 1.3rem; cursor: pointer;
  display: grid; place-items: center;
}
.scale-btn:active { background: rgba(255,255,255,0.1); }
.scale-val { font-size: 0.72rem; color: #ffd166; font-weight: 700; }

/* ── Picker ── */
.picker {
  position: absolute; bottom: max(20px, env(safe-area-inset-bottom));
  left: 0; right: 0;
  display: flex; gap: 8px; padding: 0 16px;
  overflow-x: auto; scrollbar-width: none;
}
.picker::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0; padding: 8px 18px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
  color: #fff; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chip.active { background: #ffd166; border-color: #ffd166; color: #000; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<!-- Global: .ar-scene lives on document.body, outside Vue scope -->
<style>
.ar-scene {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2 !important;
  pointer-events: none !important;
  display: block !important;
}
</style>
