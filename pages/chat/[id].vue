<script setup lang="ts">
import { socket } from "~/components/socket";
const route = useRoute();

const chatId = route.params.id;
const chat = await $fetch(`/api/chat/${chatId}`);
const { currentUser } = useUserData();
const otherUserId = chat.users.find((value) => {
  return value.userId != currentUser.value._id;
});
const otherUser = await $fetch(`/api/user/${otherUserId.userId}`);

console.log("Current User: ", currentUser.value._id);
console.log("Other User: ", otherUser._id);

const message = ref("");
const state = reactive({ messages: [] });

const sendMsg = async (e: Event) => {
  const msg = await $fetch("/api/message", {
    method: "post",
    body: {
      message: message.value,
      senderId: currentUser.value._id,
      receiverId: otherUser._id,
      chatId: chatId,
    },
  });
  socket.emit("message", msg);
};

onBeforeMount(() => {
  socket.connect();
});

onMounted(async () => {
  state.messages = await $fetch(`/api/messages/${chatId}`);
  socket.on("message", (value) => {
    try {
      state.messages.push(value);
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
        <div v-if="msg.senderId === otherUser._id" class="received-msg">
          {{ msg.message }}
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <div class="dialog">
        <textarea
          v-model="message"
          @keydown.enter="sendMsg($event)"
          placeholder="Di algo"
        />
      </div>
      <div></div>
    </div>
    <Connection />
  </main>
</template>

<style scoped>
.view {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  height: 100vh;
  width: 100vw;
  background-color: var(--black-soft);
}
.chat-header {
  background-color: var(--black);
  height: 3em;
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
  height: 88%;
  padding: 15px;
}
.received-msg {
  margin-bottom: 10px;
  padding: 5px 10px;
  height: auto;
  max-width: 200px;
  border-radius: 20px;
  background-color: var(--yellow);
  color: black;
  font-weight: 400;
}
.sent-msg {
  margin-bottom: 10px;
  padding: 5px 10px;
  height: auto;
  max-width: 200px;
  border-radius: 20px;
  background-color: var(--green);
  color: black;
  font-weight: 400;
  margin-left: auto;
}
.chat-footer {
  height: 12%;
}
.dialog {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog textarea {
  padding: 5px 10px;
  border-radius: 10px;
  width: 90%;
  height: auto;
  position: fixed;
}
.dialog textarea:focus {
  outline: none;
}
</style>
