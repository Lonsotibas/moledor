<script setup lang="ts">
import { socket } from "./socket";
const message = ref("hola");

const sendMsg = async (e: Event) => {
  socket.emit("message", message.value);
  await $fetch("/api/message", {
    method: "post",
    body: { message: message.value },
  });
};

onMounted(async () => {
  socket.on("message", (value: string) => {
    try {
      console.log(value);
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
  <div @click="sendMsg" class="received-msg">aprieta acaaaaa</div>
</template>
