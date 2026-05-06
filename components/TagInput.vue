<script setup lang="ts">
const props = defineProps<{
  modelValue: string[];
  placeholder?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [string[]];
}>();

const input = ref("");

function add() {
  const val = input.value.trim();
  if (val && !props.modelValue.includes(val)) {
    emit("update:modelValue", [...props.modelValue, val]);
  }
  input.value = "";
}

function remove(val: string) {
  emit("update:modelValue", props.modelValue.filter((v) => v !== val));
}
</script>

<template>
  <div class="tag-wrap">
    <div v-if="modelValue.length" class="chips">
      <span v-for="t in modelValue" :key="t" class="chip">
        {{ t }}
        <button type="button" @click="remove(t)" aria-label="Eliminar">×</button>
      </span>
    </div>
    <div class="add-row">
      <input
        v-model="input"
        :placeholder="placeholder ?? 'Añadir...'"
        @keydown.enter.prevent="add"
      />
      <button type="button" @click="add" aria-label="Añadir">+</button>
    </div>
  </div>
</template>

<style scoped>
.tag-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 188, 66, 0.1);
  border: 1px solid rgba(255, 188, 66, 0.25);
  color: var(--yellow, #ffbc42);
  border-radius: 999px;
  padding: 3px 6px 3px 10px;
  font-size: 0.82rem;
  font-weight: 500;
}

.chip button {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  font-size: 1rem;
  opacity: 0.65;
  font-family: inherit;
}

.chip button:hover {
  opacity: 1;
}

.add-row {
  display: grid;
  grid-template-columns: 1fr 38px;
  gap: 8px;
}

.add-row input {
  background: var(--black-mute, #333531);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 8px 11px;
  color: var(--white, #ecf8f8);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.add-row input:focus {
  border-color: var(--yellow, #ffbc42);
}

.add-row button {
  background: var(--black-mute, #333531);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  color: var(--yellow, #ffbc42);
  font-size: 1.3rem;
  font-weight: 300;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;
  font-family: inherit;
  padding: 0;
}

.add-row button:hover {
  background: rgba(255, 188, 66, 0.08);
}

.add-row button:active {
  transform: translateY(1px);
}
</style>
