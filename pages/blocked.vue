<script setup lang="ts">
const emit = defineEmits<{ (e: "showMenu", value: boolean): void }>();
const { currentUser, setUserData } = useUserData();
const router = useRouter();

const blockedUsers = ref<any[]>([]);
const loading = ref(true);
const unblocking = ref<string | null>(null);

async function loadBlocked() {
  loading.value = true;
  try {
    const users = await $fetch<any[]>("/api/user/blocked", {
      query: { userId: currentUser.value?._id },
    });
    blockedUsers.value = users;
  } finally {
    loading.value = false;
  }
}

async function unblock(userId: string) {
  unblocking.value = userId;
  try {
    const updated = await $fetch("/api/user/unblock", {
      method: "patch",
      body: { userId: currentUser.value?._id, otherUserId: userId },
    });
    setUserData(updated as any);
    blockedUsers.value = blockedUsers.value.filter((u) => u._id !== userId);
  } finally {
    unblocking.value = null;
  }
}

onBeforeMount(async () => {
  emit("showMenu", false);
  await loadBlocked();
});
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" type="button" @click="router.back()">
        <Icon name="solar:alt-arrow-left-bold" size="22px" />
      </button>
      <span class="topbar-title">Bloqueados</span>
      <span></span>
    </header>

    <div class="content">
      <div v-if="loading" class="empty">
        <div class="spinner"></div>
      </div>

      <div v-else-if="blockedUsers.length === 0" class="empty">
        <Icon name="solar:user-block-rounded-bold-duotone" size="40px" class="empty-icon" />
        <p class="empty-title">Sin usuarios bloqueados</p>
        <p class="empty-sub">Aquí aparecerán los usuarios que bloquees.</p>
      </div>

      <ul v-else class="list">
        <li v-for="user in blockedUsers" :key="user._id" class="item">
          <div class="avatar">
            <img
              v-if="user.photos?.[0]"
              :src="user.photos[0]"
              :alt="user.nombre"
              class="avatar-img"
            />
            <Icon v-else name="solar:user-circle-bold" size="36px" />
          </div>
          <span class="name">{{ user.nombre }}</span>
          <button
            class="unblock-btn"
            :disabled="unblocking === user._id"
            @click="unblock(user._id)"
          >
            {{ unblocking === user._id ? "…" : "Desbloquear" }}
          </button>
        </li>
      </ul>
    </div>
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
.back-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}
.back-btn:active {
  transform: translateY(1px);
}

.topbar-title {
  text-align: center;
  font-weight: 800;
  font-size: 1rem;
  color: var(--yellow);
}

.content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 12px 14px;
}
.content::-webkit-scrollbar {
  display: none;
}

.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 40px 24px;
}
.empty-icon {
  opacity: 0.35;
}
.empty-title {
  font-weight: 800;
  margin: 0;
}
.empty-sub {
  color: var(--gray);
  font-size: 0.88rem;
  margin: 0;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--yellow);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  font-weight: 600;
  font-size: 0.97rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unblock-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--white);
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.unblock-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}
.unblock-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
