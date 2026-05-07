<script setup lang="ts">
import { socket } from "~/components/socket.ts";

const { currentUser } = useUserData();
const { isSpectator } = useSpectator();
const emit = defineEmits(["showMenu"]);
const { counts, init: initUnread } = useUnread();

type ChatUser = { userId: { _id: string; nombre?: string; photos?: string[] } };
type Chat = {
  _id: string;
  users: ChatUser[];
  lastMessage?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
};

const state = reactive<{ loading: boolean; chats: Chat[]; q: string; searching: boolean }>({
  loading: true,
  chats: [],
  q: "",
  searching: false,
});

const searchInput = ref<HTMLInputElement | null>(null);

function toggleSearch() {
  state.searching = !state.searching;
  if (state.searching) {
    nextTick(() => searchInput.value?.focus());
  } else {
    state.q = "";
  }
}

const formatTime = (d?: string | Date) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isToday = date.toDateString() === now.toDateString();
  const isThisWeek = diffMs < 7 * 24 * 60 * 60 * 1000;
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isThisWeek) return date.toLocaleDateString("es", { weekday: "short" });
  return date.toLocaleDateString("es", { day: "numeric", month: "short" });
};

const otherOf = (chat: Chat) => {
  if (isSpectator.value) {
    return (chat.users?.find((u: any) => u?.userId?.isSim) ?? chat.users?.[0])?.userId;
  }
  const me = currentUser.value?._id;
  return chat.users?.find((u) => u?.userId?._id !== me)?.userId;
};

const sortByRecent = (a: Chat, b: Chat) => {
  const da = new Date((a as any).lastModified || a.updatedAt || a.createdAt || 0).getTime();
  const db = new Date((b as any).lastModified || b.updatedAt || b.createdAt || 0).getTime();
  return db - da;
};

const blockedIds = computed(() =>
  new Set(
    ((currentUser.value as any)?.blocked || []).map((b: any) =>
      typeof b.userId === "string" ? b.userId : b.userId?._id?.toString()
    )
  )
);

const filtered = computed(() => {
  const term = state.q.trim().toLowerCase();
  const items = [...state.chats]
    .filter((c) => {
      const other = otherOf(c);
      return !other?._id || !blockedIds.value.has(other._id);
    })
    .sort(sortByRecent);
  if (!term) return items;
  return items.filter((c) => (otherOf(c)?.nombre || "").toLowerCase().includes(term));
});

async function loadChats() {
  try {
    state.loading = true;
    if (isSpectator.value) {
      const fetched = await $fetch<Chat[]>("/api/sim/chats");
      state.chats = fetched.filter((c) => c && c._id && Array.isArray(c.users));
      return;
    }
    const freshUser = await $fetch<any>(`/api/user/${currentUser.value?._id}`);
    const chatIds = (freshUser?.chats || []).map((c: any) => c.chatId).filter(Boolean);
    if (!chatIds.length) { state.chats = []; return; }
    const fetched = await $fetch<Chat[]>("/api/chats", { method: "post", body: { chatIds, userId: currentUser.value?._id } });
    state.chats = fetched.filter((c) => c && c._id && Array.isArray(c.users));
    initUnread(state.chats, currentUser.value?._id ?? "");
  } finally {
    state.loading = false;
  }
}

onBeforeMount(async () => {
  await loadChats();
  emit("showMenu", true);
});

const onSocketMessage = async (msg: any) => {
  const chat = state.chats.find((c) => c._id === msg.chatId);
  if (chat) {
    chat.lastMessage =
      msg.mediaType === "image" ? "Imagen 📷"
      : msg.mediaType === "audio" ? "Audio 🎵"
      : msg.message ?? "";
    (chat as any).lastModified = new Date().toISOString();
  } else {
    // New chat not yet in local list — reload from DB
    await loadChats();
  }
};

onMounted(() => socket.on("message", onSocketMessage));
onUnmounted(() => socket.off("message", onSocketMessage));
</script>

<template>
  <main class="view">
    <!-- Top bar -->
    <header class="topbar">
      <Transition name="slide-title">
        <div v-if="!state.searching" class="title-row">
          <h1 class="page-title">Mensajes</h1>
        </div>
      </Transition>
      <Transition name="slide-search">
        <div v-if="state.searching" class="search-wrap">
          <Icon name="ion:search-outline" size="17px" class="search-icon" />
          <input
            ref="searchInput"
            v-model="state.q"
            type="search"
            class="search-input"
            placeholder="Buscar conversación…"
            aria-label="Buscar chat"
          />
        </div>
      </Transition>
      <button class="icon-btn" :aria-label="state.searching ? 'Cerrar búsqueda' : 'Buscar'" @click="toggleSearch">
        <Icon :name="state.searching ? 'ion:close' : 'ion:search-outline'" size="20px" />
      </button>
    </header>

    <!-- Skeletons -->
    <ul v-if="state.loading" class="chat-list">
      <li v-for="i in 7" :key="i" class="chat-item skeleton-item">
        <div class="avatar skel"></div>
        <div class="body">
          <div class="row-top">
            <span class="skel skel-name"></span>
            <span class="skel skel-chip"></span>
          </div>
          <span class="skel skel-preview"></span>
        </div>
      </li>
    </ul>

    <!-- Empty -->
    <section v-else-if="filtered.length === 0" class="empty">
      <div class="empty-icon-wrap">
        <Icon name="solar:chat-square-like-bold-duotone" size="32px" />
      </div>
      <p class="empty-title">{{ state.q ? "Sin resultados" : "Sin mensajes aún" }}</p>
      <p class="empty-sub">{{ state.q ? "Prueba con otro nombre." : isSpectator ? "Los sims aún no han iniciado conversaciones." : "Inicia una conversación desde Explorar." }}</p>
    </section>

    <!-- List -->
    <ul v-else class="chat-list">
      <li
        v-for="chat in filtered"
        :key="chat._id"
        class="chat-item"
      >
        <NuxtLink :to="{ name: 'chat-id', params: { id: chat._id } }" class="chat-link">
          <!-- Avatar -->
          <div class="avatar">
            <img
              v-if="otherOf(chat)?.photos?.[0]"
              :src="otherOf(chat)!.photos![0]"
              :alt="otherOf(chat)?.nombre"
              class="avatar-img"
              loading="lazy"
            />
            <Icon v-else name="solar:user-circle-bold" size="32px" class="avatar-icon" />
            <span class="online-dot" aria-hidden="true"></span>
          </div>

          <!-- Content -->
          <div class="body">
            <div class="row-top">
              <span class="name">{{ otherOf(chat)?.nombre || "Usuario" }}</span>
              <span class="time">{{ formatTime(chat.updatedAt || chat.createdAt) }}</span>
            </div>
            <div class="row-bottom">
              <span class="preview">{{ chat.lastMessage || "Inicia la conversación" }}</span>
              <span v-if="counts[chat._id] > 0" class="badge">
                {{ counts[chat._id] > 99 ? "99+" : counts[chat._id] }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
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
}

/* Top bar */
.topbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
  background: var(--black, #0d0d0f);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.07);
  position: relative;
  overflow: hidden;
  min-height: 56px;
}

.page-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: var(--yellow, #ffbc42);
  position: absolute;
  left: 16px;
}

.search-wrap {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px 12px;
  width: 100%;
}
.search-icon {
  color: rgba(255, 255, 255, 0.4);
}
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--white, #ecf8f8);
  font-size: 0.95rem;
  font-family: inherit;
  width: 100%;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--white, #ecf8f8);
}

/* Search bar transitions */
.slide-title-enter-active,
.slide-title-leave-active,
.slide-search-enter-active,
.slide-search-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.slide-title-enter-from,
.slide-title-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
.slide-search-enter-from,
.slide-search-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* Chat list */
.chat-list {
  list-style: none;
  margin: 0;
  padding: 6px 0 calc(80px + env(safe-area-inset-bottom));
  overflow-y: auto;
  scrollbar-width: none;
}
.chat-list::-webkit-scrollbar {
  display: none;
}

.chat-item + .chat-item {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-link {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 12px;
  align-items: center;
  padding: 11px 16px;
  text-decoration: none;
  color: inherit;
  transition: background 0.12s ease;
}
.chat-link:hover {
  background: rgba(255, 255, 255, 0.04);
}
.chat-link:active {
  background: rgba(255, 255, 255, 0.07);
}

/* Avatar */
.avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 188, 66, 0.25), rgba(6, 214, 160, 0.15));
  border: 1.5px solid rgba(255, 255, 255, 0.09);
  display: grid;
  place-items: center;
  overflow: visible;
}
.avatar-img {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-icon {
  color: var(--yellow, #ffbc42);
}
.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #42d17d;
  border: 2px solid var(--black, #0d0d0f);
}

/* Content */
.body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.name {
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}
.row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.preview {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}
.badge {
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--yellow, #ffbc42);
  color: #000;
  font-size: 0.7rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  line-height: 1;
}

/* Empty */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 32px;
  text-align: center;
}
.empty-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 188, 66, 0.08);
  border: 1px solid rgba(255, 188, 66, 0.18);
  color: var(--yellow, #ffbc42);
  margin-bottom: 4px;
}
.empty-title {
  font-weight: 800;
  font-size: 1.05rem;
  margin: 0;
}
.empty-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.88rem;
  margin: 0;
  max-width: 220px;
}

/* Skeletons */
.skeleton-item {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 12px;
  align-items: center;
  padding: 11px 16px;
}
.skel {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  position: relative;
  overflow: hidden;
}
.skel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.3s infinite;
}
.skeleton-item .avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  border: none;
}
.skeleton-item .avatar::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.3s infinite;
}
.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.skel-name {
  height: 13px;
  width: 55%;
  display: block;
}
.skel-chip {
  height: 11px;
  width: 38px;
  display: block;
  flex-shrink: 0;
}
.skel-preview {
  height: 11px;
  width: 80%;
  display: block;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 16px;
}
</style>
