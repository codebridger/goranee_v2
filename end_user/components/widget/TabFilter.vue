<script setup lang="ts">
defineProps<{
  tabs: string[]
  activeTab: string
}>()

defineEmits(['change'])
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="$emit('change', tab)"
      class="px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap border cursor-pointer"
      :class="[
        activeTab === tab
          ? 'bg-text-primary text-surface-base shadow-lg scale-105 border-transparent'
          : 'bg-surface-card text-text-secondary hover:bg-surface-base border-transparent hover:border-border-subtle',
      ]"
    >
      {{ tab }}
    </button>
  </div>
</template>
