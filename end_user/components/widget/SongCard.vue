<script setup lang="ts">
import { computed } from 'vue';
import { Play } from 'lucide-vue-next';
import { fileProvider } from '@modular-rest/client';
import type { SongWithPopulatedRefs } from '~/types/song.type';

const props = defineProps<{
	song: SongWithPopulatedRefs;
}>();

const emit = defineEmits<{
	(e: 'click'): void;
}>();

const { t } = useI18n();

const title = computed(() => props.song.title);

const artist = computed(() => {
	return props.song.artists && props.song.artists[0]
		? props.song.artists[0].name
		: t('common.unknownArtist');
});



const imageUrl = computed(() => {
	return props.song.image ? fileProvider.getFileLink(props.song.image as any) : undefined;
});

const musicalKey = computed(() => props.song.chords?.keySignature);
const chordLabels = computed(() => props.song.chords?.list?.map((chord) => chord.title) || []);
const tempo = computed(() => props.song.rhythm);

const gradientClass = computed(() => {
	const mockColor = (props.song as any)._mockColor;
	return mockColor
		? `from-${mockColor}-400 to-${mockColor}-600`
		: 'from-indigo-500 to-purple-600';
});

const imageStyle = computed(() => {
	if (imageUrl.value) {
		return {
			backgroundImage: `url(${imageUrl.value})`,
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
		<div class="h-48 rounded-2xl bg-linear-to-br mb-4 relative overflow-hidden shadow-inner" :class="gradientClass"
			:style="imageStyle">
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
			<div class="">
				<h3 class="font-bold text-lg text-text-primary leading-tight mb-1">{{ title }}</h3>
				<p class="text-sm text-text-secondary">{{ artist }}</p>
			</div>

			<!-- Badges -->
			<div class="flex flex-col items-end gap-1">
				<div v-if="tempo"
					class="bg-text-accent/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-text-accent border border-text-accent/20">
					{{ tempo }}
				</div>
				<div v-if="musicalKey"
					class="px-2 py-1 rounded-md text-xs font-bold border text-center bg-surface-base border-border-subtle text-text-secondary whitespace-nowrap">
					{{ chordLabels.slice(0, 3).join(', ') || musicalKey }}
				</div>
			</div>
		</div>
	</div>
</template>
