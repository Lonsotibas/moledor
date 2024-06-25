<script setup lang="ts">
let users = createUsers();
let isVisible = ref(false);
let userSelected = ref({});
</script>

<template>
  <main class="view">
    <div class="gallery">
      <div
        class="card"
        v-for="user in users"
        @click="
          isVisible = !isVisible;
          userSelected = user;
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
