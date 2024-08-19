<script setup lang="ts">
const users = await $fetch("/api/users");
</script>

<template>
  <main class="view">
    <ul class="chat-list">
      <li v-for="(user, index) in users">
        <NuxtLink
          :to="{ name: 'chat-id', params: { id: user._id } }"
          class="chat-preview"
        >
          <Icon class="user-photo" size="80px" name="solar:user-circle-bold" />
          <div class="user-name">{{ user.nombre }}</div>
          <div class="last-message">Ultimo mensaje enviado...</div>
          <div v-if="index < users.length - 1" class="divider"></div>
        </NuxtLink>
      </li>
    </ul>
  </main>
  <NuxtPage />
</template>

<style scoped>
.chat-list {
  list-style: none;
  padding: 0 5px;
}
.chat-preview {
  width: 98vw;
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: center;
}
.user-photo {
  grid-column: 1;
  grid-row: 1/3;
}
.user-name {
  font-weight: 600;
  grid-column: 2;
  grid-row: 1;
}
.last-message {
  color: gray;
  grid-column: 2;
  grid-row: 2;
}
.divider {
  margin: 10px 0;
  grid-column: 1/3;
  background-color: gray;
  width: 100%;
  height: 1px;
}
</style>
