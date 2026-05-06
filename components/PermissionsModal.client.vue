<script setup lang="ts">
const STORAGE_KEY = "moledor:perms_done";

const visible = ref(false);
const requesting = ref(false);

const perms = reactive({
  notifications: "default" as NotificationPermission | "unsupported",
  camera: "default" as PermissionState | "unsupported",
  microphone: "default" as PermissionState | "unsupported",
});

async function checkCurrent() {
  if (!("Notification" in window)) {
    perms.notifications = "unsupported";
  } else {
    perms.notifications = Notification.permission;
  }
  if (!navigator.permissions) return;
  try {
    const [cam, mic] = await Promise.all([
      navigator.permissions.query({ name: "camera" as PermissionName }),
      navigator.permissions.query({ name: "microphone" as PermissionName }),
    ]);
    perms.camera = cam.state;
    perms.microphone = mic.state;
  } catch {
    // Some browsers don't support querying camera/mic via Permissions API
  }
}

function allGranted() {
  const n = perms.notifications === "granted" || perms.notifications === "unsupported";
  const c = perms.camera === "granted" || perms.camera === "unsupported";
  const m = perms.microphone === "granted" || perms.microphone === "unsupported";
  return n && c && m;
}

async function requestAll() {
  requesting.value = true;
  try {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
      perms.notifications = Notification.permission;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      perms.camera = "granted";
      perms.microphone = "granted";
    } catch {
      // denied or unavailable — mark as denied so icon updates
      perms.camera = "denied";
      perms.microphone = "denied";
    }
  } finally {
    requesting.value = false;
    dismiss();
  }
}

function dismiss() {
  localStorage.setItem(STORAGE_KEY, "1");
  visible.value = false;
}

onMounted(async () => {
  if (localStorage.getItem(STORAGE_KEY)) return;
  await checkCurrent();
  if (!allGranted()) visible.value = true;
});
</script>

<template>
  <Transition name="perms-pop">
    <div v-if="visible" class="backdrop" @click.self="dismiss">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Permisos necesarios">
        <div class="icon-row">
          <div class="app-icon">
            <Icon name="solar:fire-minimalistic-bold" size="32px" />
          </div>
        </div>

        <h2 class="title">Permitir acceso</h2>
        <p class="sub">Moledor necesita los siguientes permisos para funcionar correctamente.</p>

        <ul class="perm-list">
          <li class="perm-item">
            <div class="perm-icon">
              <Icon name="solar:bell-bold-duotone" size="22px" />
            </div>
            <div class="perm-info">
              <span class="perm-name">Notificaciones</span>
              <span class="perm-desc">Mensajes y fuegos en tiempo real</span>
            </div>
            <span class="perm-status" :class="perms.notifications">
              {{ perms.notifications === "granted" ? "✓" : perms.notifications === "denied" ? "✗" : "—" }}
            </span>
          </li>
          <li class="perm-item">
            <div class="perm-icon">
              <Icon name="solar:camera-bold-duotone" size="22px" />
            </div>
            <div class="perm-info">
              <span class="perm-name">Cámara</span>
              <span class="perm-desc">Experiencia AR en la página XXO</span>
            </div>
            <span class="perm-status" :class="perms.camera">
              {{ perms.camera === "granted" ? "✓" : perms.camera === "denied" ? "✗" : "—" }}
            </span>
          </li>
          <li class="perm-item">
            <div class="perm-icon">
              <Icon name="solar:microphone-bold-duotone" size="22px" />
            </div>
            <div class="perm-info">
              <span class="perm-name">Micrófono</span>
              <span class="perm-desc">Notas de voz en el chat</span>
            </div>
            <span class="perm-status" :class="perms.microphone">
              {{ perms.microphone === "granted" ? "✓" : perms.microphone === "denied" ? "✗" : "—" }}
            </span>
          </li>
        </ul>

        <button class="btn-allow" :disabled="requesting" @click="requestAll">
          <span v-if="requesting" class="spinner" />
          <span v-else>Permitir todo</span>
        </button>
        <button class="btn-skip" @click="dismiss">Ahora no</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.sheet {
  width: 100%;
  max-width: 480px;
  background: #1c1b20;
  border-radius: 24px 24px 0 0;
  padding: 28px 24px calc(24px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.icon-row {
  display: flex;
  justify-content: center;
}
.app-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(255, 188, 66, 0.12);
  border: 1.5px solid rgba(255, 188, 66, 0.3);
  display: grid;
  place-items: center;
  color: var(--yellow, #ffbc42);
}

.title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-align: center;
}
.sub {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.perm-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.perm-item {
  display: grid;
  grid-template-columns: 40px 1fr 24px;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.perm-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 188, 66, 0.1);
  display: grid;
  place-items: center;
  color: var(--yellow, #ffbc42);
}
.perm-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.perm-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
}
.perm-desc {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
}
.perm-status {
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
}
.perm-status.granted { color: #42d17d; }
.perm-status.denied  { color: #ff6b6b; }

.btn-allow {
  margin-top: 4px;
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  border: none;
  background: var(--yellow, #ffbc42);
  color: #121113;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: opacity 0.15s;
}
.btn-allow:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-skip {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(0, 0, 0, 0.2);
  border-top-color: #121113;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.perms-pop-enter-active {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease;
}
.perms-pop-leave-active {
  transition: transform 0.2s ease, opacity 0.18s ease;
}
.perms-pop-enter-from,
.perms-pop-leave-to {
  opacity: 0;
  transform: translateY(60px);
}
</style>
