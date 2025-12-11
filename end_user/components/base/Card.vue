<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'song' | 'artist' | 'default' | 'section';
  hoverable?: boolean;
  title?: string;
}>();

const classes = computed(() => {
  const base = 'bg-surface-card rounded-3xl border border-border-subtle overflow-hidden transition-all duration-300';
  const hover = props.hoverable ? 'hover:shadow-hover hover:-translate-y-2 cursor-pointer' : '';

  if (props.variant === 'artist') {
    return 'flex flex-col items-center gap-3 group';
  }

  if (props.variant === 'section') {
    return 'bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm';
  }

  return `${base} ${hover} ${props.variant === 'song' ? 'p-4' : 'p-6'}`;
});
</script>

<template>
  <div :class="classes">
    <div v-if="title && variant === 'section'" class="flex items-center justify-between mb-3">
      <div class="text-xs font-bold text-text-muted uppercase">
        {{ title }}
      </div>
      <slot name="header-action" />
    </div>
    <slot />
  </div>
</template>
