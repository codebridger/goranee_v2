<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	label: string;
	variant?: 'neutral' | 'accent';
	size?: 'sm' | 'md';
	icon?: any;
}>();

const classes = computed(() => {
	const base = 'inline-flex items-center gap-1 rounded-md font-bold border';

	const variants = {
		neutral: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/5',
		accent: 'bg-text-accent/10 text-text-accent border-text-accent/20',
	};

	const sizes = {
		sm: 'px-2 py-0.5 text-[10px]',
		md: 'px-3 py-1 text-xs',
	};

	return `${base} ${variants[props.variant || 'neutral']} ${sizes[props.size || 'md']}`;
});
</script>

<template>
	<span :class="classes">
		<component v-if="icon" :is="icon" class="w-3 h-3" />
		{{ label }}
	</span>
</template>
