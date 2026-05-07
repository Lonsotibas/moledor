<script setup lang="ts">
const { setUserData } = useUserData();
const emit = defineEmits(["showMenu"]);
const newUser = ref(false);
const nameSend = ref(false);
const profileSend = ref(false);

const name = ref("");
const pass = ref("");
const gender = ref("");
const pronoun = ref("");
const height = ref("");
const weight = ref("");
const age = ref("");
const rol = ref("");
const ethnicity = ref("");
const rel_status = ref("");
const search = ref<string[]>([]);
const encounter = ref<string[]>([]);
const vaccines = ref<string[]>([]);
const vih = ref("");
const prep = ref("");
const tags = ref<string[]>([]);

const loginError = ref("");
const loginSuccess = ref(false);
const loginLoading = ref(false);

const loginUser = async (e: Event) => {
    e.preventDefault();
    loginError.value = "";
    loginSuccess.value = false;
    loginLoading.value = true;
    try {
        const user = await $fetch("/api/auth/login", {
            method: "post",
            body: { name: name.value, pass: pass.value },
        }) as any;
        loginSuccess.value = true;
        setUserData(user);
        emit("showMenu", true);
        await new Promise((r) => setTimeout(r, 700));
        navigateTo("/main");
    } catch {
        loginError.value = "Usuario o contraseña incorrectos";
    } finally {
        loginLoading.value = false;
    }
};

// Step 3 — personality & photo generation
const simDescription = ref("");
const generatedPhoto = ref("");
const simType = ref("");
const photoLoading = ref(false);
const photoError = ref("");
const createLoading = ref(false);

const generatePhoto = async () => {
    if (!simDescription.value.trim()) {
        photoError.value = "Escribe una descripción primero.";
        return;
    }
    photoError.value = "";
    photoLoading.value = true;
    try {
        const res = await $fetch("/api/sim/generate-photo", {
            method: "post",
            body: {
                description: simDescription.value,
                attributes: {
                    edad: age.value,
                    genero: gender.value,
                    etnia: ethnicity.value,
                },
            },
        }) as any;
        generatedPhoto.value = res.url;
        simType.value = res.simType;
    } catch {
        photoError.value = "Error generando la foto. ¿Está corriendo el sim engine?";
    } finally {
        photoLoading.value = false;
    }
};

const createUser = async (e: Event) => {
    e.preventDefault();
    createLoading.value = true;
    try {
        const res = await $fetch("/api/user", {
            method: "post",
            body: {
                name: name.value,
                pass: pass.value,
                gender: gender.value,
                pronoun: pronoun.value,
                height: height.value,
                weight: weight.value,
                age: age.value,
                rol: rol.value,
                ethnicity: ethnicity.value,
                rel_status: rel_status.value,
                search: search.value,
                encounter: encounter.value,
                vaccines: vaccines.value,
                vih: vih.value,
                prep: prep.value,
                tags: tags.value,
                photos: generatedPhoto.value ? [generatedPhoto.value] : [],
                simPersonality: simDescription.value,
                simType: simType.value,
            },
        });
        setUserData(res as any);
        emit("showMenu", true);
        navigateTo("/main");
    } catch {
        // Error al crear usuario
    } finally {
        createLoading.value = false;
    }
};

onBeforeMount(() => {
    emit("showMenu", false);
});
</script>

<template>
    <main class="view">

        <!-- ── LOGIN ──────────────────────────────────────── -->
        <div v-if="!newUser" class="screen">
            <div class="brand">
                <Icon name="solar:fire-minimalistic-bold" size="44px" class="brand-icon" />
                <h1 class="brand-name">Moledor</h1>
            </div>

            <form class="card" @submit.prevent="loginUser">
                <fieldset class="field">
                    <label for="login-name">Nombre de usuario</label>
                    <input v-model="name" type="text" id="login-name" name="login-name" autocomplete="username"
                        placeholder="Tu nombre" />
                </fieldset>
                <fieldset class="field">
                    <label for="login-pass">Contraseña</label>
                    <input v-model="pass" type="password" id="login-pass" name="login-pass"
                        autocomplete="current-password" placeholder="••••••••" />
                </fieldset>
                <p v-if="loginError" class="form-msg form-msg--error">{{ loginError }}</p>
                <p v-if="loginSuccess" class="form-msg form-msg--success">¡Sesión iniciada!</p>
                <button type="submit" class="btn-primary" :disabled="loginLoading">
                    {{ loginSuccess ? '¡Bienvenido!' : loginLoading ? 'Entrando…' : 'Iniciar sesión' }}
                </button>
                <button type="button" class="btn-ghost" :disabled="loginLoading" @click="newUser = true">
                    Crear cuenta
                </button>
            </form>
        </div>

        <!-- ── REGISTER STEP 1 ────────────────────────────── -->
        <div v-else-if="!nameSend" class="screen">
            <button class="back-btn" type="button" @click="newUser = false">
                <Icon name="ion:caret-back" size="14px" /> Volver
            </button>
            <div class="brand">
                <h1 class="brand-name">Crear cuenta</h1>
                <p class="brand-sub">Elige tu nombre y contraseña</p>
            </div>
            <form class="card" @submit.prevent="nameSend = true">
                <fieldset class="field">
                    <label for="reg-name">Nombre de usuario</label>
                    <input v-model="name" type="text" id="reg-name" name="name" autocomplete="username"
                        placeholder="Tu nombre único" required />
                </fieldset>
                <fieldset class="field">
                    <label for="reg-pass">Contraseña</label>
                    <input v-model="pass" type="password" id="reg-pass" name="pass" autocomplete="new-password"
                        placeholder="••••••••" required />
                </fieldset>
                <button type="submit" class="btn-primary">Continuar</button>
            </form>
        </div>

        <!-- ── REGISTER STEP 2 ────────────────────────────── -->
        <div v-else-if="!profileSend" class="screen screen--profile">
            <header class="profile-header">
                <button class="back-btn" type="button" @click="nameSend = false">
                    <Icon name="ion:caret-back" size="14px" /> Volver
                </button>
                <h1 class="brand-name">Tu perfil</h1>
                <p class="brand-sub">Cuéntanos sobre ti (opcional)</p>
            </header>

            <form class="profile-grid" @submit.prevent="profileSend = true">
                <fieldset class="field">
                    <label for="gender">Género</label>
                    <input v-model="gender" type="text" id="gender" placeholder="Ej: Hombre" />
                </fieldset>
                <fieldset class="field">
                    <label for="pronoun">Pronombre</label>
                    <input v-model="pronoun" type="text" id="pronoun" placeholder="Ej: Él" />
                </fieldset>
                <fieldset class="field">
                    <label for="height">Estatura (cm)</label>
                    <input v-model="height" type="number" id="height" placeholder="Ej: 175" />
                </fieldset>
                <fieldset class="field">
                    <label for="weight">Peso (kg)</label>
                    <input v-model="weight" type="number" id="weight" placeholder="Ej: 70" />
                </fieldset>
                <fieldset class="field">
                    <label for="age">Edad</label>
                    <input v-model="age" type="number" id="age" placeholder="Ej: 25" />
                </fieldset>
                <fieldset class="field">
                    <label for="rol">Rol</label>
                    <input v-model="rol" type="text" id="rol" placeholder="Activo / Pasivo…" />
                </fieldset>
                <fieldset class="field">
                    <label for="ethnicity">Etnia</label>
                    <input v-model="ethnicity" type="text" id="ethnicity" placeholder="Ej: Latino" />
                </fieldset>
                <fieldset class="field">
                    <label for="rel_status">Estado civil</label>
                    <input v-model="rel_status" type="text" id="rel_status" placeholder="Ej: Soltero" />
                </fieldset>
                <fieldset class="field">
                    <label for="search">Busca</label>
                    <input type="text" id="search" placeholder="Ej: Amistad"
                        @change="($event) => search.push(($event.target as HTMLInputElement).value)" />
                </fieldset>
                <fieldset class="field">
                    <label for="encounter">Encuentro</label>
                    <input type="text" id="encounter" placeholder="Ej: Mi lugar"
                        @change="($event) => encounter.push(($event.target as HTMLInputElement).value)" />
                </fieldset>
                <fieldset class="field">
                    <label for="vaccines">Vacunas</label>
                    <input type="text" id="vaccines" placeholder="Ej: COVID-19"
                        @change="($event) => vaccines.push(($event.target as HTMLInputElement).value)" />
                </fieldset>
                <fieldset class="field">
                    <label for="vih">VIH</label>
                    <input v-model="vih" type="text" id="vih" placeholder="Negativo / Positivo…" />
                </fieldset>
                <fieldset class="field">
                    <label for="prep">PrEP</label>
                    <input v-model="prep" type="text" id="prep" placeholder="Sí / No" />
                </fieldset>
                <fieldset class="field">
                    <label for="tags">Tags</label>
                    <input type="text" id="tags" placeholder="Ej: amigos, cruising…"
                        @change="($event) => tags.push(($event.target as HTMLInputElement).value)" />
                </fieldset>

                <div class="submit-row">
                    <button type="submit" class="btn-primary">Continuar</button>
                </div>
            </form>
        </div>

        <!-- ── REGISTER STEP 3 ────────────────────────────── -->
        <div v-else class="screen">
            <button class="back-btn" type="button" @click="profileSend = false">
                <Icon name="ion:caret-back" size="14px" /> Volver
            </button>
            <div class="brand">
                <h1 class="brand-name">Tu foto</h1>
                <p class="brand-sub">Descríbete para generar tu imagen de perfil</p>
            </div>

            <div class="card">
                <fieldset class="field">
                    <label for="sim-desc">Descripción</label>
                    <textarea
                        v-model="simDescription"
                        id="sim-desc"
                        class="field-textarea"
                        rows="4"
                        placeholder="Ej: Hombre moreno de ojos café, barba corta, aspecto casual y relajado…"
                    />
                </fieldset>

                <p v-if="photoError" class="form-msg form-msg--error">{{ photoError }}</p>

                <button
                    type="button"
                    class="btn-ghost"
                    :disabled="photoLoading"
                    @click="generatePhoto"
                >
                    {{ photoLoading ? 'Generando…' : 'Generar foto' }}
                </button>

                <div v-if="generatedPhoto" class="photo-preview">
                    <img :src="generatedPhoto" alt="Foto generada" class="preview-img" />
                    <p class="preview-hint">¿No te convence? Edita la descripción y genera de nuevo.</p>
                </div>

                <button
                    type="button"
                    class="btn-primary"
                    :disabled="createLoading || photoLoading"
                    @click="createUser"
                >
                    {{ createLoading ? 'Creando cuenta…' : 'Crear cuenta' }}
                </button>
            </div>
        </div>

    </main>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────── */
.view {
    min-height: 100vh;
    background: var(--black);
    color: var(--white);
    overflow-y: auto;
}

/* ── Screens ──────────────────────────────────────────── */
.screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    gap: 32px;
}

.screen--profile {
    justify-content: flex-start;
    padding-top: 28px;
    padding-bottom: 56px;
    gap: 0;
}

/* ── Brand ────────────────────────────────────────────── */
.brand {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.brand-icon {
    color: var(--yellow);
    filter: drop-shadow(0 0 14px rgba(255, 188, 66, 0.45));
}

.brand-name {
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: var(--white);
    margin: 0;
}

.brand-sub {
    font-size: 0.88rem;
    color: var(--gray);
    margin: 0;
}

/* ── Login / step-1 card ──────────────────────────────── */
.card {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* ── Fields ───────────────────────────────────────────── */
.field {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--yellow);
    letter-spacing: 0.4px;
    text-transform: uppercase;
}

.field input {
    background: var(--black-soft);
    border: 1px solid rgba(255, 188, 66, 0.25);
    border-radius: 12px;
    color: var(--white-soft);
    font-size: 15px;
    height: 48px;
    padding: 0 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    -webkit-appearance: none;
}

.field input:focus {
    border-color: var(--yellow);
    box-shadow: 0 0 0 3px rgba(255, 188, 66, 0.12);
}

.field input::placeholder {
    color: var(--gray);
    opacity: 0.6;
}

/* ── Form messages ────────────────────────────────────── */
.form-msg {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    padding: 10px 14px;
    border-radius: 10px;
}

.form-msg--error {
    background: rgba(255, 107, 107, 0.12);
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.25);
}

.form-msg--success {
    background: rgba(66, 209, 125, 0.12);
    color: #42d17d;
    border: 1px solid rgba(66, 209, 125, 0.25);
}

/* ── Buttons ──────────────────────────────────────────── */
.btn-primary {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 14px;
    background: var(--yellow);
    color: var(--black);
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.08s ease;
    -webkit-appearance: none;
}

.btn-primary:hover {
    opacity: 0.88;
}

.btn-primary:active {
    transform: translateY(1px);
    opacity: 0.8;
}

.btn-ghost {
    width: 100%;
    height: 50px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 14px;
    background: transparent;
    color: var(--white);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    -webkit-appearance: none;
}

.btn-ghost:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
}

/* ── Back button ──────────────────────────────────────── */
.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: var(--gray);
    font-size: 0.88rem;
    cursor: pointer;
    padding: 4px 0;
    align-self: flex-start;
    transition: color 0.15s ease;
}

.back-btn:hover {
    color: var(--white);
}

/* ── Step-2 header ────────────────────────────────────── */
.profile-header {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 24px;
}

.profile-header .brand-name {
    font-size: 1.6rem;
    margin-top: 6px;
}

/* ── Profile grid ─────────────────────────────────────── */
.profile-grid {
    width: 100%;
    max-width: 500px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 14px;
}

.profile-grid .field input {
    height: 44px;
    font-size: 14px;
}

.submit-row {
    grid-column: 1 / 3;
    padding-top: 8px;
}

/* ── Step 3 ───────────────────────────────────────────── */
.field-textarea {
    background: var(--black-soft);
    border: 1px solid rgba(255, 188, 66, 0.25);
    border-radius: 12px;
    color: var(--white-soft);
    font-size: 15px;
    padding: 12px 14px;
    width: 100%;
    outline: none;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-textarea:focus {
    border-color: var(--yellow);
    box-shadow: 0 0 0 3px rgba(255, 188, 66, 0.12);
}

.field-textarea::placeholder {
    color: var(--gray);
    opacity: 0.6;
}

.photo-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.preview-img {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--yellow);
    box-shadow: 0 0 18px rgba(255, 188, 66, 0.3);
}

.preview-hint {
    font-size: 0.78rem;
    color: var(--gray);
    text-align: center;
    margin: 0;
}
</style>
