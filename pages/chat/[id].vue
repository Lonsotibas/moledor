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
let chunks: Array<BlobPart> = [];

const isRecording = ref(false);
const chatId = route.params.id as string;
const chat = await $fetch(`/api/chat/${chatId}`);
const { currentUser } = useUserData();
const otherUser = chat.users?.find(
  (value: any) => value.userId._id !== currentUser.value?._id
);

const messagesEnd = ref<HTMLDivElement | null>(null);

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesEnd.value?.scrollIntoView({ block: "end", behavior: "smooth" });
  });
}

onBeforeMount(async () => {
  sound = new Audio(notification);
  state.messages = await $fetch(`/api/messages/${chatId}`);
  socket.connect();
});

onMounted(() => {
  emit("showMenu", false);
  scrollToBottom();

  socket.on("message", (value) => {
    state.messages.push(value);
    sound.play();
    scrollToBottom();
  });

  socket.on("new-message", (msg) => {
    state.messages.push(msg);
    sound.play();
    scrollToBottom();
  });
});

watch(
  () => state.messages.length,
  () => scrollToBottom()
);

onUnmounted(() => {
  socket.disconnect();
});

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
      receiverId: otherUser._id,
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
const captureAudio = async () => {
  try {
    chunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    isRecording.value = true;
  } catch {
    isRecording.value = false;
  }
};
// Envia Audio
const sendAudio = () => {
  if (!recorder) return;
  try {
    recorder.stop();
    recorder.addEventListener("stop", async () => {
      isRecording.value = false;
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      const arrayBuffer = await audioBlob.arrayBuffer();

      socket.emit(
        "upload",
        arrayBuffer,
        {
          type: "audio",
          mimeType: audioBlob.type,
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
                mediaType: "audio",
                senderId: currentUser.value?._id,
                receiverId: otherUser._id,
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
  } catch {
    isRecording.value = false;
  } finally {
    recorder = null;
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
            receiverId: otherUser._id,
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
        <button class="icon-btn" aria-label="Bloquear">
          <Icon size="24px" name="ri:prohibited-2-line" />
        </button>
        <button class="icon-btn" aria-label="Fuego">
          <Icon size="24px" name="solar:fire-minimalistic-outline" />
        </button>
      </div>
    </header>
    <!-- Body -->
    <section class="chat-body" aria-live="polite">
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
            <img :src="msg.mediaUrl" class="chat-image" alt="Imagen enviada" />
          </template>

          <template v-else-if="msg.mediaType === 'audio'">
            <audio :src="msg.mediaUrl" controls preload="metadata"></audio>
          </template>

          <template v-else>
            <span class="bubble-text">{{ msg.message }}</span>
          </template>

          <span class="meta">{{ formatTime(msg.createdAt) }}</span>
        </div>
      </div>

      <div ref="messagesEnd" style="height: 1px"></div>
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
        @pointerleave="isRecording && sendAudio()"
      >
        <Icon
          id="icon-audio"
          size="26px"
          name="solar:microphone-large-outline"
        />
        <span class="hold-tip">Mantén para grabar</span>
        <span class="pulse" aria-hidden="true"></span>
      </button>
    </footer>
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
}
.bubble.audio audio {
  width: min(70vw, 320px);
  display: block;
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
