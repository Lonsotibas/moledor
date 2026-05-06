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
footer.dock {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  background: var(--black);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

#navbar {
  width: 100%;
  margin: 0;
  padding: 0;
}

#nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.nav-item {
  display: grid;
  place-items: center;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 0 12px;
  width: 100%;
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.nav-link:active {
  opacity: 0.6;
  transform: scale(0.94);
}

.icon-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
}

.icon {
  color: rgba(255, 255, 255, 0.38);
  transition: color 0.15s ease;
}

.nav-item.active .icon {
  color: var(--yellow);
}

.indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--yellow);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.nav-item.active .indicator {
  opacity: 1;
}

.label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: rgba(255, 255, 255, 0.38);
  transition: color 0.15s ease;
}

.nav-item.active .label {
  color: var(--yellow);
  font-weight: 600;
}

.active-glow {
  display: none;
}

@media (hover: hover) {
  .nav-link:hover .icon,
  .nav-link:hover .label {
    color: rgba(255, 255, 255, 0.7);
  }
  .nav-item.active .nav-link:hover .icon,
  .nav-item.active .nav-link:hover .label {
    color: var(--yellow);
  }
}
</style>
