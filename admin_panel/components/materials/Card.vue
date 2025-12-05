<template>
  <div class="card rounded-lg shadow-xl">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Card',
}
</script>

<style scoped>
.card {
  background: white;
  overflow: hidden;
}
</style>