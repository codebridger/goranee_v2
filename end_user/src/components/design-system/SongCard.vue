<script setup lang="ts">
import { computed } from 'vue';
import { Play } from 'lucide-vue-next';

const props = defineProps<{
	title: string;
	artist: string;
	imageUrl?: string;
	imageGradient?: string;
	musicalKey?: string;
	tempo?: string;
}>();

const emit = defineEmits<{
	(e: 'click'): void;
}>();

const gradientClass = computed(() => {
	return props.imageGradient || 'from-indigo-500 to-purple-600';
});

const imageStyle = computed(() => {
	if (props.imageUrl) {
		return {
			backgroundImage: `url(${props.imageUrl})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		};
	}
	return {};
});
</script>

<template>
	<div class="group relative bg-surface-card rounded-3xl p-4 shadow-md hover:shadow-hover hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-border-subtle"
		@click="emit('click')">
		<!-- Image Thumbnail -->
		<div class="h-48 rounded-2xl bg-gradient-to-br mb-4 relative overflow-hidden shadow-inner"
			:class="gradientClass" :style="imageStyle">
			<!-- Hover Overlay with Play Button -->
			<div
				class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm">
				<div
					class="w-14 h-14 rounded-full bg-grad-primary flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300">
					<Play class="w-6 h-6 text-white fill-current ms-1" />
				</div>
			</div>
		</div>

		<!-- Song Info -->
		<div class="flex justify-between items-start">
			<div>
				<h3 class="font-bold text-lg text-text-primary leading-tight mb-1">{{ title }}</h3>
				<p class="text-sm text-text-secondary">{{ artist }}</p>
			</div>

			<!-- Badges -->
			<div class="flex flex-col items-end gap-1">
				<div v-if="musicalKey"
					class="px-2 py-1 rounded-md text-xs font-bold border min-w-[30px] text-center bg-surface-base border-border-subtle text-text-secondary">
					{{ musicalKey }}
				</div>
				<div v-if="tempo"
					class="bg-text-accent/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-text-accent border border-text-accent/20">
					{{ tempo }}
				</div>
			</div>
		</div>
	</div>
</template>
