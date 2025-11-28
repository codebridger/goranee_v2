<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	name: string;
	songCount: number;
	avatarUrl?: string;
	gradientBorder?: string;
}>();

const emit = defineEmits<{
	(e: 'click'): void;
}>();

const gradientClass = computed(() => {
	return props.gradientBorder || 'from-orange-400 to-red-500';
});

const avatarStyle = computed(() => {
	if (props.avatarUrl) {
		return {
			backgroundImage: `url(${props.avatarUrl})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		};
	}
	return {};
});
</script>

<template>
	<div class="flex flex-col items-center justify-center p-8 rounded-3xl border border-border-subtle bg-surface-card cursor-pointer"
		@click="emit('click')">
		<div class="relative group">
			<!-- Avatar with Gradient Border -->
			<div class="w-32 h-32 rounded-full bg-gradient-to-br p-[4px] mb-4 group-hover:scale-105 transition duration-300 shadow-xl"
				:class="gradientClass">
				<div class="w-full h-full rounded-full border-4 border-surface-card overflow-hidden relative bg-gray-200 dark:bg-gray-800"
					:style="avatarStyle">
					<!-- Placeholder if no image -->
					<div v-if="!avatarUrl" class="absolute inset-0 bg-gray-500/20"></div>
				</div>
			</div>
		</div>

		<!-- Artist Info -->
		<h3 class="font-bold text-xl text-text-primary mb-1">{{ name }}</h3>
		<p class="text-sm text-pink-500 font-bold">{{ songCount }} Songs</p>
	</div>
</template>
