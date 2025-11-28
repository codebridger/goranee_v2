<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
  as?: string
  class?: string
}>()

const tag = computed(
  () =>
    props.as ||
    (props.variant === 'body' || props.variant === 'caption' ? 'p' : props.variant || 'p'),
)

const classes = computed(() => {
  const base = 'text-text-primary transition-colors duration-300'
  const variants = {
    h1: 'font-heading font-black text-5xl md:text-7xl tracking-tight leading-tight',
    h2: 'font-heading font-bold text-3xl md:text-4xl',
    h3: 'font-heading font-semibold text-xl',
    body: 'font-sans text-base leading-relaxed',
    caption: 'font-sans text-[13px] font-medium uppercase tracking-wider',
  }

  return `${base} ${variants[props.variant || 'body']} ${props.class || ''}`
})
</script>

<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>
