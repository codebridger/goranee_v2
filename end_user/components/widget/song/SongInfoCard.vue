<script setup lang="ts">
import { computed } from 'vue'
import { Play, Heart } from 'lucide-vue-next'
import type { Artist } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'

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

// Helper for safe image URL
const getArtistImage = (artist?: Artist) => {
	return 'https://placehold.co/600x600/130A12/FF2E93?text=' + (artist?.name || 'Artist')
}

const bgImage = computed(() => props.image || getArtistImage(props.artist))
</script>

<template>
	<div v-if="variant === 'desktop'"
		class="bg-surface-base rounded-2xl overflow-hidden shadow-lg border border-border-subtle">
		<!-- Cover Image -->
		<div class="relative h-64 w-full overflow-hidden group">
			<div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
				:style="{ backgroundImage: `url(${bgImage})` }"></div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

			<!-- Top Actions -->
			<div class="absolute top-4 right-4">
				<button
					class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
					<Heart class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="p-6 -mt-12 relative z-10">
			<!-- Play Button (Floating) -->
			<div class="flex justify-end mb-4">
				<button
					class="w-14 h-14 rounded-full bg-[#FF2E93] text-white shadow-lg hover:bg-[#ff5ca6] hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
					<Play class="w-6 h-6 fill-current ml-1" />
				</button>
			</div>

			<!-- Text Info -->
			<div class="space-y-4">
				<div>
					<h1 class="text-2xl font-bold text-text-primary leading-tight mb-1">
						{{ title }}
					</h1>
					<NuxtLink v-if="artist" :to="ROUTES.ARTIST.DETAIL(artist._id)"
						class="text-lg text-text-secondary hover:text-text-accent transition-colors">
						{{ artist.name }}
					</NuxtLink>
				</div>

				<!-- Metadata Tags -->
				<div class="flex flex-wrap gap-2">
					<span v-if="rhythm"
						class="px-3 py-1 rounded-full bg-surface-muted text-xs font-medium text-text-secondary border border-border-subtle">
						{{ rhythm }}
					</span>
					<span v-if="originalKey"
						class="px-3 py-1 rounded-full bg-surface-muted text-xs font-medium text-text-secondary border border-border-subtle">
						Key: {{ originalKey }}
					</span>
					<span v-if="difficulty"
						class="px-3 py-1 rounded-full bg-surface-muted text-xs font-medium text-text-secondary border border-border-subtle">
						{{ difficulty }}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- MOBILE VARIANT -->
	<div v-else class="relative overflow-hidden rounded-2xl bg-surface-base border border-border-subtle mb-6">
		<!-- Background Blur -->
		<div class="absolute inset-0 z-0 opacity-30">
			<div class="absolute inset-0 bg-cover bg-center blur-xl scale-150"
				:style="{ backgroundImage: `url(${bgImage})` }"></div>
			<div class="absolute inset-0 bg-surface-base/80 backdrop-blur-sm"></div>
		</div>

		<div class="relative z-10 p-4 flex items-center gap-4">
			<!-- Tiny Thumbnail -->
			<div class="w-16 h-16 rounded-lg bg-cover bg-center shadow-sm shrink-0"
				:style="{ backgroundImage: `url(${bgImage})` }"></div>

			<!-- Info -->
			<div class="flex-1 min-w-0">
				<h1 class="text-lg font-bold text-text-primary truncate leading-tight">
					{{ title }}
				</h1>
				<NuxtLink v-if="artist" :to="ROUTES.ARTIST.DETAIL(artist._id)"
					class="text-sm text-text-secondary hover:text-text-accent truncate block">
					{{ artist.name }}
				</NuxtLink>

				<div class="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
					<span v-if="originalKey" class="font-mono font-bold bg-surface-card/50 px-1.5 rounded">
						{{ originalKey }}
					</span>
					<span v-if="rhythm" class="truncate">
						{{ rhythm }}
					</span>
				</div>
			</div>

			<!-- Play Action -->
			<button
				class="w-10 h-10 rounded-full bg-[#FF2E93] text-white shadow-md flex items-center justify-center shrink-0 active:scale-95 transition-transform">
				<Play class="w-4 h-4 fill-current ml-0.5" />
			</button>
		</div>
	</div>
</template>
