<script setup lang="ts">
const { currentUser } = useUserData();
const emit = defineEmits(["showMenu"]);

type ChatUser = { userId: { _id: string; nombre?: string; foto?: string } };
type Chat = {
  _id: string;
  users: ChatUser[];
  lastMessage?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
};

const state = reactive<{
  loading: boolean;
  chats: Chat[];
  q: string;
}>({
  loading: true,
  chats: [],
  q: "",
});

const formatTime = (d?: string | Date) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const otherOf = (chat: Chat) => {
  const me = currentUser.value?._id;
  const entry = chat.users?.find((u) => u?.userId?._id !== me);
  return entry?.userId;
};

const sortByRecent = (a: Chat, b: Chat) => {
  const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
  const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
  return db - da;
};

const filtered = computed(() => {
  const term = state.q.trim().toLowerCase();
  const items = [...state.chats].sort(sortByRecent);
  if (!term) return items;
  return items.filter((c) =>
    (otherOf(c)?.nombre || "").toLowerCase().includes(term)
  );
});

async function loadChats() {
  try {
    state.loading = true;
    const myChats = currentUser.value?.chats || [];
    const fetched = await Promise.all(
      myChats.map((c: any) => $fetch<Chat>(`/api/chat/${c.chatId}`))
    );
    // Filter out malformed items just in case
    state.chats = fetched.filter((c) => c && c._id && Array.isArray(c.users));
  } finally {
    state.loading = false;
  }
}

onBeforeMount(async () => {
  await loadChats();
  emit("showMenu", true);
});

watch(
  () => currentUser.value?.chats,
  async (nv, ov) => {
    if (nv !== ov) await loadChats();
  },
  { deep: true }
);
</script>

<template>
  <main class="view">
    <!-- Header -->
    <header class="bar">
      <div class="search">
        <Icon name="ion:search-outline" size="18px" />
        <input
          v-model="state.q"
          type="search"
          placeholder="Buscar"
          aria-label="Buscar chat"
        />
      </div>
    </header>

    <section v-if="!state.loading && filtered.length === 0" class="empty">
      <div class="empty-badge">
        <Icon name="solar:chat-square-like-bold-duotone" size="28px" />
      </div>
      <p class="empty-title">No hay chats aún</p>
      <p class="empty-sub">Inicia una conversación desde explorar.</p>
    </section>

    <ul v-else-if="state.loading" class="chat-list">
      <li v-for="i in 6" :key="i" class="chat-item loading">
        <div class="avatar skel"></div>
        <div class="meta">
          <div class="row">
            <span class="name skel skel-text"></span>
            <span class="time skel skel-chip"></span>
          </div>
          <span class="preview skel skel-text"></span>
        </div>
      </li>
    </ul>

    <!-- List -->
    <ul v-else class="chat-list">
      <li v-for="chat in filtered" :key="chat._id" class="chat-item">
        <NuxtLink
          :to="{ name: 'chat-id', params: { id: chat._id } }"
          class="chat-link"
        >
          <div class="avatar" :data-initial="(otherOf(chat)?.nombre || '?')[0]">
            <img
              v-if="otherOf(chat)?.foto"
              :src="otherOf(chat)?.foto"
              :alt="`Foto de ${otherOf(chat)?.nombre}`"
              loading="lazy"
            />
            <Icon v-else name="solar:user-circle-bold" size="48px" />
          </div>

          <div class="meta">
            <div class="row">
              <span class="name">{{ otherOf(chat)?.nombre || "Usuario" }}</span>
              <span class="time">{{
                formatTime(chat.updatedAt || chat.createdAt)
              }}</span>
            </div>
            <span class="preview" :title="chat.lastMessage || ''">
              {{ chat.lastMessage || "…" }}
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>

<style scoped>
:root {
  --surface: var(--black, #000);
  --surface-2: var(--black-soft, #121212);
  --text: var(--white, #fff);
  --muted: var(--white-mute, #a9a9a9);
  --divider: rgba(255, 255, 255, 0.08);
  --accent: var(--yellow, #ffd166);
  --accent-2: var(--green, #06d6a0);
  --radius: 16px;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.view {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--surface);
  color: var(--text);
}

.bar {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 12px 14px 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.86), rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--divider);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}
.title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.search {
  display: grid;
  width: 100%;
  grid-template-columns: 24px 1fr;
  gap: 6px;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 6px 10px;
}
.search input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
}
.search input::placeholder {
  color: var(--muted);
}

.chat-list {
  margin: 0;
  padding: 6px 6px 12px;
  list-style: none;
  overflow-y: auto;
}
.chat-item {
  border-bottom: 1px solid var(--divider);
}
.chat-link {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 8px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease, transform 0.06s ease;
}
.chat-link:hover {
  background: rgba(255, 255, 255, 0.03);
}
.chat-link:active {
  transform: translateY(1px);
}

.avatar {
  height: 52px;
  width: 52px;
  border-radius: 50%;
  background: radial-gradient(
    120% 120% at 30% 30%,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid var(--divider);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.avatar img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.avatar::after {
  content: attr(data-initial);
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
}

.meta {
  min-width: 0;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 8px;
}
.name {
  font-weight: 700;
  font-size: 0.98rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  color: var(--muted);
  font-size: 0.78rem;
  white-space: nowrap;
}
.preview {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  height: 100%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  text-align: center;
  padding: 24px;
}
.empty-badge {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--divider);
  box-shadow: var(--shadow);
}
.empty-title {
  font-weight: 800;
  margin: 6px 0 0;
}
.empty-sub {
  color: var(--muted);
  margin: 0;
}

.loading .avatar {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  box-shadow: none;
}
.skel {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}
.skel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.12),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 1.2s infinite;
}
.skel-text {
  height: 14px;
  border-radius: 6px;
  width: 70%;
  display: block;
}
.skel-chip {
  height: 12px;
  border-radius: 999px;
  width: 48px;
  display: block;
}
.loading .meta {
  width: 100%;
}
.loading .row {
  grid-template-columns: 1fr 60px;
}
.loading .preview {
  display: block;
  margin-top: 6px;
  height: 12px;
  border-radius: 6px;
  width: 90%;
  background: rgba(255, 255, 255, 0.08);
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
