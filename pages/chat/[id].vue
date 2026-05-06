<script setup lang="ts">
import { socket } from "~/components/socket.ts";
import notification from "~/assets/sounds/notification.m4a";

const route = useRoute();
const message = ref("");
const state = reactive<{ messages: any[] }>({ messages: [] });
const emit = defineEmits(["showMenu"]);

const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

let sound: HTMLAudioElement;
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let chunks: Array<BlobPart> = [];

function getAudioMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

const isRecording = ref(false);
const recordingTime = ref(0);
let recordingTimer: ReturnType<typeof setInterval> | null = null;

function fmtRecTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function startTimer() {
  stopTimer();
  recordingTime.value = 0;
  recordingTimer = setInterval(() => recordingTime.value++, 1000);
}

function stopTimer() {
  if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null; }
}
const chatId = route.params.id as string;
const chat = await $fetch(`/api/chat/${chatId}`);
const { currentUser, setUserData } = useUserData();
const otherUser = chat.users?.find(
  (value: any) => value.userId._id !== currentUser.value?._id
);

const chatBody = ref<HTMLElement | null>(null);
const lightboxSrc = ref<string | null>(null);
const showScrollBtn = ref(false);

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") lightboxSrc.value = null;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
}

function onChatScroll() {
  if (!chatBody.value) return;
  const { scrollTop, scrollHeight, clientHeight } = chatBody.value;
  showScrollBtn.value = scrollHeight - scrollTop - clientHeight > 120;
}

const { clear: clearUnread } = useUnread();

onBeforeMount(async () => {
  sound = new Audio(notification);
  state.messages = await $fetch(`/api/messages/${chatId}`);
  socket.connect();
  socket.emit("join", currentUser.value?._id);

  clearUnread(chatId);
  $fetch("/api/chat/read", {
    method: "patch",
    body: { chatId, userId: currentUser.value?._id },
  }).catch(() => {});
});

const onSocketConnect = () => {
  socket.emit("join", currentUser.value?._id);
};

const onSocketMessage = (value: any) => {
  state.messages.push(value);
  if (value.senderId !== currentUser.value?._id) sound.play();
  scrollToBottom();
};

onMounted(() => {
  emit("showMenu", false);
  scrollToBottom();
  window.addEventListener("keydown", onKeydown);

  socket.on("connect", onSocketConnect);
  socket.on("message", onSocketMessage);
  socket.on("new-message", onSocketMessage);
});

watch(
  () => state.messages.length,
  () => scrollToBottom()
);

onUnmounted(() => {
  socket.off("connect", onSocketConnect);
  socket.off("message", onSocketMessage);
  socket.off("new-message", onSocketMessage);
  window.removeEventListener("keydown", onKeydown);
});

// Block
const showBlockDialog = ref(false);
const blocking = ref(false);

async function blockUser() {
  blocking.value = true;
  try {
    const updated = await $fetch("/api/user/block", {
      method: "patch",
      body: {
        userId: currentUser.value?._id,
        otherUserId: otherUser.userId._id,
      },
    });
    setUserData(updated as any);
    navigateTo("/chats");
  } finally {
    blocking.value = false;
    showBlockDialog.value = false;
  }
}

// Helpers
const isMine = (msg: any) => msg.senderId === currentUser.value?._id;

const formatTime = (d: any) => {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Envia Mensaje
const sendMsg = async () => {
  const text = message.value?.trim();
  if (!text) return;

  const msg = await $fetch("/api/message", {
    method: "post",
    body: {
      message: text,
      senderId: currentUser.value?._id,
      receiverId: otherUser.userId._id,
      chatId,
    },
  });

  if (msg) {
    await $fetch(`/api/chat/${chatId}`, {
      method: "patch",
      body: { lastMessage: msg.message },
    });
    socket.emit("message", msg);
  }
  message.value = "";
};

// Audio
// Captura Audio
const captureAudio = async (e: PointerEvent) => {
  e.preventDefault();
  if (isRecording.value) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  try {
    chunks = [];
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getAudioMimeType();
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };
    recorder.start(100); // collect a chunk every 100 ms
    isRecording.value = true;
    startTimer();
  } catch {
    isRecording.value = false;
  }
};
// Cancela Audio
const cancelAudio = () => {
  stopTimer();
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  if (recorder) {
    try { recorder.stop(); } catch {}
    recorder = null;
  }
  isRecording.value = false;
  chunks = [];
};
// Envia Audio
const sendAudio = () => {
  if (!recorder) return;
  stopTimer();
  const rec = recorder;
  const currentStream = stream;
  recorder = null;
  stream = null;

  // Register listener BEFORE stop so the event is never missed
  rec.addEventListener("stop", async () => {
    isRecording.value = false;
    currentStream?.getTracks().forEach((t) => t.stop());

    if (!chunks.length) return;
    const audioBlob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
    const arrayBuffer = await audioBlob.arrayBuffer();

    socket.emit(
      "upload",
      arrayBuffer,
      {
        type: "audio",
        mimeType: audioBlob.type,
        senderId: currentUser.value?._id,
        receiverId: otherUser.userId._id,
        chatId,
      },
      async (res: any) => {
        if (res.success) {
          await $fetch("/api/message", {
            method: "post",
            body: {
              mediaUrl: res.url,
              mediaType: "audio",
              senderId: currentUser.value?._id,
              receiverId: otherUser.userId._id,
              chatId,
              createdAt: new Date(),
            },
          });

          await $fetch(`/api/chat/${chatId}`, {
            method: "patch",
            body: { lastMessage: "Audio message" },
          });
        }
      }
    );
  });

  try {
    rec.stop();
  } catch {
    isRecording.value = false;
    currentStream?.getTracks().forEach((t) => t.stop());
  }
};

// Images
// Comprime imagen
const compressImage = (file: File): Promise<Blob> =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const maxWidth = 1024;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          resolve(blob!);
          URL.revokeObjectURL(img.src);
        },
        "image/jpeg",
        0.8
      );
    };
  });
// Envia imagen
const sendImage = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const compressedBlob = await compressImage(file);
  const arrayBuffer = await compressedBlob.arrayBuffer();

  socket.emit(
    "upload",
    arrayBuffer,
    {
      type: "image",
      mimeType: "image/jpeg",
      senderId: currentUser.value?._id,
      receiverId: otherUser._id,
      chatId,
    },
    async (res: any) => {
      if (res.success) {
        await $fetch("/api/message", {
          method: "post",
          body: {
            mediaUrl: res.url,
            mediaType: "image",
            senderId: currentUser.value?._id,
            receiverId: otherUser.userId._id,
            chatId,
            createdAt: new Date(),
          },
        });

        await $fetch(`/api/chat/${chatId}`, {
          method: "patch",
          body: { lastMessage: "Image message" },
        });
      }
      input.value = "";
    }
  );
};
</script>

<template>
  <main class="view">
    <!-- Header -->
    <header class="chat-header">
      <button class="icon-btn back" aria-label="Volver" @click="$router.back()">
        <Icon size="20px" name="ion:caret-back" />
      </button>
      <div class="peer">
        <span class="name" :title="otherUser?.userId?.nombre">
          {{ otherUser?.userId?.nombre || "Chat" }}
        </span>
        <span class="status"> <span class="dot"></span> En línea </span>
      </div>

      <div class="opts">
        <button class="icon-btn" aria-label="Bloquear" @click="showBlockDialog = true">
          <Icon size="24px" name="ri:prohibited-2-line" />
        </button>
        <button class="icon-btn" aria-label="Fuego">
          <Icon size="24px" name="solar:fire-minimalistic-outline" />
        </button>
      </div>
    </header>
    <!-- Body -->
    <section ref="chatBody" class="chat-body" aria-live="polite" @scroll.passive="onChatScroll">
      <div
        v-for="(msg, index) in state.messages"
        :key="msg._id || index"
        :class="['msg-row', isMine(msg) ? 'sent' : 'received']"
      >
        <div
          class="bubble"
          :class="{
            image: msg.mediaType === 'image',
            audio: msg.mediaType === 'audio',
          }"
        >
          <template v-if="msg.mediaType === 'image'">
            <img
              :src="msg.mediaUrl"
              class="chat-image"
              alt="Imagen enviada"
              draggable="false"
              @click="lightboxSrc = msg.mediaUrl"
              @contextmenu.prevent
            />
          </template>

          <template v-else-if="msg.mediaType === 'audio'">
            <AudioPlayer :src="msg.mediaUrl" />
          </template>

          <template v-else>
            <span class="bubble-text">{{ msg.message }}</span>
          </template>

          <span class="meta">{{ formatTime(msg.createdAt) }}</span>
        </div>
      </div>

    </section>

    <!-- Footer -->
    <footer class="chat-footer" :class="{ recording: isRecording }">
      <div class="composer">
        <button
          class="icon-btn left"
          aria-label="Adjuntar imagen"
          @click="triggerFileInput"
        >
          <Icon id="icon-image" size="22px" name="mdi:image-outline" />
        </button>

        <input
          class="dialog"
          type="text"
          v-model="message"
          @keydown.enter="sendMsg"
          placeholder="Escribe un mensaje"
          autocomplete="off"
        />

        <button
          class="icon-btn right send"
          aria-label="Enviar mensaje"
          @click="sendMsg"
        >
          <Icon id="icon-send" size="22px" name="ion:send-sharp" />
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="sendImage"
        style="display: none"
      />

      <button
        class="mic-btn"
        :class="{ active: isRecording }"
        aria-label="Mantener para grabar"
        @pointerdown="captureAudio"
        @pointerup="sendAudio"
        @pointercancel="cancelAudio"
        @contextmenu.prevent
      >
        <span v-if="isRecording" class="rec-time">{{ fmtRecTime(recordingTime) }}</span>
        <Icon v-else size="26px" name="solar:microphone-large-outline" />
        <span class="hold-tip">Mantén para grabar</span>
        <span class="pulse" aria-hidden="true"></span>
      </button>
    </footer>
    <!-- Scroll to bottom -->
    <Transition name="fade-up">
      <button
        v-if="showScrollBtn"
        class="scroll-to-bottom"
        aria-label="Ir al mensaje más reciente"
        @click="scrollToBottom"
      >
        <Icon name="solar:alt-arrow-down-bold" size="20px" />
      </button>
    </Transition>

    <!-- Block dialog -->
    <Transition name="lb">
      <div v-if="showBlockDialog" class="lightbox dialog-backdrop" @click.self="showBlockDialog = false">
        <div class="block-dialog">
          <p class="block-title">¿Bloquear a {{ otherUser?.userId?.nombre }}?</p>
          <p class="block-sub">Ya no podrán verse ni enviarse mensajes.</p>
          <div class="block-actions">
            <button class="block-cancel" @click="showBlockDialog = false">Cancelar</button>
            <button class="block-confirm" :disabled="blocking" @click="blockUser">
              {{ blocking ? "Bloqueando…" : "Bloquear" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Lightbox -->
    <Transition name="lb">
      <div
        v-if="lightboxSrc"
        class="lightbox"
        @click="lightboxSrc = null"
      >
        <img
          :src="lightboxSrc"
          class="lightbox-img"
          alt="Imagen ampliada"
          draggable="false"
          @contextmenu.prevent
        />
      </div>
    </Transition>
  </main>
</template>

<style scoped>
:root {
  --surface: var(--black);
  --surface-2: var(--black-soft, #121212);
  --text: var(--white, #fff);
  --muted: var(--white-mute, #a9a9a9);
  --accent-1: var(--yellow, #ffd166);
  --accent-2: var(--green, #06d6a0);
  --radius: 20px;
  --shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.view {
  position: fixed;
  inset: 0;
  z-index: 2;
  background: var(--surface);
  color: var(--text);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

/* Header */
.chat-header {
  position: sticky;
  top: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: 48px 1fr 80px;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text);
  border-radius: 10px;
  cursor: pointer;
}
.icon-btn:active {
  transform: translateY(1px);
}
.back {
  justify-self: start;
}

.peer {
  display: grid;
  align-items: center;
  line-height: 1.1;
}
.name {
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status {
  color: var(--muted);
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.status .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #42d17d;
  box-shadow: 0 0 0 2px rgba(66, 209, 125, 0.2);
}
.opts {
  justify-self: end;
  display: inline-flex;
  gap: 6px;
}

/* Body */
.chat-body {
  overflow-y: auto;
  padding: 14px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}
.msg-row {
  display: flex;
  width: 100%;
  animation: appear 0.18s ease;
}
.msg-row.sent {
  justify-content: flex-end;
}
.msg-row.received {
  justify-content: flex-start;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mensaje */
.bubble {
  min-width: min(20vw, 300px);
  max-width: min(76vw, 520px);
  padding: 8px 12px 18px;
  position: relative;
  border-radius: 5px;
  box-shadow: var(--shadow);
  word-wrap: break-word;
  overflow: hidden;
}
.received .bubble {
  background: var(--yellow);
  color: #f7f7f7;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.sent .bubble {
  background: var(--green);
  color: #f7fff9;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.bubble-text {
  white-space: pre-wrap;
}

/* Media */
.bubble.image {
  padding: 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.chat-image {
  max-width: min(70vw, 460px);
  max-height: 56vh;
  display: block;
  border-radius: 12px;
  object-fit: cover;
  cursor: zoom-in;
  user-select: none;
  -webkit-user-drag: none;
}
.bubble.audio {
  padding: 6px 6px 18px;
}

/* Tiempo */
.meta {
  position: absolute;
  display: block;
  bottom: 0;
  right: 4px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.75);
}

/* Footer */
.chat-footer {
  position: sticky;
  bottom: 0;
  user-select: none;
  -webkit-user-select: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.65) 30%,
    rgba(0, 0, 0, 0.85)
  );
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: end;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.composer {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  min-height: 52px;
  box-shadow: var(--shadow);
}
.composer .icon-btn.left {
  justify-self: center;
}
.composer .icon-btn.right {
  justify-self: center;
}

.dialog {
  width: 100%;
  height: 42px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 16px;
  padding: 0 6px;
  outline: none;
}
.dialog::placeholder {
  color: var(--muted);
}

.icon-btn.send {
  color: var(--accent-1);
}

/* Microfono */
.mic-btn {
  position: relative;
  height: 52px;
  width: 52px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--surface-2);
  color: var(--text);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.mic-btn .hold-tip {
  position: absolute;
  bottom: 58px;
  background: rgba(0, 0, 0, 0.75);
  color: var(--text);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(4px);
  transition: 0.18s ease;
  pointer-events: none;
}
.mic-btn:hover .hold-tip {
  opacity: 1;
  transform: translateY(0);
}

.mic-btn.active {
  outline: 2px solid rgba(255, 82, 82, 0.45);
}
.rec-time {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ff5252;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  line-height: 1;
}
.mic-btn .pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.5);
  transform: scale(1);
  opacity: 0;
}
.chat-footer.recording .mic-btn .pulse {
  animation: pulse 1.2s ease-out infinite;
  opacity: 1;
}
@keyframes pulse {
  to {
    box-shadow: 0 0 0 14px rgba(255, 82, 82, 0);
    transform: scale(1.05);
  }
}

/* Block dialog */
.dialog-backdrop {
  align-items: center;
  padding: 24px;
}
.block-dialog {
  background: var(--surface-2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 24px 20px 16px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}
.block-title {
  font-weight: 800;
  font-size: 1.05rem;
  margin: 0 0 8px;
  text-align: center;
}
.block-sub {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.88rem;
  margin: 0 0 20px;
  text-align: center;
  line-height: 1.4;
}
.block-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.block-cancel,
.block-confirm {
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.block-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
.block-confirm {
  background: #ff4444;
  color: #fff;
}
.block-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Scroll to bottom button */
.scroll-to-bottom {
  position: absolute;
  bottom: calc(90px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: var(--surface-2);
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
}
.scroll-to-bottom:active {
  transform: translateX(-50%) scale(0.9);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.92);
  display: grid;
  place-items: center;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 95vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 8px;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.18s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

/* Scrollbar */
.chat-body::-webkit-scrollbar {
  width: 10px;
}
.chat-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
.chat-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}
</style>
