<script setup>
const props = defineProps(["user", "isVisible"]);
const emit = defineEmits(["closed"]);
</script>

<template>
  <!-- Modal -->
  <div class="modal">
    <!-- Modal: Header -->
    <div class="modal-header">
      <Icon size="30px" name="ri:heart-add-2-line" />
      <span id="user-status">Conectado</span>
      <div class="opt-btns">
        <Icon size="30px" name="ri:prohibited-2-line" />
        <Icon size="30px" name="ri:close-circle-line" @click="emit('closed')" />
      </div>
    </div>
    <!-- Modal: Body -->
    <div class="modal-body">
      <!-- Usuario: Foto -->
      <div class="user-img"></div>
      <div class="user-props">
        <!-- Usuario: Informacion General -->
        <div>
          <span id="user-name">{{ props.user.nombre }}</span>
          <span id="user-pronoun">{{ props.user.pronombre }}</span>
        </div>
        <div>
          <span id="user-distance">0m de distancia</span>
        </div>
        <div id="user-about">
          <span id="about-title">Acerca de mi</span>
          <textarea id="about-text">
Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore aut minima in unde temporibus necessitatibus impedit provident aperiam voluptatem dolorum. Nihil magnam autem commodi inventore illo dolor ad suscipit ipsam.</textarea
          >
        </div>
        <!-- Usuario: Informacion Especifica -->
        <div>
          <span>{{ props.user.medidas.estatura }}m</span>
          <span>{{ props.user.medidas.peso }}kg</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal: Estilo General */
.modal {
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 100%;
  background-color: black;
}
.modal-header {
  background-color: var(--black);
  width: 100%;
  height: 5vh;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
}
.modal-body {
  margin-top: 5vh;
}
/* Modal: Estilo Informacion de Usuario */
/* Usuario: Foto */
.user-img {
  position: sticky;
  background-color: var(--black-mute);
  height: 65vh;
}
/* Usuario: Informacion General */
.user-props {
  color: var(--white);
  font-size: 0.9em;
  padding: 0 10px;
  font-weight: 400;
}
#user-name {
  font-size: 1.4rem;
  font-weight: 600;
}
#user-pronoun {
  margin-left: 4px;
  font-style: italic;
}
#user-about {
  margin-top: 15px;
}
#about-title {
  display: block;
}
#about-text {
  font-size: 0.8em;
  color: var(--white);
  background-color: var(--black-soft);
  width: 100%;
  height: 15vh;
  border-radius: 15px;
  border-color: var(--white-mute);
  box-shadow: 2px 2px var(--white-mute);
}
/* Usuario: Informacion Especifica */
</style>
