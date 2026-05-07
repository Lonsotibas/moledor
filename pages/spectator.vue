<script setup lang="ts">
import { socket } from "~/components/socket.ts";

definePageMeta({ ssr: false });

const { currentUser } = useUserData();
const emit = defineEmits(["showMenu"]);

type LogEntry = {
  id: number;
  time: string;
  type: "message_sent" | "message_received" | "fire_given" | "fire_received" | "match";
  text: string;
  from?: string;
  photo?: string;
};

const log = ref<LogEntry[]>([]);
const logBody = ref<HTMLElement | null>(null);
let counter = 0;

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function push(entry: Omit<LogEntry, "id" | "time">) {
  log.value.unshift({ id: counter++, time: now(), ...entry });
  if (log.value.length > 200) log.value.pop();
}

const iconFor: Record<LogEntry["type"], string> = {
  message_sent:     "solar:plain-bold",
  message_received: "solar:chat-round-dots-bold",
  fire_given:       "solar:fire-minimalistic-bold",
  fire_received:    "solar:fire-minimalistic-bold",
  match:            "solar:hearts-bold",
};

const colorFor: Record<LogEntry["type"], string> = {
  message_sent:     "#ffbc42",
  message_received: "#ecf8f8",
  fire_given:       "#ff6b6b",
  fire_received:    "#ff9f43",
  match:            "#42d17d",
};

function onMessage(msg: any) {
  const isMine = msg.senderId === currentUser.value?._id;
  push({
    type: isMine ? "message_sent" : "message_received",
    text: isMine
      ? `Enviaste: "${msg.message || "[media]"}"`
      : `Recibiste de ${msg.senderName || "alguien"}: "${msg.message || "[media]"}"`,
    from: msg.senderName,
    photo: msg.senderPhoto,
  });
}

function onFire(data: any) {
  push({
    type: "fire_received",
    text: `${data.fromName || "Alguien"} te dio fuego${data.isMutual ? " — ¡Match!" : ""}`,
    from: data.fromName,
    photo: data.fromPhoto,
  });
  if (data.isMutual) {
    push({ type: "match", text: `¡Match con ${data.fromName || "alguien"}!` });
  }
}

onBeforeMount(() => {
  emit("showMenu", false);
  socket.connect();
  socket.emit("join", currentUser.value?._id);
});

onMounted(() => {
  socket.on("message", onMessage);
  socket.on("fire", onFire);
  push({ type: "message_received", text: "Modo espectador activo. Observando actividad del sim…" });
});

onUnmounted(() => {
  socket.off("message", onMessage);
  socket.off("fire", onFire);
});
</script>

<template>
  <main class="view">
    <header class="topbar">
      <div class="sim-info">
        <div class="sim-avatar">
          <img
            v-if="(currentUser as any)?.photos?.[0]"
            :src="(currentUser as any).photos[0]"
            class="sim-photo"
            alt="Sim avatar"
          />
          <Icon v-else name="solar:user-circle-bold" size="28px" class="sim-icon" />
        </div>
        <div>
          <p class="sim-name">{{ currentUser?.nombre }}</p>
          <p class="sim-badge">Sim activo</p>
        </div>
      </div>
      <div class="pulse-wrap">
        <span class="pulse" />
        <span class="pulse-label">EN VIVO</span>
      </div>
    </header>

    <section class="log-wrap" ref="logBody">
      <TransitionGroup name="entry" tag="ul" class="log-list">
        <li v-for="entry in log" :key="entry.id" class="entry">
          <span class="entry-time">{{ entry.time }}</span>
          <Icon
            :name="iconFor[entry.type]"
            size="14px"
            :style="{ color: colorFor[entry.type] }"
            class="entry-icon"
          />
          <span class="entry-text" :style="{ color: colorFor[entry.type] }">
            {{ entry.text }}
          </span>
        </li>
      </TransitionGroup>

      <div v-if="log.length === 0" class="empty">
        <Icon name="solar:eye-bold-duotone" size="36px" />
        <p>Esperando actividad…</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.view {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--black, #0d0d0f);
  color: var(--white, #ecf8f8);
  padding-top: env(safe-area-inset-top);
  font-family: "Courier New", monospace;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--black, #0d0d0f);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.07);
}

.sim-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sim-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--yellow, #ffbc42);
  display: grid;
  place-items: center;
  background: rgba(255, 188, 66, 0.1);
  color: var(--yellow, #ffbc42);
  flex-shrink: 0;
}

.sim-photo {
  width: 38px;
  height: 38px;
  object-fit: cover;
}

.sim-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--yellow, #ffbc42);
}

.sim-badge {
  margin: 0;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pulse-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #42d17d;
  animation: pulse 1.5s infinite;
}

.pulse-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #42d17d;
  letter-spacing: 1px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.log-wrap {
  overflow-y: auto;
  padding: 12px 0 24px;
  scrollbar-width: none;
}
.log-wrap::-webkit-scrollbar { display: none; }

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.entry-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 1px;
}

.entry-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.entry-text {
  font-size: 0.82rem;
  line-height: 1.4;
  word-break: break-word;
}

.entry-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.entry-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 32px;
  color: rgba(255, 255, 255, 0.2);
  text-align: center;
  font-size: 0.9rem;
  font-family: inherit;
}
</style>
