<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  icon?: any;
}>();

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-bold text-text-secondary ml-1">{{ label }}</label>
    <div class="relative group">
      <div v-if="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-text-accent transition-colors">
        <component :is="icon" class="w-5 h-5" />
      </div>
      <input
        v-model="value"
        :type="type || 'text'"
        :placeholder="placeholder"
        class="w-full bg-surface-card/50 dark:bg-white/5 border border-transparent focus:border-transparent focus:ring-2 focus:ring-pink-500/50 rounded-full py-3 px-6 text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-300"
        :class="{ 'pl-12': icon }"
      />
    </div>
  </div>
</template>
