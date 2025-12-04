<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTabService } from '~/composables/useTabService'
import { useAutoScroll } from '~/composables/useAutoScroll'
import { useTranspose } from '~/composables/useTranspose'
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
const { getOriginalTableIndex, fetchTables } = useTranspose()

const song = ref<SongWithPopulatedRefs | null>(null)
const artistSongs = ref<SongWithPopulatedRefs[]>([])
const similarSongs = ref<SongWithPopulatedRefs[]>([]) // Placeholder for now

// UI State - Table-based transposition
const currentTableIndex = ref(0)
const originalTableIndex = ref(0)
const fontSize = ref(1.0)

// Fetch chord tables and song data on mount
onMounted(async () => {
	// Fetch chord transposition tables (cached after first load)
	await fetchTables()

	// Fetch song data
	const id = route.params.id as string
	song.value = await fetchSongById(id)

	if (song.value) {
		// Determine original table index from song's first chord
		const originalIdx = getOriginalTableIndex(song.value.chords)
		originalTableIndex.value = originalIdx
		currentTableIndex.value = originalIdx // Start at original key

		// Fetch more songs by first artist
		if (song.value.artists && song.value.artists.length > 0) {
			const artistId = typeof song.value.artists[0] === 'string'
				? song.value.artists[0]
				: song.value.artists[0]?._id
			if (artistId) {
				artistSongs.value = await fetchSongsByArtist(artistId)
			}
		}
	}
})

// Handle table index change from toolbox
const handleTableIndexChange = (index: number) => {
	currentTableIndex.value = index
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

// Get key quality from song chords
const keyQuality = computed(() => {
	return song.value?.chords?.keySignature as 'major' | 'minor' | undefined
})
</script>

<template>
	<div v-if="song" class="min-h-screen bg-surface-base pb-0">

		<div class="container mx-auto px-4 py-4">
			<!-- MOBILE HEADER (Compact) -->
			<div class="lg:hidden mb-4">
				<SongInfoCard variant="mobile" :title="song.title" :artist="getArtistObj()" :rhythm="song.rhythm"
					:original-key="song.chords?.keySignature"
					:image="song.image ? getImageUrl(song.image) : undefined" />
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

				<!-- 1. LEFT SIDEBAR (Toolbox - Desktop) -->
				<div class="hidden lg:block lg:col-span-3">
					<SongFloatingToolbox :current-table-index="currentTableIndex"
						:original-table-index="originalTableIndex" :key-quality="keyQuality" :is-scrolling="isScrolling"
						:scroll-speed="speed" :font-size="fontSize" @update:table-index="handleTableIndexChange"
						@toggle-scroll="toggleScroll" @update:speed="setSpeed" @update:font-size="handleFontSize" />
				</div>

				<!-- 2. CENTER (Chord Sheet) -->
				<div class="lg:col-span-6">
					<MainChordSheet :sections="song.sections || []" :song-chords="song.chords"
						:current-table-index="currentTableIndex" :original-table-index="originalTableIndex"
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
				<div class="lg:hidden mt-4">
					<SongSidebar :artist-name="getArtistName()" :artist-songs="artistSongs"
						:similar-songs="similarSongs" />
				</div>

			</div>
		</div>

		<!-- MOBILE FLOATING TOOLBOX -->
		<div class="lg:hidden">
			<SongFloatingToolbox :current-table-index="currentTableIndex" :original-table-index="originalTableIndex"
				:key-quality="keyQuality" :is-scrolling="isScrolling" :scroll-speed="speed" :font-size="fontSize"
				@update:table-index="handleTableIndexChange" @toggle-scroll="toggleScroll" @update:speed="setSpeed"
				@update:font-size="handleFontSize" />
		</div>

	</div>

	<div v-else class="min-h-screen flex items-center justify-center">
		<div class="loading loading-spinner loading-lg text-primary"></div>
	</div>
</template>
