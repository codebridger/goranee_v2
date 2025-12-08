<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  direction: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const buttonClasses = computed(() => {
  const base = 'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-base/90 transition-all cursor-pointer group'
  
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }
  
  const positions = {
    left: 'left-0',
    right: 'right-0',
  }
  
  return `${base} ${sizes[props.size]} ${positions[props.direction]}`
})

const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :class="buttonClasses"
    :aria-label="ariaLabel"
    @click="emit('click')">
    <component
      :is="direction === 'left' ? ChevronLeft : ChevronRight"
      :class="iconClasses"
      class="text-text-primary/60 group-hover:text-text-primary transition-colors" />
  </button>
</template>

