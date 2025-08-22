<script setup lang="ts">
const { currentUser, setUserData } = useUserData();

const submenu = ref(false);

const logout = () => {
  setUserData(null);

  navigateTo("/");
};
</script>

<template>
  <div>
    <nav class="navbar">
      <Icon
        v-if="currentUser"
        class="user-photo"
        size="40px"
        name="solar:user-circle-bold"
        @click="submenu = !submenu"
      />
      <Icon size="30px" name="solar:fire-minimalistic-bold" />
      <div v-if="submenu" class="submenu">
        <ul class="submenu-list">
          <li class="submenu-item">
            <Icon @click="logout" name="solar:settings-linear" />
            <span class="submenu-title"> Configuracion </span>
          </li>
          <li class="submenu-item">
            <Icon @click="logout" name="solar:logout-3-line-duotone" />
            <span class="submenu-title">Cerrar Sesion</span>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style scoped>
div {
  position: absolute;
  height: 100vh;
  width: 100%;
  top: 0;
}
.navbar {
  z-index: 2;
  position: flex;
  top: 0;
  overflow: hidden;
  width: 100%;
  height: 3em;
  background-color: var(--black);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
}
.submenu {
  background: var(--black);
  position: absolute;
  height: 200px;
  top: 6vh;
  left: 0;
  z-index: 1000000;
}
.submenu-list {
  padding: 5px;
}
.submenu-item {
  margin-bottom: 5px;
  display: flex;
  justify-content: start;
  align-items: center;
}
.submenu-item .icon {
  font-size: 30px;
}
.submenu-title {
  margin-left: 0.5em;
}
</style>
