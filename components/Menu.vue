<script setup>
// Icono de menu presionado
let itemPressed = ref("index");
</script>

<template>
  <footer>
    <nav id="navbar">
      <ul id="nav-list">
        <!-- Index -->
        <li class="nav-item">
          <NuxtLink to="/main" @click="itemPressed = 'index'">
            <Icon
              :name="itemPressed == 'index' ? 'bi:eye-fill' : 'bi:eye'"
              size="2.5em"
            ></Icon>
          </NuxtLink>
        </li>
        <!-- Chat -->
        <li class="nav-item">
          <NuxtLink to="/chats" @click="itemPressed = 'chat'">
            <Icon
              :name="
                itemPressed == 'chat'
                  ? 'mingcute:message-3-fill'
                  : 'mingcute:message-3-line'
              "
              size="2.5em"
            ></Icon>
          </NuxtLink>
        </li>
        <!-- XXO -->
        <li class="nav-item" virtual>
          <NuxtLink to="/xxo" @click="itemPressed = 'virtual'">
            <Icon
              :name="
                itemPressed == 'virtual'
                  ? 'streamline:virtual-reality-solid'
                  : 'streamline:virtual-reality'
              "
              size="2.5em"
            ></Icon>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </footer>
</template>

<style scoped>
/* CSS de Footer en main.css */
#navbar {
  display: flex;
  height: 10vh;
  justify-content: center;
}
#nav-list {
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 70px;
  list-style-type: none;
  align-self: center;
}
.nav-item {
  display: inline-grid;
}
.nav-item > a {
  color: white;
}
</style>
