<script setup lang="ts">
const { currentUser, setUserData } = useUserData();

const isMenuOpen = ref(false);
const panel = ref<"root" | "appearance">("root");

const avatarBtn = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

const openMenu = () => {
  isMenuOpen.value = true;
  panel.value = "root";
  requestAnimationFrame(() => {
    const first = menuRef.value?.querySelector(
      "[data-menuitem]"
    ) as HTMLElement;
    first?.focus();
  });
};
const closeMenu = () => (isMenuOpen.value = false);

function onKeydownGlobal(e: KeyboardEvent) {
  if (!isMenuOpen.value) return;
  if (e.key === "Escape") {
    if (panel.value !== "root") {
      panel.value = "root";
    } else {
      closeMenu();
    }
  }
}

function onClickOutside(e: Event) {
  if (!isMenuOpen.value) return;
  const t = e.target as Node;
  if (
    menuRef.value &&
    !menuRef.value.contains(t) &&
    !avatarBtn.value?.contains(t)
  ) {
    closeMenu();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydownGlobal);
  window.addEventListener("pointerdown", onClickOutside);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydownGlobal);
  window.removeEventListener("pointerdown", onClickOutside);
});

const logout = () => {
  setUserData(null);
  closeMenu();
  navigateTo("/");
};

const editProfile = () => {
  closeMenu();
  navigateTo("/config");
};

const goToBlocked = () => {
  closeMenu();
  navigateTo("/blocked");
};

function focusNext(dir: 1 | -1) {
  const items = Array.from(
    menuRef.value?.querySelectorAll<HTMLElement>("[data-menuitem]") || []
  );
  const idx = items.indexOf(document.activeElement as HTMLElement);
  const next = items[(idx + dir + items.length) % items.length];
  next?.focus();
}
function onKeydownMenu(e: KeyboardEvent) {
  if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "ArrowDown") focusNext(1);
  if (e.key === "ArrowUp") focusNext(-1);
  if (e.key === "Home") {
    const first = menuRef.value?.querySelector(
      "[data-menuitem]"
    ) as HTMLElement;
    first?.focus();
  }
  if (e.key === "End") {
    const items =
      menuRef.value?.querySelectorAll<HTMLElement>("[data-menuitem]");
    items && items[items.length - 1]?.focus();
  }
}
</script>

<template>
  <header class="navbar" role="banner">
    <!-- Avatar -->
    <button
      ref="avatarBtn"
      class="avatar-btn"
      v-if="currentUser"
      :aria-expanded="isMenuOpen"
      aria-haspopup="menu"
      @click="isMenuOpen ? closeMenu() : openMenu()"
    >
      <img
        v-if="(currentUser as any)?.photos?.[0]"
        :src="(currentUser as any).photos[0]"
        alt="Foto de perfil"
        class="avatar-photo"
      />
      <Icon v-else class="avatar" size="28px" name="solar:user-circle-bold" />
      <span class="status-dot" aria-hidden="true"></span>
      <span class="sr-only">Abrir menú de usuario</span>
    </button>

    <!-- Marca -->
    <div class="brand">
      <span class="brand-name">Moledor</span>
    </div>

    <!-- Acciones a la derecha -->
    <div class="actions">
      <button class="fire-btn" aria-label="Ver fuegos" @click="navigateTo('/fires')">
        <Icon size="22px" name="solar:fire-minimalistic-bold" />
      </button>
      <slot name="actions" />
    </div>

    <!-- Backdrop -->
    <transition name="fade">
      <div v-if="isMenuOpen" class="menu-backdrop" @click="closeMenu()" />
    </transition>

    <!-- Submenu -->
    <transition name="menu-pop">
      <div
        v-if="isMenuOpen"
        ref="menuRef"
        class="submenu"
        role="menu"
        aria-label="Menú de usuario"
        @keydown="onKeydownMenu"
      >
        <div v-show="panel === 'root'" class="panel">
          <div class="user-card">
            <div class="uc-avatar">
              <img
                v-if="(currentUser as any)?.photos?.[0]"
                :src="(currentUser as any).photos[0]"
                alt="Foto de perfil"
                class="uc-photo"
              />
              <Icon v-else size="28px" name="solar:user-circle-bold" />
            </div>
            <div class="uc-meta">
              <strong class="uc-name">{{
                currentUser?.nombre || "Usuario"
              }}</strong>
              <span class="uc-sub">{{ currentUser?.email || "Cuenta" }}</span>
            </div>
          </div>

          <hr class="sep" />

          <button
            class="menu-item"
            role="menuitem"
            data-menuitem
            @click="editProfile"
          >
            <Icon name="solar:pen-2-bold-duotone" size="20px" />
            <span>Editar perfil</span>
          </button>

          <button
            class="menu-item"
            role="menuitem"
            data-menuitem
            @click="goToBlocked"
          >
            <Icon name="solar:user-block-rounded-bold-duotone" size="20px" />
            <span>Bloqueados</span>
          </button>

          <hr class="sep" />

          <button
            class="menu-item danger"
            role="menuitem"
            data-menuitem
            @click="logout"
          >
            <Icon name="solar:logout-3-line-duotone" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar {
  --header-h: 56px;
  --divider: rgba(255, 255, 255, 0.08);
  --text: var(--white, #ecf8f8);
  --muted: var(--gray, #949396);
  --accent: var(--yellow, #ffbc42);
  --danger: #ff6b6b;
  --shadow: 0 12px 28px rgba(0, 0, 0, 0.45);

  position: fixed;
  inset-inline: 0;
  top: 0;
  height: calc(var(--header-h) + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  background: var(--black, #121113);
  box-shadow: 0 1px 0 var(--divider);
  display: grid;
  grid-template-columns: 52px 1fr 52px;
  align-items: center;
  padding-inline: 12px;
  color: var(--text);
  z-index: 1000;
}

.avatar-btn {
  display: grid;
  place-items: center;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--divider);
  background: radial-gradient(
    120% 120% at 30% 30%,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
  color: var(--text);
  box-shadow: var(--shadow);
  cursor: pointer;
  position: relative;
}
.avatar-btn:active {
  transform: translateY(1px);
}
.avatar-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #42d17d;
  box-shadow: 0 0 0 2px var(--black, #121113);
}
.brand {
  display: inline-grid;
  justify-content: center;
  align-items: center;
}
.brand-name {
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: var(--accent);
}
.actions {
  justify-self: end;
  display: inline-flex;
  gap: 6px;
  color: var(--muted);
}
.fire-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 4px;
  border-radius: 8px;
  transition: opacity 0.15s;
}
.fire-btn:active {
  opacity: 0.6;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.25);
}

.submenu {
  position: fixed;
  top: calc(var(--header-h) + env(safe-area-inset-top) + 6px);
  left: 10px;
  width: 268px;
  background: var(--black, #121113);
  backdrop-filter: blur(12px) saturate(115%);
  border: 1px solid var(--divider);
  border-radius: 14px;
  box-shadow: var(--shadow);
  color: var(--text);
  overflow: hidden;
  z-index: 1100;
}

.panel {
  padding: 8px;
}
.panel.slide {
  padding: 0;
}

.user-card {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px;
}
.uc-avatar {
  height: 36px;
  width: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(
    120% 120% at 30% 30%,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
  border: 1px solid var(--divider);
}
.uc-photo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.uc-meta {
  min-width: 0;
  display: grid;
}
.uc-name {
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.uc-sub {
  color: var(--muted);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sep {
  border: none;
  height: 1px;
  background: var(--divider);
  margin: 6px 0;
}

.menu-item {
  width: 100%;
  display: grid;
  grid-template-columns: 24px 1fr 16px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.06s ease;
}
.menu-item .end {
  justify-self: end;
  opacity: 0.7;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.menu-item:active {
  transform: translateY(1px);
}
.menu-item.danger {
  color: var(--danger);
}

.panel-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--divider);
}
.back-btn {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
}
.ph-title {
  justify-self: center;
  font-weight: 700;
}
.ph-spacer {
  justify-self: end;
  width: 24px;
}

.choices {
  padding: 6px;
  display: grid;
  gap: 6px;
}
.choice {
  display: grid;
  grid-template-columns: 24px 24px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.choice:hover {
  background: rgba(255, 255, 255, 0.05);
}
.choice.active {
  border-color: var(--accent);
}
.choice input {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease;
  transform-origin: top left;
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
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

@media (prefers-reduced-motion: reduce) {
  .menu-pop-enter-active,
  .menu-pop-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
