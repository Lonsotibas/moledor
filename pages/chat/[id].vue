<script setup lang="ts">
import { socket } from "~/components/socket.ts"; // ✅ using your existing file
import notification from "~/assets/sounds/notification.m4a";

const route = useRoute();
const message = ref("");
const state = reactive<{ messages: any[] }>({ messages: [] });
const emit = defineEmits(["showMenu"]);

const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => {
  fileInput.value?.click();
};

let sound: HTMLAudioElement;
let recorder: MediaRecorder;
let chunks: Array<BlobPart> = [];

const chatId = route.params.id;
const chat = await $fetch(`/api/chat/${chatId}`);
const { currentUser } = useUserData();
const otherUser = chat.users?.find(
  (value: any) => value.userId !== currentUser.value?._id
);

onBeforeMount(async () => {
  sound = new Audio(notification);
  state.messages = await $fetch(`/api/messages/${chatId}`);
  socket.connect();
});

onMounted(() => {
  emit("showMenu", false);

  socket.on("message", (value) => {
    state.messages.push(value);
    sound.play();
  });

  socket.on("new-message", (msg) => {
    state.messages.push(msg);
    sound.play();
  });
});

onUnmounted(() => {
  socket.disconnect();
});

// Mensajes de Texto
const sendMsg = async () => {
  const msg = await $fetch("/api/message", {
    method: "post",
    body: {
      message: message.value,
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
// Mensajes de Audio
// Captura Audio
const captureAudio = async () => {
  chunks = [];
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); // ✅ specify
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.start();
};
// Envia Audio
const sendAudio = () => {
  if (!recorder) return;
  recorder.stop();

  recorder.addEventListener("stop", async () => {
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
};
// Mensajes de Imagenes
// Comprime la imagen
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const maxWidth = 1024; // limit size
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
        0.8 // quality
      );
    };
  });
};
// Manda la Imagen
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
    <div class="chat-header">
      <Icon @click="$router.back()" size="20px" name="ion:caret-back" />
      <span>{{ otherUser?.userId.nombre }}</span>
      <div class="opts">
        <Icon size="30px" name="ri:prohibited-2-line" />
        <Icon size="30px" name="solar:fire-minimalistic-outline" />
      </div>
    </div>

    <div class="chat-body">
      <div v-for="(msg, index) in state.messages" :key="index">
        <!-- Mensaje enviado -->
        <div v-if="msg.senderId === currentUser._id" class="sent-msg">
          <template v-if="msg.mediaType === 'image'">
            <img :src="msg.mediaUrl" class="chat-image" />
          </template>
          <template v-else-if="msg.mediaType === 'audio'">
            <audio :src="msg.mediaUrl" controls></audio>
          </template>
          <template v-else>
            {{ msg.message }}
          </template>
        </div>

        <!-- Mensaje Recibido -->
        <div v-else class="received-msg">
          <template v-if="msg.mediaType === 'image'">
            <img :src="msg.mediaUrl" class="chat-image" />
          </template>
          <template v-else-if="msg.mediaType === 'audio'">
            <audio :src="msg.mediaUrl" controls></audio>
          </template>
          <template v-else>
            {{ msg.message }}
          </template>
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <input
        class="dialog"
        type="text"
        v-model="message"
        @keydown.enter="sendMsg"
        placeholder="Di algo"
      />
      <Icon
        id="icon-image"
        @click="triggerFileInput"
        size="30px"
        name="mdi:image-outline"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="sendImage"
        style="display: none"
      />
      <Icon id="icon-send" @click="sendMsg" name="ion:send-sharp" />
      <Icon
        id="icon-audio"
        @pointerdown="captureAudio"
        @pointerup="sendAudio"
        name="solar:microphone-large-outline"
      />
    </div>
  </main>
</template>

<style scoped>
.view {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  max-height: 100vh;
  width: 100vw;
  background-color: var(--black);
  overflow-y: hidden;
}
.chat-header {
  background-color: var(--black);
  height: 5%;
  padding: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-content: center;
  align-items: center;
  text-align: center;
}
.opts {
  text-align: right;
}
.chat-body {
  height: 75%;
  padding: 15px;
  overflow-y: scroll;
}
.received-msg {
  margin-bottom: 10px;
  padding: 5px 10px;
  height: auto;
  max-width: 200px;
  border-radius: 20px;
  background-color: var(--yellow);
  color: white;
  font-weight: 600;
}
.sent-msg {
  margin-bottom: 10px;
  padding: 5px 10px;
  height: auto;
  max-width: 200px;
  border-radius: 20px;
  background-color: var(--green);
  color: black;
  font-weight: 600;
  margin-left: auto;
}
.chat-footer {
  height: 15%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
.dialog {
  margin: 0 auto;
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 10px;
  width: 90%;
  height: 60px;
}
#icon-send {
  font-size: 30px;
  position: absolute;
  right: 2em;
  color: var(--yellow);
}
#icon-audio {
  font-size: 30px;
  position: absolute;
  right: 1em;
  color: var(--black-mute);
}
#icon-audio:active {
  font-size: 35px;
}
.chat-image {
  max-width: 150px;
  border-radius: 8px;
}
</style>
