<script setup lang="ts">
const props = defineProps<{ src: string }>();

const audioEl = ref<HTMLAudioElement | null>(null);
const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const BAR_COUNT = 30;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const bars = computed(() => {
  const seed = props.src
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const r = pseudoRandom(seed + i * 13);
    return Math.max(0.12, r * 0.88 + 0.12);
  });
});

const progress = computed(() =>
  duration.value ? currentTime.value / duration.value : 0
);

const playedCount = computed(() =>
  Math.round(progress.value * BAR_COUNT)
);

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const displayTime = computed(() =>
  currentTime.value > 0 ? fmt(currentTime.value) : fmt(duration.value)
);

function toggle() {
  const el = audioEl.value;
  if (!el) return;
  playing.value ? el.pause() : el.play();
}

function seek(e: MouseEvent) {
  const el = audioEl.value;
  if (!el || !duration.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  el.currentTime = ratio * duration.value;
}

// MediaRecorder blobs often have duration=Infinity — seek to end to force the
// browser to calculate the real duration, then reset to 0.
function onLoadedMetadata(e: Event) {
  const el = e.target as HTMLAudioElement;
  if (!isFinite(el.duration)) {
    el.currentTime = 1e101;
  } else {
    duration.value = el.duration;
  }
}

function onDurationChange(e: Event) {
  const el = e.target as HTMLAudioElement;
  if (isFinite(el.duration)) {
    duration.value = el.duration;
    if (el.currentTime > el.duration) el.currentTime = 0;
  }
}

function onTimeUpdate(e: Event) {
  const el = e.target as HTMLAudioElement;
  if (isFinite(duration.value)) {
    currentTime.value = el.currentTime;
  }
}
</script>

<template>
  <div class="player">
    <audio
      ref="audioEl"
      :src="src"
      preload="metadata"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @timeupdate="onTimeUpdate"
      @ended="playing = false; currentTime = 0"
      @play="playing = true"
      @pause="playing = false"
      @contextmenu.prevent
    />

    <button
      class="play-btn"
      type="button"
      :aria-label="playing ? 'Pausar' : 'Reproducir'"
      @click="toggle"
    >
      <Icon
        :name="playing ? 'solar:pause-bold' : 'solar:play-bold'"
        size="18px"
      />
    </button>

    <div class="waveform" @click="seek">
      <div
        v-for="(h, i) in bars"
        :key="i"
        class="bar"
        :class="{ played: i < playedCount }"
        :style="{ '--h': h }"
      />
    </div>

    <span class="time">{{ displayTime }}</span>
  </div>
</template>

<style scoped>
.player {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  width: min(62vw, 250px);
  --accent: var(--black, #121113);
}

.play-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.1s ease, opacity 0.15s;
}

.play-btn:hover {
  opacity: 0.85;
}

.play-btn:active {
  transform: scale(0.91);
}

.waveform {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 28px;
  cursor: pointer;
}

.bar {
  flex: 1;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.15);
  height: calc(var(--h) * 100%);
  min-height: 3px;
  transition: background 0.08s;
}

.bar.played {
  background: var(--accent);
}

.time {
  font-size: 0.67rem;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0.2px;
  white-space: nowrap;
  min-width: 26px;
  text-align: right;
}
</style>
