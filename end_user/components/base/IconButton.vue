<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon: any
  ariaLabel: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const classes = computed(() => {
  const base = 'rounded-full flex items-center justify-center transition cursor-pointer'

  const variants = {
    primary: 'bg-grad-primary text-white shadow-md hover:scale-105',
    secondary:
      'bg-surface-card border border-border-subtle text-text-secondary hover:text-text-accent',
  }

  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return {
    button: `${base} ${variants[props.variant || 'primary']} ${sizes[props.size || 'md']}`,
    icon: iconSizes[props.size || 'md'],
  }
})
</script>

<template>
  <button :class="classes.button" :aria-label="ariaLabel" @click="emit('click')">
    <component :is="icon" :class="[classes.icon, variant === 'primary' ? 'fill-current' : '']" />
  </button>
</template>
