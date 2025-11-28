<script setup lang="ts">
defineProps<{
	modelValue: boolean;
	label?: string;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
	<div class="flex items-center gap-3 p-3 rounded-2xl border border-border-subtle bg-surface-card">
		<button @click="$emit('update:modelValue', !modelValue)"
			class="w-10 h-6 rounded-full p-1 flex items-center transition-colors duration-300"
			:class="modelValue ? 'bg-text-accent justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'">
			<div class="w-4 h-4 bg-white rounded-full shadow-sm"></div>
		</button>
		<span v-if="label" class="text-sm font-bold text-text-primary">{{ label }}</span>
	</div>
</template>
