<script setup lang="ts">
const emit = defineEmits<{ (e: "showMenu", value: boolean): void }>();
const { currentUser, setUserData } = useUserData();
const router = useRouter();

const u = currentUser.value as any;

const nombre = ref<string>(u?.nombre ?? "");
const acerca = ref<string>(u?.acerca ?? "");
const edad = ref<number | "">(u?.edad ?? "");
const genero = ref<string>(u?.genero ?? "");
const pronombre = ref<string>(u?.pronombre ?? "");
const estadoCivil = ref<string>(u?.estadoCivil ?? "");
const estatura = ref<number | "">(u?.medidas?.estatura ?? "");
const peso = ref<number | "">(u?.medidas?.peso ?? "");
const etnia = ref<string>(u?.etnia ?? "");
const rol = ref<string>(u?.rol ?? "");
const distancia = ref<number | "">(u?.distancia ?? "");
const busca = ref<string[]>([...(u?.busca ?? [])]);
const encuentro = ref<string[]>([...(u?.encuentro ?? [])]);
const tags = ref<string[]>([...(u?.tags ?? [])]);
const vih = ref<string>(u?.salud?.vih ?? "");
const prep = ref<string>(u?.salud?.prep ?? "");
const vacunas = ref<string[]>([...(u?.salud?.vacunas ?? [])]);
const photos = ref<string[]>([...(u?.photos ?? [])]);

const photoInput = ref<HTMLInputElement | null>(null);
const uploadingPhoto = ref(false);

async function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED.includes(file.type) || file.size > 5 * 1024 * 1024) return;

  uploadingPhoto.value = true;
  try {
    const form = new FormData();
    form.append("photo", file);
    const res = await $fetch<{ url: string }>("/api/upload/photo", {
      method: "post",
      body: form,
    });
    photos.value = [res.url, ...photos.value.slice(1)];
  } finally {
    uploadingPhoto.value = false;
    if (photoInput.value) photoInput.value.value = "";
  }
}

const saving = ref(false);
const saved = ref(false);
const saveError = ref("");

async function save() {
  saving.value = true;
  saved.value = false;
  saveError.value = "";
  try {
    const updated = await $fetch("/api/user", {
      method: "patch",
      body: {
        _id: currentUser.value?._id,
        name: nombre.value,
        acerca: acerca.value,
        age: edad.value || null,
        gender: genero.value,
        pronoun: pronombre.value,
        rel_status: estadoCivil.value,
        height: estatura.value || null,
        weight: peso.value || null,
        ethnicity: etnia.value,
        rol: rol.value,
        distancia: distancia.value || null,
        search: busca.value,
        encounter: encuentro.value,
        tags: tags.value,
        vih: vih.value,
        prep: prep.value,
        vaccines: vacunas.value,
        photos: photos.value,
      },
    });
    setUserData(updated as any);
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } catch {
    saveError.value = "Error al guardar. Intenta de nuevo.";
  } finally {
    saving.value = false;
  }
}

onBeforeMount(() => {
  emit("showMenu", false);
});
</script>

<template>
  <div class="page">
    <!-- Top bar -->
    <header class="topbar">
      <button class="back-btn" type="button" @click="router.back()">
        <Icon name="solar:alt-arrow-left-bold" size="22px" />
      </button>
      <span class="topbar-title">Mi perfil</span>
      <span></span>
    </header>

    <!-- Scrollable content -->
    <div class="content">
      <!-- Profile photo -->
      <div class="photo-section">
        <div
          class="photo-ring"
          :class="{ uploading: uploadingPhoto }"
          @click="photoInput?.click()"
        >
          <img
            v-if="photos[0]"
            :src="photos[0]"
            alt="Foto de perfil"
            class="photo-img"
          />
          <Icon
            v-else
            name="solar:user-circle-bold"
            size="52px"
            class="photo-placeholder"
          />
          <div class="photo-overlay" aria-hidden="true">
            <div v-if="uploadingPhoto" class="spinner"></div>
            <Icon v-else name="solar:camera-bold" size="22px" />
          </div>
        </div>
        <button
          class="change-photo-btn"
          type="button"
          :disabled="uploadingPhoto"
          @click="photoInput?.click()"
        >
          {{ uploadingPhoto ? "Subiendo..." : "Cambiar foto" }}
        </button>
        <input
          ref="photoInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style="display: none"
          @change="onPhotoChange"
        />
      </div>

      <!-- Sobre mí -->
      <section class="card">
        <h3 class="section-title">Sobre mí</h3>

        <div class="field">
          <label>Nombre</label>
          <input v-model="nombre" type="text" placeholder="Tu nombre" />
        </div>

        <div class="field">
          <label>Acerca de mí</label>
          <textarea
            v-model="acerca"
            placeholder="Cuéntanos sobre ti..."
            rows="3"
          ></textarea>
        </div>

        <div class="field">
          <label>Tags</label>
          <TagInput v-model="tags" placeholder="Añadir tag..." />
        </div>
      </section>

      <!-- Personal -->
      <section class="card">
        <h3 class="section-title">Personal</h3>

        <div class="row">
          <div class="field">
            <label>Edad</label>
            <input
              v-model.number="edad"
              type="number"
              min="18"
              max="99"
              placeholder="—"
            />
          </div>
          <div class="field">
            <label>Género</label>
            <input v-model="genero" type="text" placeholder="—" />
          </div>
        </div>

        <div class="row">
          <div class="field">
            <label>Pronombre</label>
            <input v-model="pronombre" type="text" placeholder="—" />
          </div>
          <div class="field">
            <label>Estado civil</label>
            <input v-model="estadoCivil" type="text" placeholder="—" />
          </div>
        </div>
      </section>

      <!-- Físico -->
      <section class="card">
        <h3 class="section-title">Físico</h3>

        <div class="row">
          <div class="field">
            <label>Estatura (cm)</label>
            <input v-model.number="estatura" type="number" placeholder="—" />
          </div>
          <div class="field">
            <label>Peso (kg)</label>
            <input v-model.number="peso" type="number" placeholder="—" />
          </div>
        </div>

        <div class="field">
          <label>Etnia</label>
          <input v-model="etnia" type="text" placeholder="—" />
        </div>
      </section>

      <!-- Preferencias -->
      <section class="card">
        <h3 class="section-title">Preferencias</h3>

        <div class="row">
          <div class="field">
            <label>Rol</label>
            <input v-model="rol" type="text" placeholder="—" />
          </div>
          <div class="field">
            <label>Distancia (km)</label>
            <input v-model.number="distancia" type="number" placeholder="—" />
          </div>
        </div>

        <div class="field">
          <label>Busca</label>
          <TagInput v-model="busca" placeholder="Añadir..." />
        </div>

        <div class="field">
          <label>Encuentro</label>
          <TagInput v-model="encuentro" placeholder="Añadir..." />
        </div>
      </section>

      <!-- Salud -->
      <section class="card">
        <h3 class="section-title">Salud</h3>

        <div class="row">
          <div class="field">
            <label>VIH</label>
            <input v-model="vih" type="text" placeholder="—" />
          </div>
          <div class="field">
            <label>PrEP</label>
            <input v-model="prep" type="text" placeholder="—" />
          </div>
        </div>

        <div class="field">
          <label>Vacunas</label>
          <TagInput v-model="vacunas" placeholder="Añadir vacuna..." />
        </div>
      </section>

      <p v-if="saveError" class="error-msg">{{ saveError }}</p>
    </div>

    <!-- Save bar -->
    <div class="save-bar">
      <button
        class="save-btn"
        type="button"
        :disabled="saving || uploadingPhoto"
        @click="save"
      >
        {{ saved ? "Guardado ✓" : saving ? "Guardando..." : "Guardar" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--black);
  color: var(--white);
  overflow: hidden;
}

/* Top bar */
.topbar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding-top: env(safe-area-inset-top);
  height: calc(52px + env(safe-area-inset-top));
  padding-inline: 8px;
  background: var(--black);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
}

.back-btn {
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  color: var(--white);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background 0.15s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.back-btn:active {
  transform: translateY(1px);
}

.topbar-title {
  text-align: center;
  font-weight: 800;
  font-size: 1rem;
  color: var(--yellow);
}

/* Scrollable content */
.content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 20px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.content::-webkit-scrollbar {
  display: none;
}

/* Profile photo */
.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 4px;
}

.photo-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--yellow);
  cursor: pointer;
  background: var(--black-soft);
  display: grid;
  place-items: center;
  transition: border-color 0.15s;
}

.photo-ring:hover {
  border-color: color-mix(in srgb, var(--yellow) 70%, white);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  opacity: 0.4;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.15s;
  color: white;
}

.photo-ring:hover .photo-overlay,
.photo-ring:active .photo-overlay,
.photo-ring.uploading .photo-overlay {
  opacity: 1;
}

.change-photo-btn {
  background: transparent;
  border: none;
  color: var(--yellow);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  font-family: inherit;
}

.change-photo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Section cards */
.card {
  background: var(--black-soft);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: var(--gray);
  margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 0.78rem;
  color: var(--gray);
  font-weight: 500;
}

.field input,
.field textarea {
  background: var(--black-mute);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 9px 12px;
  color: var(--white);
  font-size: 0.93rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.15s;
  -webkit-appearance: none;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--yellow);
}

.field textarea {
  resize: none;
  line-height: 1.5;
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.88rem;
  text-align: center;
}

/* Save bar */
.save-bar {
  flex-shrink: 0;
  padding: 12px 14px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--black);
}

.save-btn {
  width: 100%;
  padding: 14px;
  background: var(--yellow);
  color: var(--black);
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.06s;
  font-family: inherit;
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.save-btn:active:not(:disabled) {
  transform: translateY(1px);
}
</style>
