<template>
  <nav class="navbar">
    <Icon size="30px" name="solar:user-circle-bold" />
    <Icon size="30px" name="solar:fire-minimalistic-bold" />
  </nav>
</template>

<style scoped>
.navbar {
  z-index: 2;
  position: fixed;
  top: 0;
  overflow: hidden;
  width: 100%;
  height: 3em;
  background-color: var(--black);
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
}
</style>
