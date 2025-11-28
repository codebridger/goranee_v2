<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  disabled?: boolean;
  to?: string;
  href?: string;
}>();

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-grad-primary text-white shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 active:scale-95',
    secondary: 'bg-transparent border border-border-subtle text-text-primary hover:bg-surface-base/50',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return `
    ${base}
    ${variants[props.variant || 'primary']}
    ${sizes[props.size || 'md']}
    ${props.block ? 'w-full' : ''}
  `;
});

const componentType = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});
</script>

<template>
  <component 
    :is="componentType" 
    :to="to" 
    :href="href" 
    :class="classes"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>
