<script setup lang="ts">
const emit = defineEmits(["showMenu"]);
const { currentUser } = useUserData();
let indexCurrentUser: Number;

let users = await $fetch("/api/users");
users.map((obj, index) => {
  if (obj._id == currentUser.value?._id) {
    indexCurrentUser = index;
  }
});
users.splice(indexCurrentUser, 1);
let isVisible = ref(false);
let userSelected = ref({});

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
        v-for="user in users"
        @click="
          isVisible = !isVisible;
          userSelected = user;
          emit('showMenu', false);
        "
      >
        <span>{{ user.nombre }}</span>
        <Icon size="80px" name="solar:user-circle-bold" />
      </div>
      <UserModal
        v-if="isVisible"
        :user="userSelected"
        @closed="isVisible = !isVisible"
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
  margin: 2px;
  height: 14vh;
  margin: 0;
  position: relative;
  display: flex;
  justify-content: center;
}

.card span {
  color: var(--color-text);
  font-size: 0.9em;
  position: absolute;
  bottom: 5px;
  left: 5px;
}
</style>
