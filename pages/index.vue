<script setup lang="ts">
const { currentUser, setUserData } = useUserData();
const emit = defineEmits(["showMenu"]);
let newUser = ref(false);
let nameSend = ref(false);

let name = ref(null);
let pass = ref(null);
let gender = ref(null);
let pronoun = ref(null);
let height = ref(null);
let weight = ref(null);
let age = ref(null);
let rol = ref(null);
let ethnicity = ref(null);
let rel_status = ref(null);
let search = ref([]);
let encounter = ref([]);
let vaccines = ref([]);
let vih = ref(null);
let prep = ref(null);
let tags = ref([]);

const loginUser = async (e: Event) => {
  e.preventDefault();

  const user = await $fetch(`/api/user/byName/${name.value}`);
  if (user && pass.value == user.pass) {
    navigateTo("/main");
    setUserData(user);
    emit("showMenu", true);
    return;
  }
};

const createUser = async (e: Event, nameSend: Boolean) => {
  e.preventDefault();
  const body = {
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
  };
  const res = await $fetch("/api/user", {
    method: "post",
    body,
  });
  navigateTo("/main");
  emit("showMenu", true);
  setUserData(res);
};

onBeforeMount(() => {
  emit("showMenu", false);
});
</script>

<template>
  <main class="view">
    <form v-if="!newUser">
      <div class="form">
        <fieldset class="field">
          <label for="name">Nombre de Usuario</label>
          <input
            @change="($event) => (name = $event.target?.value)"
            type="text"
            id="login-name"
            name="login-name"
          />
        </fieldset>
        <fieldset class="field">
          <label for="name">Contraseña</label>
          <input
            @change="($event) => (pass = $event.target?.value)"
            type="password"
            id="login-pass"
            name="login-pass"
          />
        </fieldset>
        <button @click="loginUser" class="btn-sendForm">Iniciar Sesion</button>
        <div @click="newUser = true" class="link-register">Registrarte</div>
      </div>
    </form>
    <form>
      <div v-if="newUser && !nameSend" class="form">
        <fieldset class="field">
          <label for="name">Nombre de Usuario</label>
          <input
            @change="($event) => (name = $event.target?.value)"
            type="text"
            id="name"
            name="name"
          />
        </fieldset>
        <fieldset class="field">
          <label for="name">Contraseña</label>
          <input
            @change="($event) => (pass = $event.target?.value)"
            type="password"
            id="pass"
            name="pass"
          />
        </fieldset>
        <button @click="nameSend = true" class="btn-sendForm">
          Crear Usuario
        </button>
      </div>
      <div v-else class="form user-info">
        <fieldset class="field">
          <label for="gender">Genero</label>
          <input
            @change="($event) => (gender = $event.target?.value)"
            type="text"
            id="gender"
            name="gender"
          />
        </fieldset>
        <fieldset class="field">
          <label for="pronoun">Pronombre</label>
          <input
            @change="($event) => (pronoun = $event.target?.value)"
            type="text"
            id="pronoun"
            name="pronoun"
          />
        </fieldset>
        <fieldset class="field">
          <label for="height">Estatura</label>
          <input
            @change="($event) => (height = $event.target?.value)"
            type="number"
            id="height"
            name="height"
          />
        </fieldset>
        <fieldset class="field">
          <label for="weight">Peso</label>
          <input
            @change="($event) => (weight = $event.target?.value)"
            type="number"
            id="weight"
            name="weight"
          />
        </fieldset>
        <fieldset class="field">
          <label for="age">Edad</label>
          <input
            @change="($event) => (age = $event.target?.value)"
            type="number"
            id="age"
            name="age"
          />
        </fieldset>
        <fieldset class="field">
          <label for="rol">Rol</label>
          <input
            @change="($event) => (rol = $event.target?.value)"
            type="text"
            id="rol"
            name="rol"
          />
        </fieldset>
        <fieldset class="field">
          <label for="ethnicity">Etnia</label>
          <input
            @change="($event) => (ethnicity = $event.target?.value)"
            type="text"
            id="ethnicity"
            name="ethnicity"
          />
        </fieldset>
        <fieldset class="field">
          <label for="rel_status">Estado Civil</label>
          <input
            @change="($event) => (rel_status = $event.target?.value)"
            type="text"
            id="rel_status"
            name="rel_status"
          />
        </fieldset>
        <fieldset class="field">
          <label for="search">Busca</label>
          <input
            @change="($event) => search.push($event.target?.value)"
            type="text"
            id="search"
            name="search"
          />
        </fieldset>
        <fieldset class="field">
          <label for="encounter">Encuentro</label>
          <input
            @change="($event) => encounter.push($event.target?.value)"
            type="text"
            id="encounter"
            name="encounter"
          />
        </fieldset>
        <fieldset class="field">
          <label for="vaccines">Vacunas</label>
          <input
            @change="($event) => vaccines.push($event.target?.value)"
            type="text"
            id="vaccines"
            name="vaccines"
          />
        </fieldset>
        <fieldset class="field">
          <label for="vih">VIH</label>
          <input
            @change="($event) => (vih = $event.target?.value)"
            type="text"
            id="vih"
            name="vih"
          />
        </fieldset>
        <fieldset class="field">
          <label for="prep">PrEP</label>
          <input
            @change="($event) => (prep = $event.target?.value)"
            type="text"
            id="prep"
            name="prep"
          />
        </fieldset>
        <fieldset class="field">
          <label for="tags">Tags</label>
          <input
            @change="($event) => tags.push($event.target?.value)"
            type="text"
            id="tags"
            name="tags"
          />
        </fieldset>
        <button @click="createUser" class="btn-sendForm">Crear Usuario</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.view {
  height: 100vh;
}
form {
  height: 100%;
}
.form {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.form.user-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 6em 6em 6em 6em 6em;
  align-content: center;
}
.field {
  padding: 4px;
  text-align: center;
  vertical-align: center;
  border: none;
}
.field label {
  font-weight: 500;
  font-size: 1.2em;
  display: block;
  margin-bottom: 6px;
}
.field input {
  text-align: center;
  color: var(--white-soft);
  background-color: var(--black);
  border: 1px solid var(--white-soft);
  border-radius: 15px;
  box-shadow: none;
  height: 2.5em;
  width: 45vw;
}
.btn-sendForm {
  grid-column: 1/3;
  background-color: var(--white-soft);
  box-shadow: none;
  color: var(--black-mute);
  font-weight: 600;
  border-style: hidden;
  border-radius: 30px;
  height: 2.5em;
  width: 150px;
  margin: 1.2em auto;
}
</style>
