<script setup lang="ts">
const { currentUser } = useUserData();
onBeforeMount(() => {
  if (!currentUser.value) {
    navigateTo("/");
  }
});
</script>

<template>
  <div id="app">
    <NuxtPage />
    <Menu v-if="currentUser != null" />
  </div>
</template>
