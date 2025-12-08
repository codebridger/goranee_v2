<template>
  <div>
    <label class="block mb-2">{{ label }}</label>
    <textarea
      :value="value"
      @input="$emit('input', $event.target.value)"
      :rows="rows || 5"
      class="w-full p-2 border border-gray-300 rounded"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    label: String,
    placeholder: String,
    rows: Number,
  },
}
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>

