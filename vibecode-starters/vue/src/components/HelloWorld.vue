<template>
  <div class="hello" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #0a0a0a; color: white; font-family: system-ui, sans-serif;">
    <h1 style="font-size: 3rem; margin-bottom: 1rem;">VibeCode Vue</h1>
    <p style="font-size: 1.2rem; opacity: 0.8;">
      Edit <code style="background: #333; padding: 0.2rem 0.4rem; borderRadius: 4px;">src/App.vue</code> to get started.
    </p>
    <div style="margin-top: 2rem;">
      <a href="https://vitejs.dev" target="_blank" rel="noopener" style="color: #42b983; margin: 0 10px;">Vite Docs</a>
      <a href="https://vuejs.org" target="_blank" rel="noopener" style="color: #42b983; margin: 0 10px;">Vue.js Docs</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
