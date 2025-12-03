<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTabService } from '~/composables/useTabService'
import { useAutoScroll } from '~/composables/useAutoScroll'
import SongInfoCard from '~/components/widget/song/SongInfoCard.vue'
import MainChordSheet from '~/components/widget/song/MainChordSheet.vue'
import SongFloatingToolbox from '~/components/widget/song/SongFloatingToolbox.vue'
import SongSidebar from '~/components/widget/song/SongSidebar.vue'
import type { SongWithPopulatedRefs } from '~/types/song.type'

definePageMeta({
	layout: 'song'
})

const route = useRoute()
const { fetchSongById, fetchSongsByArtist, getImageUrl } = useTabService()
const { isScrolling, speed, toggleScroll, setSpeed } = useAutoScroll()

const song = ref<SongWithPopulatedRefs | null>(null)
const artistSongs = ref<SongWithPopulatedRefs[]>([])
const similarSongs = ref<SongWithPopulatedRefs[]>([]) // Placeholder for now

// UI State
const transposeSteps = ref(0)
const fontSize = ref(1.0)

// Fetch Data
onMounted(async () => {
	const id = route.params.id as string
	song.value = await fetchSongById(id)

	if (song.value && song.value.artists && song.value.artists.length > 0) {
		// Fetch more by first artist
		const artistId = typeof song.value.artists[0] === 'string' ? song.value.artists[0] : song.value.artists[0]?._id
		if (artistId) {
			artistSongs.value = await fetchSongsByArtist(artistId)
		}
	}
})

// Watch for scroll speed changes from toolbox
watch(speed, (newSpeed) => {
	// Already handled by useAutoScroll internal state, 
	// but we might need to ensure the component updates
})

const handleTranspose = (steps: number) => {
	transposeSteps.value = steps
}

const handleFontSize = (size: number) => {
	fontSize.value = size
}

const getArtistName = () => {
	if (!song.value?.artists || song.value.artists.length === 0) return 'Unknown Artist'
	const artist = song.value.artists[0]
	return typeof artist === 'string' ? 'Unknown Artist' : artist?.name || 'Unknown Artist'
}

const getArtistObj = () => {
	if (!song.value?.artists || song.value.artists.length === 0) return undefined
	const artist = song.value.artists[0]
	return typeof artist === 'string' ? undefined : artist
}

// Extract root note from first chord or use vocalNote
const getRootNote = () => {
	if (!song.value) return undefined

	// First try vocalNote
	if (song.value.chords?.vocalNote?.note) {
		return song.value.chords.vocalNote.note
	}

	// Otherwise, extract from first chord in sections
	if (song.value.sections && song.value.sections.length > 0) {
		for (const section of song.value.sections) {
			if (section.lines && section.lines.length > 0) {
				for (const line of section.lines) {
					if (line.chords) {
						// Extract first chord from the chords string
						const firstChord = line.chords.trim().split(/\s+/)[0]
						if (firstChord) {
							// Match note pattern (e.g., "C", "C#", "Db", "Am", "Cm7")
							const match = firstChord.match(/^([A-G][#b]?)/)
							if (match) {
								return match[1]
							}
						}
					}
				}
			}
		}
	}

	return undefined
}

const rootNote = computed(() => getRootNote())

</script>

<template>
	<div v-if="song" class="min-h-screen bg-surface-base pb-24 lg:pb-0">

		<div class="container mx-auto px-4 py-4 lg:py-8">
			<!-- MOBILE HEADER (Compact) -->
			<div class="lg:hidden mb-4">
				<SongInfoCard variant="mobile" :title="song.title" :artist="getArtistObj()" :rhythm="song.rhythm"
					:original-key="song.chords?.keySignature"
					:image="song.image ? getImageUrl(song.image) : undefined" />
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

				<!-- 1. LEFT SIDEBAR (Toolbox - Desktop) -->
				<div class="hidden lg:block lg:col-span-3">
					<SongFloatingToolbox :root-note="rootNote" :key-quality="song.chords?.keySignature"
						:transpose-steps="transposeSteps" :is-scrolling="isScrolling" :scroll-speed="speed"
						:font-size="fontSize" @update:transpose="handleTranspose" @toggle-scroll="toggleScroll"
						@update:speed="setSpeed" @update:font-size="handleFontSize" />
				</div>

				<!-- 2. CENTER (Chord Sheet) -->
				<div class="lg:col-span-6">
					<MainChordSheet :sections="song.sections || []" :transpose-steps="transposeSteps"
						:font-size="fontSize" />
				</div>

				<!-- 3. RIGHT SIDEBAR (Info + Recommendations) -->
				<div class="hidden lg:block lg:col-span-3 space-y-8">
					<!-- Desktop Info Card -->
					<SongInfoCard variant="desktop" :title="song.title" :artist="getArtistObj()" :rhythm="song.rhythm"
						:original-key="song.chords?.keySignature"
						:image="song.image ? getImageUrl(song.image) : undefined" />

					<SongSidebar :artist-name="getArtistName()" :artist-songs="artistSongs"
						:similar-songs="similarSongs" />
				</div>

				<!-- Mobile Recommendations (Bottom) -->
				<div class="lg:hidden">
					<SongSidebar :artist-name="getArtistName()" :artist-songs="artistSongs"
						:similar-songs="similarSongs" />
				</div>

			</div>
		</div>

		<!-- MOBILE FLOATING TOOLBOX -->
		<div class="lg:hidden">
			<SongFloatingToolbox :root-note="rootNote" :key-quality="song.chords?.keySignature"
				:transpose-steps="transposeSteps" :is-scrolling="isScrolling" :scroll-speed="speed"
				:font-size="fontSize" @update:transpose="handleTranspose" @toggle-scroll="toggleScroll"
				@update:speed="setSpeed" @update:font-size="handleFontSize" />
		</div>

	</div>

	<div v-else class="min-h-screen flex items-center justify-center">
		<div class="loading loading-spinner loading-lg text-primary"></div>
	</div>
</template>
