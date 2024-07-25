<template>
  <main class="view">
    <form class="form">
      <fieldset class="field">
        <label for="uname">Nombre de Usuario</label>
        <input type="text" id="uname" name="uname" />
      </fieldset>
      <fieldset class="field">
        <label for="umail">Email</label>
        <input type="text" id="umail" name="umail" />
      </fieldset>
      <button class="btn-login">Iniciar Sesion</button>
    </form>
  </main>
</template>

<style scoped>
.view {
  height: 100vh;
}
.form {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.field {
  text-align: center;
  margin: 5px;
  border: none;
}
.field label {
  font-weight: 500;
  font-size: 1.2em;
  display: block;
  margin-bottom: 6px;
}
.field input {
  background-color: var(--black);
  border: 1px solid var(--white-soft);
  border-radius: 15px;
  box-shadow: none;
  height: 2.5em;
  width: 300px;
}
.btn-login {
  background-color: var(--white-soft);
  box-shadow: none;
  color: var(--black-mute);
  font-weight: 600;
  border-style: hidden;
  border-radius: 30px;
  height: 2.5em;
  width: 150px;
}
</style>
