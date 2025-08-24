<script setup lang="ts">
const route = useRoute();

const itemPressed = ref<"index" | "chat" | "virtual">("index");

type NavItem = {
  key: "index" | "chat" | "virtual";
  to: string;
  label: string;
  icon: string;
  iconActive: string;
  fab?: boolean;
};

const items: NavItem[] = [
  {
    key: "index",
    to: "/main",
    label: "Explorar",
    icon: "bi:eye",
    iconActive: "bi:eye-fill",
  },
  {
    key: "chat",
    to: "/chats",
    label: "Chats",
    icon: "mingcute:message-3-line",
    iconActive: "mingcute:message-3-fill",
  },
  {
    key: "virtual",
    to: "/xxo",
    label: "XXO",
    icon: "streamline:virtual-reality",
    iconActive: "streamline:virtual-reality-solid",
  },
];

const activeKey = computed<"index" | "chat" | "virtual">(() => {
  if (route.path.startsWith("/chats")) return "chat";
  if (route.path.startsWith("/xxo")) return "virtual";
  return "index";
});

watch(
  () => route.path,
  () => (itemPressed.value = activeKey.value),
  { immediate: true }
);

const activeIndex = computed(() =>
  items.findIndex((i) => i.key === activeKey.value)
);
</script>

<template>
  <footer class="dock">
    <nav
      id="navbar"
      role="navigation"
      aria-label="Dock navigation"
      :style="{ '--active-index': String(activeIndex) }"
    >
      <ul id="nav-list">
        <li
          v-for="(it, idx) in items"
          :key="it.key"
          class="nav-item"
          :class="[{ active: activeKey === it.key, fab: it.fab }]"
        >
          <NuxtLink
            :to="it.to"
            class="nav-link"
            :aria-current="activeKey === it.key ? 'page' : undefined"
            @click="itemPressed = it.key"
          >
            <span class="icon-wrap">
              <Icon
                class="icon"
                :name="activeKey === it.key ? it.iconActive : it.icon"
                size="26px"
              />
              <span class="indicator" aria-hidden="true"></span>
            </span>
            <span class="label">{{ it.label }}</span>
          </NuxtLink>
        </li>
      </ul>
      <span class="active-glow" aria-hidden="true"></span>
    </nav>
  </footer>
</template>

<style scoped>
:root {
  --surface: var(--black, #000);
  --glass: rgba(0, 0, 0, 0.5);
  --text: var(--white, #fff);
  --muted: var(--white-mute, #a9a9a9);
  --accent: var(--yellow, #ffd166);
  --radius: 18px;
  --divider: rgba(255, 255, 255, 0.08);
  --shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
}

footer.dock {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  pointer-events: none;
}

#navbar {
  pointer-events: auto;
  width: min(640px, 96vw);
  margin: 0 auto max(10px, env(safe-area-inset-bottom));
  padding: 10px 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
  background-color: var(--glass);
  border: 1px solid var(--divider);
  backdrop-filter: blur(12px) saturate(110%);
  border-radius: 22px;
  box-shadow: var(--shadow);
  position: relative;
}

#nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  gap: 6px;
}

.nav-item {
  display: grid;
  place-items: center;
  min-width: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 14px;
  transition: transform 0.08s ease, background 0.15s ease;
}
.nav-link:active {
  transform: translateY(1px) scale(0.98);
}

.icon-wrap {
  position: relative;
  height: 44px;
  width: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(
    120% 120% at 30% 30%,
    rgba(255, 255, 255, 0.09),
    rgba(255, 255, 255, 0.03)
  );
  border: 1px solid var(--divider);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.2s ease;
}

.nav-item.active .icon-wrap {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 8px 24px rgba(255, 209, 102, 0.25);
  background: radial-gradient(
    120% 120% at 30% 30%,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.05)
  );
}

.icon {
  transition: color 0.18s ease, opacity 0.18s ease;
}
.nav-item.active .icon {
  color: var(--yellow);
}

.indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 4px;
  border-radius: 999px;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.18s ease;
}
.nav-item.active .indicator {
  opacity: 1;
}

.label {
  font-size: 11px;
  color: var(--muted);
  line-height: 1;
  transition: color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
  transform: translateY(-1px);
}
.nav-item.active .label {
  color: var(--yellow);
  opacity: 1;
}

.nav-item.fab .icon-wrap {
  height: 56px;
  width: 56px;
  margin-top: -18px;
}
.nav-item.fab.active .icon-wrap {
  transform: translateY(-6px) scale(1.08);
  box-shadow: 0 10px 30px rgba(255, 209, 102, 0.35);
}

@media (hover: hover) {
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.04);
  }
}

.active-glow {
  position: absolute;
  bottom: 8px;
  height: 24px;
  width: 28%;
  left: calc((var(--active-index, 0) * 33.333%) + 3.5%);
  filter: blur(12px);
  background: radial-gradient(
    40px 12px at 50% 50%,
    rgba(255, 209, 102, 0.45),
    transparent 70%
  );
  transition: left 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
  border-radius: 999px;
}

@media (max-width: 360px) {
  .icon-wrap {
    height: 40px;
    width: 40px;
  }
  .nav-item.fab .icon-wrap {
    height: 52px;
    width: 52px;
  }
}
</style>
