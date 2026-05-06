<script setup lang="ts">
const props = defineProps<{
  user: any;
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

const titleId = computed(
  () => `user-modal-title-${props.user?._id ?? "unknown"}`
);

const hasDescription = computed(() =>
  !!(
    props.user?.genero ||
    props.user?.etnia ||
    props.user?.estadoCivil ||
    props.user?.medidas?.estatura ||
    props.user?.medidas?.peso
  )
);

const measureLabel = computed(() => {
  const parts = [
    props.user?.medidas?.estatura && `${props.user.medidas.estatura} cm`,
    props.user?.medidas?.peso && `${props.user.medidas.peso} kg`,
  ].filter(Boolean);
  return parts.join(" · ");
});

async function openOrCreateChat() {
  if (pending.value) return;
  errorMsg.value = "";
  pending.value = true;
  try {
    const me = currentUser.value?._id;
    const other = props.user?._id;
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
    <Transition name="slide-up">
      <div v-if="isVisible" class="overlay">
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- ── Hero photo ───────────────────────────── -->
          <div class="hero">
            <img
              class="hero-img"
              :src="userImg"
              :alt="`Foto de ${user?.nombre ?? 'usuario'}`"
            />

            <!-- Top bar -->
            <div class="top-bar">
              <Icon
                name="solar:fire-minimalistic-bold"
                size="22px"
                class="brand-icon"
              />
              <div class="top-actions">
                <button class="icon-btn" type="button" aria-label="Bloquear">
                  <Icon size="20px" name="ri:prohibited-2-line" />
                </button>
                <button
                  class="icon-btn"
                  type="button"
                  aria-label="Cerrar"
                  @click="emit('closed')"
                >
                  <Icon size="20px" name="ri:close-line" />
                </button>
              </div>
            </div>

            <!-- Identity overlay at photo bottom -->
            <div class="hero-footer">
              <div class="identity">
                <h2 :id="titleId" class="hero-name">
                  {{ user?.nombre || "Usuario" }}
                  <span v-if="user?.edad" class="hero-age">
                    {{ user.edad }}
                  </span>
                </h2>
                <div class="badges">
                  <span v-if="user?.pronombre" class="badge">{{
                    user.pronombre
                  }}</span>
                  <span v-if="user?.rol" class="badge">{{ user.rol }}</span>
                  <span v-if="user?.genero" class="badge">{{
                    user.genero
                  }}</span>
                </div>
              </div>

              <button
                class="chat-fab"
                type="button"
                :aria-busy="pending"
                :disabled="pending"
                @click="openOrCreateChat"
              >
                <Icon v-if="!pending" size="26px" name="ph:chat-fill" />
                <span v-else class="spinner" aria-hidden="true"></span>
                <span class="sr-only">Abrir chat</span>
              </button>
            </div>
          </div>

          <!-- ── Info scroll ──────────────────────────── -->
          <section class="info">
            <!-- Acerca de -->
            <div v-if="user?.acerca" class="block">
              <span class="block-title">Acerca de mí</span>
              <p class="about-text">{{ user.acerca }}</p>
            </div>

            <!-- Descripción -->
            <div v-if="hasDescription" class="block">
              <span class="block-title">Descripción</span>
              <div class="desc-grid">
                <div v-if="user?.genero" class="desc-item">
                  <Icon size="15px" name="material-symbols-light:transgender" />
                  <span>{{ user.genero }}</span>
                </div>
                <div v-if="user?.etnia" class="desc-item">
                  <Icon size="15px" name="mdi:earth" />
                  <span>{{ user.etnia }}</span>
                </div>
                <div v-if="user?.estadoCivil" class="desc-item">
                  <Icon size="15px" name="clarity:users-line" />
                  <span>{{ user.estadoCivil }}</span>
                </div>
                <div v-if="measureLabel" class="desc-item">
                  <Icon size="15px" name="ri:ruler-line" />
                  <span>{{ measureLabel }}</span>
                </div>
              </div>
            </div>

            <!-- Busca -->
            <div v-if="user?.busca?.length" class="block">
              <span class="block-title">Busca</span>
              <div class="chips">
                <span
                  v-for="(b, i) in user.busca"
                  :key="i"
                  class="chip chip--yellow"
                  >{{ b }}</span
                >
              </div>
            </div>

            <!-- Encuentro -->
            <div v-if="user?.encuentro?.length" class="block">
              <span class="block-title">Encuentro</span>
              <div class="chips">
                <span v-for="(e, i) in user.encuentro" :key="i" class="chip">{{
                  e
                }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="user?.tags?.length" class="block">
              <span class="block-title">Tags</span>
              <div class="chips">
                <span
                  v-for="(t, i) in user.tags"
                  :key="i"
                  class="chip chip--green"
                  >{{ t }}</span
                >
              </div>
            </div>

            <!-- Salud -->
            <div
              v-if="user?.salud?.vacunas?.length || user?.salud?.vih || user?.salud?.prep"
              class="block"
            >
              <span class="block-title">Salud</span>
              <div class="chips">
                <span
                  v-for="(v, i) in user?.salud?.vacunas ?? []"
                  :key="i"
                  class="chip"
                  >{{ v }}</span
                >
                <span v-if="user?.salud?.vih" class="chip">
                  VIH: {{ user.salud.vih }}
                </span>
                <span v-if="user?.salud?.prep" class="chip">
                  PrEP: {{ user.salud.prep }}
                </span>
              </div>
            </div>

            <p v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</p>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ──────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
}

/* ── Panel ────────────────────────────────────────────── */
.panel {
  position: absolute;
  inset: 0;
  background: var(--black);
  color: var(--white);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Hero ─────────────────────────────────────────────── */
.hero {
  position: relative;
  flex: 0 0 55vh;
  background: var(--black-soft);
  overflow: hidden;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

/* Top bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent);
}

.brand-icon {
  color: var(--yellow);
  filter: drop-shadow(0 0 6px rgba(255, 188, 66, 0.5));
}

.top-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: var(--white);
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 0.15s ease;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.65);
}

/* Identity at photo bottom */
.hero-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 56px 16px 18px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.88), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.identity {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: 1.7rem;
  font-weight: 900;
  margin: 0 0 8px;
  color: #fff;
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.hero-age {
  font-size: 1.3rem;
  font-weight: 300;
  opacity: 0.85;
}

.badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
}

/* Chat FAB */
.chat-fab {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: none;
  background: var(--yellow);
  color: var(--black);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 188, 66, 0.55);
  flex-shrink: 0;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.chat-fab:hover {
  box-shadow: 0 6px 24px rgba(255, 188, 66, 0.7);
}

.chat-fab:active {
  transform: scale(0.93);
}

.chat-fab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Info scroll ──────────────────────────────────────── */
.info {
  flex: 1;
  overflow-y: auto;
  padding: 22px 16px calc(28px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 22px;
  scrollbar-width: none;
  background: var(--black);
}

.info::-webkit-scrollbar {
  display: none;
}

/* ── Blocks ───────────────────────────────────────────── */
.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--gray);
}

.about-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--white);
  white-space: pre-wrap;
  margin: 0;
}

/* Description items */
.desc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--white);
  background: var(--black-soft);
  border-radius: 10px;
  padding: 9px 11px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.chip {
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  background: var(--black-soft);
  color: var(--white);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chip--yellow {
  background: rgba(255, 188, 66, 0.12);
  border-color: rgba(255, 188, 66, 0.3);
  color: var(--yellow);
}

.chip--green {
  background: rgba(97, 152, 142, 0.12);
  border-color: rgba(97, 152, 142, 0.3);
  color: var(--green);
}

/* Misc */
.spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(0, 0, 0, 0.3);
  border-top-color: var(--black);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: #ff6961;
  font-size: 0.9rem;
  margin: 0;
}

/* ── Transition ───────────────────────────────────────── */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
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
