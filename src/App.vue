<template>
  <div class="app">
    <NavBar />
    <main>
      <router-view />
    </main>
    <footer>
      <p>CinéVersus - Projet Vue.js © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f9f9f9;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 20px;
}

footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 15px;
  margin-top: 40px;
}
</style> 