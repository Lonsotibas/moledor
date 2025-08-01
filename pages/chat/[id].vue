<script setup lang="ts">
import { socket } from "~/components/socket";
import notification from "~/assets/sounds/notification.m4a";
const route = useRoute();

const sound = new Audio(notification);
const chatId = route.params.id;
const chat = await $fetch(`/api/chat/${chatId}`);
const { currentUser } = useUserData();
const otherUser = await chat.users?.find((value) => {
  return value.userId != currentUser.value?._id;
});

const message = ref("");
const state = reactive({ messages: [] });

state.messages = await $fetch(`/api/messages/${chatId}`);

const sendMsg = async (e: Event) => {
  const msg = await $fetch("/api/message", {
    method: "post",
    body: {
      message: message.value,
      senderId: currentUser.value?._id,
      receiverId: otherUser._id,
      chatId: chatId,
    },
  });
  message.value = null;
  socket.emit("message", msg);
};

onBeforeMount(() => {
  socket.connect();
});

onMounted(async () => {
  socket.on("message", (value) => {
    try {
      state.messages.push(value);
      sound.play();
    } catch (e) {
      console.error(e);
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});
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
      <div v-for="msg in state.messages">
        <div v-if="msg.senderId === currentUser._id" class="sent-msg">
          {{ msg.message }}
        </div>
        <div v-if="msg.senderId !== currentUser._id" class="received-msg">
          {{ msg.message }}
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <input
        class="dialog"
        type="text"
        v-model="message"
        @keydown.enter="sendMsg($event)"
        placeholder="Di algo"
      />
      <Icon id="icon-send" @click="sendMsg($event)" name="ion:send-sharp" />
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
  right: 1em;
  color: var(--yellow);
}
</style>
