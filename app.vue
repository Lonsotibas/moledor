<script setup lang="ts">
const { currentUser } = useUserData();
const showMenu = ref(false);

onBeforeMount(() => {
  if (!currentUser.value) {
    showMenu.value = false;
    navigateTo("/");
  }
});
</script>

<template>
  <div id="app">
    <NuxtPage
      @showMenu="
        (show: Boolean) => {
          showMenu = show;
        }
      "
    />
    <Menu v-if="showMenu" />
  </div>
</template>
