<script setup lang="ts">
const { queue, dismiss } = useNotif();
const router = useRouter();

function open(chatId: string, id: number) {
  dismiss(id);
  router.push({ name: "chat-id", params: { id: chatId } });
}
</script>

<template>
  <TransitionGroup name="notif" tag="div" class="notif-container">
    <div
      v-for="toast in queue"
      :key="toast.id"
      class="notif"
      role="alert"
      @click="open(toast.chatId, toast.id)"
    >
      <div class="notif-icon">
        <img v-if="toast.photo" :src="toast.photo" class="notif-avatar" alt="" />
        <Icon v-else name="solar:user-circle-bold" size="22px" />
      </div>
      <div class="notif-body">
        <span class="notif-name">{{ toast.name }}</span>
        <span class="notif-text">{{ toast.text }}</span>
      </div>
      <button
        class="notif-close"
        aria-label="Cerrar"
        @click.stop="dismiss(toast.id)"
      >
        <Icon name="ion:close" size="16px" />
      </button>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.notif-container {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(92vw, 360px);
  pointer-events: none;
}

.notif {
  display: grid;
  grid-template-columns: 36px 1fr 28px;
  align-items: center;
  gap: 10px;
  padding: 12px 10px 12px 14px;
  background: #1c1b20;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  pointer-events: all;
  transition: transform 0.1s ease, opacity 0.1s ease;
}
.notif:active {
  transform: scale(0.98);
}

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 188, 66, 0.12);
  border: 1px solid rgba(255, 188, 66, 0.2);
  display: grid;
  place-items: center;
  color: var(--yellow, #ffbc42);
  flex-shrink: 0;
  overflow: hidden;
}
.notif-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.notif-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.notif-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-text {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.notif-enter-active {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease;
}
.notif-leave-active {
  transition: transform 0.2s ease, opacity 0.18s ease;
}
.notif-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.notif-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
.notif-move {
  transition: transform 0.22s ease;
}
</style>
