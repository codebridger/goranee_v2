<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'song' | 'artist' | 'default';
  hoverable?: boolean;
}>();

const classes = computed(() => {
  const base = 'bg-surface-card rounded-3xl border border-border-subtle overflow-hidden transition-all duration-300';
  const hover = props.hoverable ? 'hover:shadow-hover hover:-translate-y-2 cursor-pointer' : '';

  if (props.variant === 'artist') {
    return 'flex flex-col items-center gap-3 group';
  }

  return `${base} ${hover} ${props.variant === 'song' ? 'p-4' : 'p-6'}`;
});
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
