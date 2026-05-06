<script setup lang="ts">
import { socket } from "~/components/socket.ts";

const emit = defineEmits<{ (e: "showMenu", value: boolean): void }>();
const { currentUser, setUserData } = useUserData();
const router = useRouter();

type FireUser = { _id: string; nombre?: string; photos?: string[]; isMutual?: boolean };

const tab = ref<"received" | "sent">("received");
const received = ref<FireUser[]>([]);
const sent = ref<FireUser[]>([]);
const loading = ref(true);
const unfiringId = ref<string | null>(null);
const firingId = ref<string | null>(null);
const chattingId = ref<string | null>(null);

const isModalVisible = ref(false);
const selectedUser = ref<any>(null);
const selectedUserImg = ref<string | null>(null);

async function openModal(user: FireUser) {
  const full = await $fetch<any>(`/api/user/${user._id}`).catch(() => null);
  selectedUser.value = full ?? user;
  selectedUserImg.value = user.photos?.[0] ?? null;
  isModalVisible.value = true;
}

async function load() {
  loading.value = true;
  try {
    const [r, s] = await Promise.all([
      $fetch<FireUser[]>("/api/user/firedBy", { query: { userId: currentUser.value?._id } }),
      $fetch<FireUser[]>("/api/user/fires", { query: { userId: currentUser.value?._id } }),
    ]);
    received.value = r;
    sent.value = s;
  } finally {
    loading.value = false;
  }
}

async function openChat(userId: string) {
  if (chattingId.value) return;
  chattingId.value = userId;
  try {
    const me = currentUser.value?._id;
    const res = await $fetch<{ _id: string } | null>(`/api/chat/${userId}/${me}`);
    let id: string;
    if (res?._id) {
      id = res._id;
    } else {
      const chat = await $fetch<{ _id: string }>("/api/chat", {
        method: "post",
        body: { currentUserId: me, otherUserId: userId },
      });
      id = chat._id;
      await $fetch("/api/user/addChat", {
        method: "patch",
        body: { usersId: [me, userId], chatId: id },
      });
    }
    router.push(`/chat/${id}`);
  } finally {
    chattingId.value = null;
  }
}

async function toggleFireReceived(userId: string) {
  if (firingId.value) return;
  firingId.value = userId;
  try {
    const res = await $fetch<{ fired: boolean; isMutual: boolean; user: any }>(
      "/api/user/fire",
      { method: "post", body: { userId: currentUser.value?._id, otherUserId: userId } }
    );
    setUserData(res.user);
    received.value = received.value.map((u) =>
      u._id === userId ? { ...u, isMutual: res.isMutual } : u
    );
    if (res.fired) {
      socket.emit("fire", {
        toUserId: userId,
        fromUserId: currentUser.value?._id,
        fromName: currentUser.value?.nombre,
        fromPhoto: (currentUser.value as any)?.photos?.[0] ?? null,
        isMutual: res.isMutual,
      });
      if (res.isMutual) {
        const u = sent.value.find((u) => u._id === userId);
        if (!u) sent.value.push(received.value.find((u) => u._id === userId)!);
      } else {
        sent.value.push(received.value.find((u) => u._id === userId)!);
      }
    } else {
      sent.value = sent.value.filter((u) => u._id !== userId);
    }
  } finally {
    firingId.value = null;
  }
}

async function unfire(userId: string) {
  unfiringId.value = userId;
  try {
    const res = await $fetch<{ user: any }>("/api/user/fire", {
      method: "post",
      body: { userId: currentUser.value?._id, otherUserId: userId },
    });
    setUserData(res.user);
    sent.value = sent.value.filter((u) => u._id !== userId);
    received.value = received.value.map((u) =>
      u._id === userId ? { ...u, isMutual: false } : u
    );
  } finally {
    unfiringId.value = null;
  }
}

const list = computed(() => (tab.value === "received" ? received.value : sent.value));

function onFireSocket(data: any) {
  if (!data?.fromUserId) return;
  const existing = received.value.find((u) => u._id === data.fromUserId);
  if (existing) {
    existing.isMutual = data.isMutual;
  } else {
    received.value.unshift({
      _id: data.fromUserId,
      nombre: data.fromName,
      photos: data.fromPhoto ? [data.fromPhoto] : undefined,
      isMutual: data.isMutual,
    });
  }
}

onBeforeMount(async () => {
  emit("showMenu", false);
  await load();
});

onMounted(() => {
  socket.on("fire", onFireSocket);
});

onUnmounted(() => {
  socket.off("fire", onFireSocket);
});
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" type="button" @click="router.back()">
        <Icon name="solar:alt-arrow-left-bold" size="22px" />
      </button>
      <span class="topbar-title">Fuegos</span>
      <span></span>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: tab === 'received' }"
        @click="tab = 'received'"
      >
        <Icon name="solar:fire-minimalistic-bold" size="16px" />
        Te han dado
        <span v-if="received.length" class="tab-count">{{ received.length }}</span>
      </button>
      <button
        class="tab"
        :class="{ active: tab === 'sent' }"
        @click="tab = 'sent'"
      >
        <Icon name="solar:fire-minimalistic-outline" size="16px" />
        Has dado
        <span v-if="sent.length" class="tab-count">{{ sent.length }}</span>
      </button>
    </div>

    <!-- Content -->
    <div class="content">
      <div v-if="loading" class="empty">
        <div class="spinner"></div>
      </div>

      <div v-else-if="list.length === 0" class="empty">
        <Icon name="solar:fire-minimalistic-bold" size="40px" class="empty-icon" />
        <p class="empty-title">
          {{ tab === "received" ? "Nadie te ha dado fuego aún" : "No has dado fuego a nadie" }}
        </p>
        <p class="empty-sub">
          {{ tab === "received" ? "Cuando alguien te dé fuego aparecerá aquí." : "Explora perfiles y da fuego a quien te guste." }}
        </p>
      </div>

      <ul v-else class="list">
        <li v-for="user in list" :key="user._id" class="item">
          <!-- Avatar + Info (clickable) -->
          <button class="user-btn" type="button" @click="openModal(user)">
            <div class="avatar" :class="{ match: user.isMutual }">
              <img
                v-if="user.photos?.[0]"
                :src="user.photos[0]"
                :alt="user.nombre"
                class="avatar-img"
              />
              <span v-else class="avatar-initial">
                {{ (user.nombre || "?")[0].toUpperCase() }}
              </span>
              <span v-if="user.isMutual" class="match-badge" aria-label="Match">🔥</span>
            </div>

            <div class="info">
              <span class="name">{{ user.nombre || "Usuario" }}</span>
              <span v-if="user.isMutual" class="match-label">¡Match!</span>
            </div>
          </button>

          <!-- Actions -->
          <div class="actions">
            <button
              v-if="user.isMutual"
              class="chat-btn"
              :disabled="chattingId === user._id"
              @click="openChat(user._id)"
            >
              <Icon v-if="chattingId !== user._id" name="ph:chat-fill" size="15px" />
              <span v-else class="spinner"></span>
            </button>
            <button
              v-if="tab === 'received'"
              class="fire-toggle"
              :class="{ fired: user.isMutual, pending: firingId === user._id }"
              :disabled="firingId === user._id"
              @click="toggleFireReceived(user._id)"
            >
              <Icon
                :name="user.isMutual ? 'solar:fire-minimalistic-bold' : 'solar:fire-minimalistic-outline'"
                size="20px"
              />
            </button>
            <button
              v-if="tab === 'sent'"
              class="fire-toggle fired"
              :class="{ unfiring: unfiringId === user._id }"
              :disabled="unfiringId === user._id"
              @click="unfire(user._id)"
            >
              <Icon name="solar:fire-minimalistic-bold" size="20px" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <UserModal
      v-if="isModalVisible"
      :isVisible="isModalVisible"
      :user="selectedUser"
      :userImg="selectedUserImg"
      @closed="isModalVisible = false"
    />
  </div>
</template>

<style scoped>
.page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--black);
  color: var(--white);
  overflow: hidden;
}

.topbar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding-top: env(safe-area-inset-top);
  height: calc(52px + env(safe-area-inset-top));
  padding-inline: 8px;
  background: var(--black);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
}
.back-btn {
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  color: var(--white);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background 0.15s;
}
.back-btn:hover { background: rgba(255, 255, 255, 0.06); }
.back-btn:active { transform: translateY(1px); }
.topbar-title {
  text-align: center;
  font-weight: 800;
  font-size: 1rem;
  color: var(--yellow);
}

/* Tabs */
.tabs {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}
.tab.active {
  color: var(--yellow, #ffbc42);
  border-bottom-color: var(--yellow, #ffbc42);
}
.tab-count {
  background: rgba(255, 188, 66, 0.15);
  color: var(--yellow, #ffbc42);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 8px 14px;
}
.content::-webkit-scrollbar { display: none; }

.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 48px 24px;
}
.empty-icon { opacity: 0.25; color: var(--yellow, #ffbc42); }
.empty-title { font-weight: 800; margin: 0; }
.empty-sub { color: rgba(255,255,255,0.4); font-size: 0.88rem; margin: 0; max-width: 240px; }

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--yellow, #ffbc42);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* List */
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  padding: 4px 0;
  border-radius: 10px;
  transition: opacity 0.12s;
}
.user-btn:active { opacity: 0.7; }

/* Avatar */
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: visible;
  background: linear-gradient(135deg, rgba(255,188,66,.2), rgba(6,214,160,.1));
  border: 1.5px solid rgba(255,255,255,.08);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  position: relative;
}
.avatar.match {
  border-color: var(--yellow, #ffbc42);
  box-shadow: 0 0 12px rgba(255, 188, 66, 0.35);
}
.avatar-img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-initial {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--yellow, #ffbc42);
}
.match-badge {
  position: absolute;
  bottom: -2px;
  right: -4px;
  font-size: 14px;
  line-height: 1;
}

/* Info */
.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.name {
  font-weight: 700;
  font-size: 0.97rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.match-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--yellow, #ffbc42);
  letter-spacing: 0.3px;
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--yellow, #ffbc42);
  color: var(--black, #121113);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.chat-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.chat-btn:active { opacity: 0.7; }

.chat-btn .spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: var(--black, #121113);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.fire-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s, filter 0.15s, transform 0.1s;
}
.fire-toggle.fired {
  color: var(--yellow, #ffbc42);
  filter: drop-shadow(0 0 6px rgba(255, 188, 66, 0.55));
}
.fire-toggle:active { transform: scale(0.88); }
.fire-toggle.unfiring,
.fire-toggle.pending { opacity: 0.4; cursor: not-allowed; }
.fire-toggle:not(.unfiring):not(.pending):hover {
  color: var(--yellow, #ffbc42);
  filter: drop-shadow(0 0 8px rgba(255, 188, 66, 0.6));
}
</style>
