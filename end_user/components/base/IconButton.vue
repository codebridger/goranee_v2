<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from '~/components/base/Tooltip.vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon: any
  ariaLabel: string
  title?: string
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
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-muted',
  }

  const sizes = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
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
  <Tooltip :text="title || ''" position="top">
    <button :class="classes.button" :aria-label="ariaLabel" @click="emit('click')">
      <component :is="icon" :class="[classes.icon, variant === 'primary' ? 'fill-current' : '']" />
    </button>
  </Tooltip>
</template>
