<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";

const imageModules = import.meta.glob<string>("../assets/img/*.png", {
  eager: true,
  import: "default",
});
const images = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src);

const emit = defineEmits<{
  (e: "showMenu", value: boolean): void;
}>();

const { currentUser } = useUserData();

const { data: usersData } = await useFetch("/api/users", {
  default: () => [],
});

const users = computed(() => {
  const list = usersData.value ?? [];
  const me = currentUser.value?._id;
  return me ? list.filter((u) => u._id !== me) : list;
});

function imageFor(user, idx: number) {
  const first = user.photos?.[0];
  return first && typeof first === "string" && first.trim().length
    ? first
    : images[idx % images.length];
}

const isVisible = ref(false);
const userSelected = ref("");
const userSelectedImg = ref<string | null>(null);

function openCard(user, idx: number) {
  isVisible.value = true;
  userSelected.value = user;
  userSelectedImg.value = imageFor(user, idx);
  emit("showMenu", false);
}
function closeModal() {
  isVisible.value = false;
  emit("showMenu", true);
}

onBeforeMount(() => {
  emit("showMenu", true);
});
</script>

<template>
  <main class="view">
    <Header v-if="!isVisible" />

    <div class="gallery" role="list" aria-label="Lista de perfiles">
      <button
        v-for="(user, index) in users"
        :key="user._id"
        class="card"
        role="listitem"
        type="button"
        @click="openCard(user, index)"
      >
        <img
          class="photo"
          :src="imageFor(user, index)"
          :alt="`Foto de ${user.nombre}`"
          loading="lazy"
          decoding="async"
        />
        <span class="name">{{ user.nombre }}</span>
      </button>
    </div>
    <Teleport to="body">
      <UserModal
        v-if="isVisible"
        :isVisible="isVisible"
        :user="userSelected"
        :userImg="userSelectedImg"
        @closed="closeModal"
      />
    </Teleport>
  </main>
</template>

<style scoped>
.view {
  position: fixed;
  inset: 0;
  padding-top: calc(56px + env(safe-area-inset-top));
  background: var(--black);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gallery {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: calc((100vw - 12px) / 3);
  gap: 3px;
  padding: 3px;
  padding-bottom: calc(90px + env(safe-area-inset-bottom));
  align-content: start;
  scrollbar-width: none;
}

.gallery::-webkit-scrollbar {
  display: none;
}

.card {
  position: relative;
  display: block;
  border: 0;
  padding: 0;
  margin: 0;
  background: var(--black-soft);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.card:focus-visible {
  outline: 2px solid var(--yellow);
  outline-offset: -2px;
}

.card:active {
  opacity: 0.85;
}

.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px 7px 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
