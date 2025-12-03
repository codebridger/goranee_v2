<script setup lang="ts">
import type { SongWithPopulatedRefs } from '~/types/song.type';
import { ROUTES } from '~/constants/routes';

interface Props {
	artistName?: string
	artistSongs?: SongWithPopulatedRefs[]
	similarSongs?: SongWithPopulatedRefs[]
}

defineProps<Props>()
</script>

<template>
	<div class="space-y-8">
		<!-- Artist Top Songs -->
		<div v-if="artistSongs && artistSongs.length > 0"
			class="bg-surface-base rounded-xl p-6 border border-border-subtle">
			<h3 class="text-xs font-bold uppercase text-text-muted mb-4 tracking-wider">
				More by {{ artistName || 'Artist' }}
			</h3>
			<div class="space-y-4">
				<NuxtLink v-for="song in artistSongs.slice(0, 5)" :key="song._id" :to="ROUTES.TAB.DETAIL(song._id)"
					class="flex items-center gap-3 group">
					<div
						class="w-10 h-10 rounded bg-surface-muted flex items-center justify-center text-xs text-text-muted group-hover:text-primary transition-colors">
						♪
					</div>
					<div class="flex-1 min-w-0">
						<div
							class="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
							{{ song.title }}
						</div>
						<div class="text-xs text-text-muted truncate">
							{{ song.rhythm }} • {{ song.chords?.keySignature || '?' }}
						</div>
					</div>
				</NuxtLink>
			</div>
		</div>

		<!-- Ad Space Placeholder -->
		<!-- <div
			class="bg-surface-muted rounded-xl h-64 flex items-center justify-center border border-dashed border-border-subtle">
			<span class="text-xs font-bold text-text-muted uppercase">Ad Space</span>
		</div> -->

		<!-- Similar Vibe (Mock) -->
		<div v-if="similarSongs && similarSongs.length > 0"
			class="bg-surface-base rounded-xl p-6 border border-border-subtle">
			<h3 class="text-xs font-bold uppercase text-text-muted mb-4 tracking-wider">
				Similar Vibe
			</h3>
			<div class="space-y-4">
				<NuxtLink v-for="song in similarSongs.slice(0, 5)" :key="song._id" :to="ROUTES.TAB.DETAIL(song._id)"
					class="flex items-center gap-3 group">
					<div
						class="w-10 h-10 rounded bg-surface-muted flex items-center justify-center text-xs text-text-muted group-hover:text-secondary transition-colors">
						⚡
					</div>
					<div class="flex-1 min-w-0">
						<div
							class="text-sm font-bold text-text-primary truncate group-hover:text-secondary transition-colors">
							{{ song.title }}
						</div>
						<div class="text-xs text-text-muted truncate">
							{{ song.rhythm }}
						</div>
					</div>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
