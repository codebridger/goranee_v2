<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabService } from '~/composables/useTabService'
import { useAutoScroll } from '~/composables/useAutoScroll'
import { useTranspose } from '~/composables/useTranspose'
import { useSongSettings } from '~/composables/useSongSettings'
import type { LanguageCode } from '~/constants/routes'
import type { SongWithLang, SongWithPopulatedRefs, Song } from '~/types/song.type'
import { getAvailableLangs } from '~/types/song.type'
import { dataProvider } from '@modular-rest/client'
import { DATABASE_NAME, COLLECTION_NAME } from '~/types/database.type'
import SongInfoCard from '~/components/widget/song/SongInfoCard.vue'
import MainChordSheet from '~/components/widget/song/MainChordSheet.vue'
import SongFloatingToolbox from '~/components/widget/song/SongFloatingToolbox.vue'
import SongSidebar from '~/components/widget/song/SongSidebar.vue'
import LanguageSwitcher from '~/components/widget/song/LanguageSwitcher.vue'

definePageMeta({
	layout: 'song'
})

const route = useRoute()
const router = useRouter()

// Extract song ID and language from route
const songId = computed(() => route.params.id as string)
const langCode = computed<LanguageCode>(() => {
	const lang = route.params.lang as string | string[]
	// Handle array case (catch-all route)
	const langStr = Array.isArray(lang) ? lang[0] : lang
	const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
	return validLangs.includes(langStr as LanguageCode) 
		? (langStr as LanguageCode) 
		: 'ckb-IR' // Default fallback
})

const { fetchSongById, fetchSongsByArtist, getImageUrl } = useTabService()
const { isScrolling, speed, toggleScroll, setSpeed } = useAutoScroll()
const { getOriginalTableIndex, fetchTables } = useTranspose()

const song = ref<SongWithLang | null>(null)
const fullSong = ref<Song | null>(null) // Store full song object to get available languages
const availableLangs = computed(() => {
	if (!fullSong.value) return song.value ? [song.value.currentLang] : []
	return getAvailableLangs(fullSong.value)
})
const artistSongs = ref<SongWithPopulatedRefs[]>([])
const similarSongs = ref<SongWithPopulatedRefs[]>([]) // Placeholder for now

type GridColumns = 2 | 3 | 'auto'

// UI State - Table-based transposition
const currentTableIndex = ref(0)
const originalTableIndex = ref(0)
const fontSize = ref(1.0)
const gridMode = ref(false)
const gridColumns = ref<GridColumns>(2)

// Settings will be loaded after song data is fetched
let settingsLoaded = false

// Fetch chord tables and song data on mount
onMounted(async () => {
	// Fetch chord transposition tables (cached after first load)
	await fetchTables()

	// Fetch song data with language
	const id = songId.value
	song.value = await fetchSongById(id, langCode.value)
	
		// Also fetch full song object to get available languages
		if (id) {
			try {
				const fullSongData = await dataProvider.findOne<Song>({
					database: DATABASE_NAME,
					collection: COLLECTION_NAME.SONG,
					query: { _id: id },
					options: { limit: 1 },
				})
				if (fullSongData) {
					fullSong.value = fullSongData
				}
			} catch (error) {
				console.error('Failed to fetch full song object:', error)
			}
		}

	if (song.value) {
		// Determine original table index from song's first chord
		const originalIdx = getOriginalTableIndex(song.value.chords)
		originalTableIndex.value = originalIdx

		// Load saved settings from localStorage (client-side only)
		if (typeof window !== 'undefined') {
			const {
				tableIndex: savedTableIndex,
				fontSize: savedFontSize,
				scrollSpeed: savedScrollSpeed,
				gridMode: savedGridMode,
				gridColumns: savedGridColumns
			} = useSongSettings(id)

			// Apply saved settings or use defaults
			currentTableIndex.value = savedTableIndex.value !== 0 ? savedTableIndex.value : originalIdx
			fontSize.value = savedFontSize.value
			setSpeed(savedScrollSpeed.value)
			gridMode.value = savedGridMode.value
			gridColumns.value = savedGridColumns.value

			settingsLoaded = true
		} else {
			currentTableIndex.value = originalIdx
		}

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

// Watch for language changes in route
watch(langCode, async (newLang) => {
	if (songId.value) {
		song.value = await fetchSongById(songId.value, newLang)
	}
})

// Keyboard shortcut: Spacebar to toggle auto-scroll
const handleKeydown = (event: KeyboardEvent) => {
	// Only trigger if not typing in an input field
	const target = event.target as HTMLElement
	if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
		return
	}

	if (event.code === 'Space') {
		event.preventDefault() // Prevent page scroll
		toggleScroll()
	}
}

onMounted(() => {
	window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeydown)
})

// Save settings to localStorage when they change
const saveCurrentSettings = () => {
	if (!settingsLoaded || typeof window === 'undefined') return

	const storageKey = `goranee_song_settings_${songId.value}`
	const settings = {
		tableIndex: currentTableIndex.value,
		fontSize: fontSize.value,
		scrollSpeed: speed.value,
		gridMode: gridMode.value,
		gridColumns: gridColumns.value
	}

	try {
		localStorage.setItem(storageKey, JSON.stringify(settings))
	} catch (e) {
		console.warn('Failed to save song settings:', e)
	}
}

// Watch for changes and save
watch([currentTableIndex, fontSize, speed, gridMode, gridColumns], saveCurrentSettings)

// Handle table index change from toolbox
const handleTableIndexChange = (index: number) => {
	currentTableIndex.value = index
}

const handleFontSize = (size: number) => {
	fontSize.value = size
}

const handleGridMode = (mode: boolean) => {
	gridMode.value = mode
}

const handleGridColumns = (columns: GridColumns) => {
	gridColumns.value = columns
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

// SEO: hreflang and canonical URLs
useHead({
	link: computed(() => {
		if (!song.value || !fullSong.value) return []
		
		const baseUrl = 'https://goranee.ir'
		const links: any[] = []
		const available = getAvailableLangs(fullSong.value)
		
		// Add hreflang for each available language
		available.forEach(lang => {
			const url = lang === 'ckb-IR'
				? `${baseUrl}/tab/${songId.value}`
				: `${baseUrl}/tab/${songId.value}/${lang}`
			
			links.push({
				rel: 'alternate',
				hreflang: lang,
				href: url,
			})
		})
		
		// Add x-default
		links.push({
			rel: 'alternate',
			hreflang: 'x-default',
			href: `${baseUrl}/tab/${songId.value}`,
		})
		
		// Add canonical URL
		const canonicalUrl = langCode.value === 'ckb-IR'
			? `${baseUrl}/tab/${songId.value}`
			: `${baseUrl}/tab/${songId.value}/${langCode.value}`
		
		links.push({
			rel: 'canonical',
			href: canonicalUrl,
		})
		
		return links
	}),
})
</script>

<template>
	<div v-if="song" class="min-h-screen bg-surface-base pb-0">

		<div class="container mx-auto px-4 py-4">
			<!-- Language Switcher -->
			<LanguageSwitcher 
				v-if="availableLangs.length > 1"
				:available-langs="availableLangs"
				:current-lang="langCode"
				:song-id="songId"
			/>
			
			<!-- MOBILE HEADER (Compact) -->
			<div class="lg:hidden mb-4">
				<SongInfoCard variant="mobile" :title="song.title" :artist="getArtistObj()" :rhythm="song.rhythm"
					:original-key="song.chords?.keySignature"
					:image="song.image ? getImageUrl(song.image) : undefined" />
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

				<!-- 1. LEFT SIDEBAR (Toolbox - Desktop) - Fixed positioning -->
				<div class="hidden lg:block lg:col-span-3 relative">
					<div
						class="fixed top-24 z-40 w-[calc((100vw-2rem)/12*3-2rem)] max-w-[calc((1024px-2rem)/12*3-2rem)] xl:max-w-[calc((1280px-2rem)/12*3-2rem)] 2xl:max-w-[calc((1536px-2rem)/12*3-2rem)]">
						<SongFloatingToolbox :current-table-index="currentTableIndex"
							:original-table-index="originalTableIndex" :key-quality="keyQuality"
							:is-scrolling="isScrolling" :scroll-speed="speed" :font-size="fontSize"
							:grid-mode="gridMode" :grid-columns="gridColumns"
							@update:table-index="handleTableIndexChange" @toggle-scroll="toggleScroll"
							@update:speed="setSpeed" @update:font-size="handleFontSize"
							@update:grid-mode="handleGridMode" @update:grid-columns="handleGridColumns" />
					</div>
				</div>

				<!-- 2. CENTER (Chord Sheet) -->
				<div class="lg:col-span-6">
					<MainChordSheet :sections="song.sections || []" :song-chords="song.chords"
						:current-table-index="currentTableIndex" :original-table-index="originalTableIndex"
						:font-size="fontSize" :grid-mode="gridMode" :grid-columns="gridColumns" />
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
				:grid-mode="gridMode" :grid-columns="gridColumns" @update:table-index="handleTableIndexChange"
				@toggle-scroll="toggleScroll" @update:speed="setSpeed" @update:font-size="handleFontSize"
				@update:grid-mode="handleGridMode" @update:grid-columns="handleGridColumns" />
		</div>

	</div>

	<div v-else class="min-h-screen flex items-center justify-center">
		<div class="loading loading-spinner loading-lg text-primary"></div>
	</div>
</template>

