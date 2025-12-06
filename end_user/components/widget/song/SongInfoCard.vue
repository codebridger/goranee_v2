<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Artist } from '~/types/song.type'

interface Props {
	variant?: 'desktop' | 'mobile'
	title: string
	artist?: Artist
	rhythm?: string
	originalKey?: string
	image?: string
	difficulty?: string
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'desktop'
})

const { t } = useI18n()

// Extract artist name from content object
const artistName = computed(() => {
  if (!props.artist) return ''
  // New structure with content object
  if (props.artist.content) {
    const defaultLang = props.artist.defaultLang || 'ckb-IR'
    return props.artist.content[defaultLang]?.name || props.artist.content['ckb-IR']?.name || ''
  }
  // Fallback to old structure (for backward compatibility during migration)
  return (props.artist as any).name || ''
})

// Helper for safe image URL
const getArtistImage = (artist?: Artist) => {
	return 'https://placehold.co/600x600/130A12/FF2E93?text=' + (artistName.value || 'Artist')
}

const bgImage = computed(() => props.image || getArtistImage(props.artist))
</script>

<template>
	<div v-if="variant === 'desktop'"
		class="bg-surface-base rounded-2xl overflow-hidden shadow-lg border border-border-subtle">
		<!-- Cover Image -->
		<div class="relative h-64 w-full overflow-hidden group flex items-center justify-center">
			<div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
				:style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: 'top center' }"></div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
		</div>

		<!-- Content -->
		<div class="p-6 -mt-12 relative z-10">
			<!-- Metadata Tags (Moved to top right) -->
			<div class="flex justify-end flex-wrap gap-2 mb-4">
				<span v-if="rhythm"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.rhythm') }}:</span>
					<span class="text-xs font-bold font-mono text-text-primary">{{ rhythm }}</span>
				</span>
				<span v-if="originalKey"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.key') }}:</span>
					<span class="text-xs font-bold font-mono text-text-primary">{{ originalKey }}</span>
				</span>
				<span v-if="difficulty"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border-subtle shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.difficulty') }}:</span>
					<span class="text-xs font-bold text-text-primary">{{ difficulty }}</span>
				</span>
			</div>

			<!-- Text Info -->
			<div class="space-y-4">
				<div>
					<h1 class="text-2xl font-bold text-text-primary leading-tight mb-1">
						{{ title }}
					</h1>
					<p v-if="artistName" class="text-sm text-text-secondary">
						{{ artistName }}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- MOBILE VARIANT -->
	<div v-else class="relative overflow-hidden rounded-2xl bg-surface-base border border-border-subtle mb-6">
		<!-- Background Blur -->
		<div class="absolute inset-0 z-0 opacity-30">
			<div class="absolute inset-0 bg-cover bg-center blur-xl scale-150"
				:style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: 'center center' }"></div>
			<div class="absolute inset-0 bg-surface-base/80 backdrop-blur-sm"></div>
		</div>

		<div class="relative z-10 p-4 flex items-center gap-4">
			<!-- Tiny Thumbnail -->
			<div class="w-16 h-16 rounded-lg bg-cover bg-center shadow-sm shrink-0 flex items-center justify-center"
				:style="{ backgroundImage: `url(${bgImage})`, backgroundPosition: 'center center' }"></div>

			<!-- Info -->
			<div class="flex-1 min-w-0">
				<h1 class="text-lg font-bold text-text-primary truncate leading-tight">
					{{ title }}
				</h1>
				<p v-if="artistName" class="text-xs text-text-secondary truncate mt-0.5">
					{{ artistName }}
				</p>
			</div>

			<!-- Metadata Tags (Moved to right side) -->
			<div class="flex flex-col items-end gap-1.5 shrink-0">
				<span v-if="originalKey"
					class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-card shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.key') }}:</span>
					<span class="text-xs font-mono text-text-primary">{{ originalKey }}</span>
				</span>
				<span v-if="rhythm"
					class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-card shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.rhythm') }}:</span>
					<span class="text-xs font-mono text-text-primary">{{ rhythm }}</span>
				</span>
				<span v-if="difficulty"
					class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-card shadow-sm">
					<span class="text-xs font-medium text-text-secondary">{{ t('song.metadata.difficulty')
					}}:</span>
					<span class="text-xs text-text-primary">{{ difficulty }}</span>
				</span>
			</div>
		</div>
	</div>
</template>
