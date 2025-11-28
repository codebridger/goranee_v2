<script setup lang="ts">
const props = defineProps<{
	title: string;
	subtitle?: string;
	icon?: any;
}>();
</script>

<template>
	<div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
		<div class="flex items-center gap-3">
			<component v-if="icon" :is="icon" class="w-8 h-8 text-text-accent" />
			<div>
				<h2 class="text-3xl font-black tracking-tight text-text-primary">{{ title }}</h2>
				<p v-if="subtitle" class="text-text-secondary mt-1">{{ subtitle }}</p>
			</div>
		</div>
	</div>
</template>
