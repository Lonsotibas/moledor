<script setup lang="ts">
import { socket } from "~/components/socket.ts";

const { currentUser, setUserData } = useUserData();
const showMenu = ref(false);
const route = useRoute();
const { increment, nameFor, photoFor } = useUnread();
const { show: showNotif } = useNotif();

onBeforeMount(() => {
  if (!currentUser.value) {
    showMenu.value = false;
    navigateTo("/");
  }
});

const joinRoom = () => socket.emit("join", currentUser.value?._id);

const onGlobalMessage = (msg: any) => {
  if (!msg || msg.senderId === currentUser.value?._id) return;

  const isViewing = route.name === "chat-id" && route.params.id === msg.chatId;
  if (isViewing) return;

  increment(msg.chatId);

  const name = nameFor(msg.chatId);
  const text =
    msg.mediaType === "image" ? "Imagen 📷"
    : msg.mediaType === "audio" ? "Audio 🎵"
    : msg.message ?? "";

  showNotif(`/chat/${msg.chatId}`, name, text, photoFor(msg.chatId));

  if (
    "Notification" in window &&
    Notification.permission === "granted" &&
    document.visibilityState !== "visible"
  ) {
    new Notification(name, { body: text });
  }
};

const onFireEvent = (data: any) => {
  if (!data) return;
  const name = data.fromName ?? "Alguien";
  const text = data.isMutual ? "🔥 ¡Es un match!" : "🔥 Te ha dado fuego";
  showNotif("/fires", name, text, data.fromPhoto ?? null);

  if (
    "Notification" in window &&
    Notification.permission === "granted" &&
    document.visibilityState !== "visible"
  ) {
    new Notification(name, { body: text });
  }
};

onMounted(() => {
  if (!currentUser.value) return;

  socket.connect();
  joinRoom();
  socket.on("connect", joinRoom);
  socket.on("message", onGlobalMessage);
  socket.on("fire", onFireEvent);

});

onUnmounted(() => {
  socket.off("connect", joinRoom);
  socket.off("message", onGlobalMessage);
  socket.off("fire", onFireEvent);
});
</script>

<template>
  <div id="app">
    <NuxtPage
      @showMenu="
        (show: boolean) => {
          showMenu = show;
        }
      "
    />
    <Menu v-if="showMenu" />
    <NotifBanner />
    <PermissionsModal v-if="currentUser" />
  </div>
</template>
