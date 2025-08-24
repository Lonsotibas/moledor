<script setup lang="ts">
const props = defineProps<{
  user;
  userImg?: string;
  isVisible: boolean;
}>();

const emit = defineEmits<{
  (e: "closed"): void;
}>();

const { currentUser } = useUserData();

const chatId = ref<string>("");
const pending = ref(false);
const errorMsg = ref<string>("");
const closeBtn = ref<HTMLButtonElement | null>(null);

const titleId = computed(
  () => `user-modal-title-${props.user?._id ?? "unknown"}`
);

async function openOrCreateChat() {
  if (pending.value) return;
  errorMsg.value = "";
  pending.value = true;

  try {
    const me = currentUser.value?._id;
    const other = props.user?._id;
    console.log(me);
    console.log(props.user);
    if (!me || !other) throw new Error("Faltan identificadores de usuario.");

    const res = await $fetch<{ _id: string } | null>(
      `/api/chat/${other}/${me}`
    );
    if (res?._id) {
      chatId.value = res._id;
    } else {
      const chat = await $fetch<{ _id: string }>("/api/chat", {
        method: "post",
        body: { currentUserId: me, otherUserId: other },
      });
      chatId.value = chat._id;

      await $fetch("/api/user/addChat", {
        method: "patch",
        body: { usersId: [me, other], chatId: chatId.value },
      });
    }

    navigateTo(`/chat/${chatId.value}`);
  } catch (err: any) {
    errorMsg.value = err?.message || "No se pudo abrir el chat.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        class="overlay"
        @click.self="emit('closed')"
        role="presentation"
      >
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <header class="panel-header">
            <div class="brand">
              <Icon size="24px" name="solar:fire-minimalistic-outline" />
              <span class="sr-only">Perfil de usuario</span>
            </div>

            <div class="status" aria-live="polite">
              <Icon color="green" name="ri:checkbox-blank-circle-fill" />
              <span>Conectado</span>
            </div>

            <div class="actions">
              <button class="icon-btn" type="button" aria-label="Bloquear">
                <Icon size="24px" name="ri:prohibited-2-line" />
              </button>
              <button
                ref="closeBtn"
                class="icon-btn"
                type="button"
                aria-label="Cerrar"
                @click="emit('closed')"
              >
                <Icon size="24px" name="ri:close-circle-line" />
              </button>
            </div>
          </header>

          <!-- Body -->
          <section class="panel-body">
            <!-- Foto -->
            <div class="user-img">
              <img
                :src="userImg"
                :alt="`Foto de ${props.user?.nombre || 'usuario'}`"
                loading="lazy"
              />
              <button
                class="chat-fab"
                type="button"
                :aria-busy="pending"
                :disabled="pending"
                @click="openOrCreateChat"
              >
                <Icon
                  v-if="!pending"
                  class="chat-icon"
                  size="28px"
                  name="ph:chat"
                />
                <span v-else class="spinner" aria-hidden="true"></span>
                <span class="sr-only">Abrir chat</span>
              </button>
            </div>

            <!-- Detalles -->
            <div class="user-props">
              <div id="user-general-info" class="general">
                <h2 :id="titleId" class="name">
                  {{ props.user?.nombre || "Usuario" }}
                </h2>
                <span v-if="props.user?.pronombre" class="pronoun">
                  {{ props.user.pronombre }}
                </span>
                <span v-if="props.user?.edad" class="age">
                  {{ props.user.edad }}
                </span>
              </div>

              <!-- Acerca de mí -->
              <div id="user-about" class="about">
                <span class="section-title">Acerca de mí</span>
                <p class="about-text" v-if="props.user?.acerca">
                  {{ props.user.acerca }}
                </p>
                <p class="about-text muted" v-else>No hay descripción.</p>
              </div>

              <!-- Descripción -->
              <span class="section-title">Descripción</span>

              <div class="row">
                <div class="item" v-if="props.user?.genero">
                  <Icon size="16px" name="material-symbols-light:transgender" />
                  <span>{{ props.user.genero }}</span>
                </div>

                <div
                  class="item"
                  v-if="
                    props.user?.medidas?.estatura || props.user?.medidas?.peso
                  "
                >
                  <Icon size="16px" name="ri:ruler-line" />
                  <span v-if="props.user?.medidas?.estatura"
                    >{{ props.user.medidas?.estatura }} m</span
                  >
                  <span v-if="props.user?.medidas?.peso"
                    >&nbsp;•&nbsp;{{ props.user.medidas?.peso }} kg</span
                  >
                </div>

                <div class="item" v-if="props.user?.rol">
                  <Icon
                    size="16px"
                    name="material-symbols-light:circles-ext-outline"
                  />
                  <span>{{ props.user.rol }}</span>
                </div>

                <div class="item" v-if="props.user?.etnia">
                  <Icon size="16px" name="mdi:account-group-outline" />
                  <span>{{ props.user.etnia }}</span>
                </div>

                <div class="item" v-if="props.user?.estadoCivil">
                  <Icon size="16px" name="clarity:users-line" />
                  <span>{{ props.user.estadoCivil }}</span>
                </div>
              </div>

              <!-- Intereses -->
              <div v-if="props.user?.intereses?.length">
                <span class="section-title">Intereses</span>
                <div class="chips">
                  <span
                    v-for="(it, i) in props.user.intereses"
                    :key="i"
                    class="chip"
                    >{{ it }}</span
                  >
                </div>
              </div>

              <!-- Error -->
              <p v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</p>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: end;
}

.panel {
  width: 100%;
  height: 100%;
  background: var(--black);
  color: var(--white);
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
}

@media (min-width: 920px) {
  .overlay {
    place-items: center;
    padding: 24px;
  }
  .panel {
    max-width: 920px;
    max-height: 92vh;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}

/* --- Header --- */
.panel-header {
  height: 56px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 12px;
  background: var(--black);
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid var(--white-mute);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--white);
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
}
.icon-btn:focus-visible {
  outline: 2px solid var(--white-mute);
  outline-offset: 2px;
}

/* --- Body --- */
.panel-body {
  display: grid;
  grid-template-columns: 1fr;
  overflow: auto;
}

@media (min-width: 920px) {
  .panel-body {
    grid-template-columns: 1.1fr 1fr;
  }
}

/* Foto */
.user-img {
  position: relative;
  height: 60vh;
  background: var(--black);
}
.user-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--black);
}

.chat-fab {
  position: absolute;
  right: 12px;
  bottom: 12px;
  height: 56px;
  width: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.72);
  color: var(--white);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.chat-fab:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.chat-icon {
  pointer-events: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--white-mute);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.user-props {
  background: var(--black);
  color: var(--white);
  font-size: 0.95rem;
  padding: 12px 14px 24px;
}

.general {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}
.pronoun {
  font-style: italic;
  opacity: 0.9;
}
.age {
  color: gray;
  font-size: 1.3rem;
  font-weight: 300;
}

.about {
  margin-top: 14px;
}
.section-title {
  display: block;
  margin: 14px 0 8px;
  color: var(--white-soft);
  font-weight: 600;
}
.about-text {
  background: var(--black-soft);
  border: 1px solid var(--white-mute);
  border-radius: 12px;
  padding: 10px 12px;
  line-height: 1.4;
  box-shadow: 2px 2px var(--white-mute);
  white-space: pre-wrap;
}
.about-text.muted {
  opacity: 0.7;
  box-shadow: none;
}

.row {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}
@media (min-width: 520px) {
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--white);
  opacity: 0.95;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  background: var(--black-soft);
  border: 1px solid var(--white-mute);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
}

/* Error */
.error {
  color: #ff6961;
  margin-top: 10px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
