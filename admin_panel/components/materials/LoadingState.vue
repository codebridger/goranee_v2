<template>
  <div v-if="active" class="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
