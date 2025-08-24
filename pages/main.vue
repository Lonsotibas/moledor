<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";

import image1 from "~/assets/img/1.png";
import image2 from "~/assets/img/2.png";
import image3 from "~/assets/img/3.png";
import image4 from "~/assets/img/4.png";
import image5 from "~/assets/img/5.png";
import image6 from "~/assets/img/6.png";
import image7 from "~/assets/img/7.png";
import image8 from "~/assets/img/8.png";
import image9 from "~/assets/img/9.png";
import image10 from "~/assets/img/10.png";
import image11 from "~/assets/img/11.png";
import image12 from "~/assets/img/12.png";
import image13 from "~/assets/img/13.png";
import image14 from "~/assets/img/14.png";
import image15 from "~/assets/img/15.png";
import image16 from "~/assets/img/16.png";
import image17 from "~/assets/img/17.png";
import image18 from "~/assets/img/18.png";
import image19 from "~/assets/img/19.png";
import image20 from "~/assets/img/20.png";
import image21 from "~/assets/img/21.png";
import image22 from "~/assets/img/22.png";
import image23 from "~/assets/img/23.png";
import image24 from "~/assets/img/24.png";
import image25 from "~/assets/img/25.png";

const images = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
  image23,
  image24,
  image25,
];

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
  padding-top: 3.25rem;
}

.gallery {
  height: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
  padding: 6px;
}

.card {
  position: relative;
  display: block;
  border: 0;
  padding: 0;
  margin: 0;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1 / 1.15;
  -webkit-tap-highlight-color: transparent;
}

.card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fff2, 0 0 0 4px #000a;
  border-radius: 12px;
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
  padding: 8px 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  text-align: left;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
}
</style>
