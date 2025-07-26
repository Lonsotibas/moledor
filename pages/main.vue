<script setup lang="ts">
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
const emit = defineEmits(["showMenu"]);
const { currentUser } = useUserData();
let indexCurrentUser: Number;

let users = await $fetch("/api/users");
users.map((obj, index) => {
  if (obj._id === currentUser.value?._id) {
    indexCurrentUser = index;
    users.splice(indexCurrentUser, 1);
  }
});
let isVisible = ref(false);
let userSelected = ref({});
let userSelectedImg = ref(null);

onBeforeMount(() => {
  emit("showMenu", true);
});
</script>

<template>
  <main class="view">
    <Header v-if="!isVisible" />
    <div class="gallery">
      <div
        class="card"
        v-for="(user, index) in users"
        @click="
          isVisible = !isVisible;
          userSelected = user;
          userSelectedImg = images[index + 1];
          emit('showMenu', false);
        "
      >
        <span class="user-name">{{ user.nombre }}</span>
        <img :src="images[index + 1]" alt="" />
      </div>
      <UserModal
        v-if="isVisible"
        :user="userSelected"
        :userImg="userSelectedImg"
        @closed="
          isVisible = !isVisible;
          emit('showMenu', true);
        "
      />
    </div>
  </main>
</template>

<style scoped>
.view {
  padding-top: 3em;
}
.gallery {
  height: 100%;
  overflow-y: scroll;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.card {
  background-color: black;
  margin: 2px;
  height: 17vh;
  margin: 0;
  position: relative;
  display: flex;
  justify-content: center;
}

.card span {
  text-align: left;
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--color-text);
  font-size: 0.9em;
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
