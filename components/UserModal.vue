<script setup lang="ts">
const props = defineProps(["user", "userImg", "isVisible"]);
const emit = defineEmits(["closed"]);
const { currentUser } = useUserData();
const chatId = ref("");

const chatExist = async () => {
  const res = await $fetch(
    `/api/chat/${props.user._id}/${currentUser.value._id}`
  );
  if (!res) {
    startChat();
    return;
  }
  chatId.value = res._id;
  navigateTo(`/chat/${chatId.value}`);
};

const startChat = async () => {
  // Crea Chat
  const chat = await $fetch("/api/chat", {
    method: "post",
    body: {
      currentUserId: currentUser.value._id,
      otherUserId: props.user._id,
    },
  });
  chatId.value = chat._id;
  // Agrega chatId a usuarios
  const user = await $fetch("/api/user/addChat", {
    method: "patch",
    body: {
      usersId: [currentUser.value._id, props.user._id],
      chatId: chatId.value,
    },
  });
  navigateTo(`/chat/${chatId.value}`);
};
</script>

<template>
  <!-- Modal -->
  <div class="modal">
    <!-- Modal: Header -->
    <div class="modal-header">
      <Icon size="30px" name="solar:fire-minimalistic-outline" />
      <!-- Status -->
      <div id="user-status">
        <Icon color="green" name="ri:checkbox-blank-circle-fill" />
        <span>Conectado</span>
      </div>
      <!-- Modal: Opciones -->
      <div class="opt-btns">
        <Icon size="30px" name="ri:prohibited-2-line" />
        <Icon size="30px" name="ri:close-circle-line" @click="emit('closed')" />
      </div>
    </div>
    <!-- Modal: Body -->
    <div class="modal-body">
      <!-- Usuario: Foto -->
      <div class="user-img">
        <img :src="userImg" alt="" />
        <NuxtLink @click="chatExist()">
          <Icon class="chat-icon" size="40px" name="ph:chat" />
        </NuxtLink>
      </div>
      <div class="user-props">
        <!-- Usuario: Informacion General -->
        <div id="user-general-info">
          <!-- Nombre -->
          <span id="user-name">{{ props.user.nombre }}</span>
          <!-- Pronombre -->
          <span id="user-pronoun">{{ props.user.pronombre }}</span>
          <!-- Edad -->
          <span id="user-age">{{ props.user.edad }}</span>
        </div>
        <!-- Distancia -->
        <!-- <div id="user-distance"> -->
        <!--   <span>0m de distancia</span> -->
        <!-- </div> -->
        <!-- Acerca de mi -->
        <div id="user-about">
          <span class="modal-subtitle">Acerca de mi</span>
          <textarea class="about-text">
              {{ props.user.acerca }}
          </textarea>
        </div>
        <!-- Usuario: Informacion Especifica -->
        <span class="modal-subtitle">Descripcion</span>
        <!-- Genero -->
        <div id="user-gender">
          <Icon size="14px" name="material-symbols-light:transgender" />
          <span>
            {{ props.user.genero }}
          </span>
        </div>
        <!-- Medidas -->
        <div>
          <!-- Estatura -->
          <span id="user-height" v-if="props.user.medidas.estatura">
            <Icon size="14px" name="ri:ruler-line" />
            {{ props.user.medidas?.estatura }}m
          </span>
          <!-- Peso -->
          <span id="user-weight" v-if="props.user.medidas.peso">
            |
            <Icon size="14px" name="ri:weight-line" />
            {{ props.user.medidas?.peso }}kg
          </span>
        </div>
        <!-- Rol -->
        <div>
          <Icon size="14px" name="material-symbols-light:circles-ext-outline" />
          <span>
            {{ props.user.rol }}
          </span>
        </div>
        <!-- Etnia -->
        <div>
          <span>
            {{ props.user.etnia }}
          </span>
        </div>
        <!-- Estado Civil -->
        <div>
          <Icon size="14px" name="clarity:users-line" />
          <span>
            {{ props.user.estadoCivil }}
          </span>
        </div>
        <!-- Intereses -->
        <span class="modal-subtitle">Intereses</span>
        <div></div>
        <!-- Salud -->
        <span class="modal-subtitle">Salud</span>
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
  background-color: var(--black);
}
.modal-header {
  background-color: var(--black);
  width: 100%;
  height: 3em;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
}
#user-status {
  display: flex;
  align-items: center;
}
#user-status > svg {
  margin-right: 3px;
}
.modal-subtitle {
  display: block;
  margin-bottom: 10px;
  color: var(--white-soft);
}

/* Modal: Informacion de Usuario */
/* Usuario: Foto */
.user-img {
  position: sticky;
  background-color: var(--black);
  height: 65vh;
}
.user-img img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
.chat-icon {
  padding: 5px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  bottom: 10px;
  right: 10px;
  height: 50px;
  width: 50px;
}
/* Usuario: Informacion General */
.user-props {
  background-color: var(--black);
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
#user-age {
  color: gray;
  margin-left: 8px;
  font-size: 1.7em;
  font-weight: 100;
}
#user-about {
  margin-top: 15px;
}
#user-about textarea {
  width: 80%;
}
#about-title {
  display: block;
}
#about-text {
  font-size: 0.9em;
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
