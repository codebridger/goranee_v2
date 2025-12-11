<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabService } from '~/composables/useTabService'
import { useAutoScroll } from '~/composables/useAutoScroll'
import { useTranspose } from '~/composables/useTranspose'
import { useSongSettings } from '~/composables/useSongSettings'
import { useContentLanguageStore } from '~/stores/contentLanguage'
import { useBaseUrl } from '~/composables/useBaseUrl'
import { useSchema } from '~/composables/useSchema'
import type { LanguageCode } from '~/constants/routes'
import type { SongWithPopulatedRefs, Song, Artist } from '~/types/song.type'
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
const contentLanguageStore = useContentLanguageStore()

// Extract song ID and language from route
const songId = computed(() => route.params.id as string)
const langCode = computed<LanguageCode>(() => {
	const lang = route.params.lang as string | string[]
	// Handle array case (catch-all route)
	const langStr = Array.isArray(lang) ? lang[0] : lang
	const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'en']
	return validLangs.includes(langStr as LanguageCode)
		? (langStr as LanguageCode)
		: 'ckb-IR' // Default fallback
})

const { fetchSongById, fetchSongsByArtist, getImageUrl } = useTabService()
const { isScrolling, speed, toggleScroll, setSpeed } = useAutoScroll()
const { getOriginalTableIndex, fetchTables } = useTranspose()
const { getArtistName, createMusicCompositionSchema, validateAndStringifySchema } = useSchema()

// Fetch song data with SSR support
const { data: songData, pending: isLoading, refresh: refreshSongData } = await useAsyncData(
	() => `song-${songId.value}-${langCode.value}`,
	async () => {
		// Fetch song data with language
		const id = songId.value
		const fetchedSong = await fetchSongById(id, langCode.value)

		// Also fetch full song object to get available languages
		let fetchedFullSong: Song | null = null
		if (id) {
			try {
				const fullSongData = await dataProvider.findOne<Song>({
					database: DATABASE_NAME,
					collection: COLLECTION_NAME.SONG,
					query: { _id: id },
					options: { limit: 1 },
				})
				if (fullSongData) {
					fetchedFullSong = fullSongData
				}
			} catch (error) {
				console.error('Failed to fetch full song object:', error)
			}
		}

		// Fetch more songs by first artist if song exists
		let fetchedArtistSongs: SongWithPopulatedRefs[] = []
		if (fetchedSong && fetchedSong.artists && fetchedSong.artists.length > 0) {
			const firstArtist = fetchedSong.artists[0]
			const artistId = typeof firstArtist === 'string'
				? firstArtist
				: (firstArtist as any)?._id
			if (artistId) {
				fetchedArtistSongs = await fetchSongsByArtist(artistId)
			}
		}

		return {
			song: fetchedSong,
			fullSong: fetchedFullSong,
			artistSongs: fetchedArtistSongs,
		}
	},
	{
		server: true,
		lazy: true,
		watch: [langCode],
	}
)

const song = computed(() => songData.value?.song || null)
const fullSong = computed(() => songData.value?.fullSong || null)
const artistSongs = computed(() => songData.value?.artistSongs || [])
const similarSongs = ref<SongWithPopulatedRefs[]>([]) // Placeholder for now

// Client-only loading state
const isClientLoading = computed(() => {
	return process.client && isLoading.value
})

const availableLangs = computed(() => {
	if (!fullSong.value) return song.value ? [song.value.currentLang] : []
	return getAvailableLangs(fullSong.value)
})

type GridColumns = 2 | 3 | 'auto'

// UI State - Table-based transposition
const currentTableIndex = ref(0)
const originalTableIndex = ref(0)
const fontSize = ref(1.0)
const gridMode = ref(false)
const gridColumns = ref<GridColumns>(2)

// Settings will be loaded after song data is fetched (client-only)
let settingsLoaded = false

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

// Sync store with route on mount and when route changes
onMounted(async () => {
	contentLanguageStore.syncWithRoute()

	// Fetch chord transposition tables (cached after first load) - can be client-only
	await fetchTables()

	// Load saved settings from localStorage (client-side only)
	if (song.value && typeof window !== 'undefined') {
		const id = songId.value
		// Determine original table index from song's first chord
		const originalIdx = getOriginalTableIndex(song.value.chords)
		originalTableIndex.value = originalIdx

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
	} else if (song.value) {
		// Server-side: just set original index
		const originalIdx = getOriginalTableIndex(song.value.chords)
		originalTableIndex.value = originalIdx
		currentTableIndex.value = originalIdx
	}

	// Add keyboard event listener
	window.addEventListener('keydown', handleKeydown)
})

watch(
	() => langCode.value,
	(newLang) => {
		if (newLang && newLang !== contentLanguageStore.currentLanguage) {
			contentLanguageStore.setContentLanguage(newLang)
		}
	},
	{ immediate: true }
)

// Watch for language changes in route
watch(langCode, async (newLang) => {
	if (songId.value) {
		await refreshSongData()
	}
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

// Reset handlers
const handleResetTranspose = () => {
	currentTableIndex.value = originalTableIndex.value
}

const handleResetScroll = () => {
	setSpeed(0.5) // Default scroll speed
}

const handleResetFontSize = () => {
	fontSize.value = 1.0 // Default font size
}

const handleResetLayout = () => {
	gridMode.value = false // Default grid mode
	gridColumns.value = 2 // Default grid columns
}

const getArtistsNames = () => {
	if (!song.value?.artists || song.value.artists.length === 0) return 'Unknown Artist'

	const artistNames = song.value.artists
		.map((artist): string | null => {
			if (typeof artist === 'string') return null
			const artistObj = artist as any
			if (artistObj && typeof artistObj === 'object' && 'name' in artistObj) {
				return artistObj.name || null
			}
			return null
		})
		.filter((name): name is string => name !== null)

	if (artistNames.length === 0) return 'Unknown Artist'
	if (artistNames.length === 1) return artistNames[0]

	// Join multiple artists with " و " (Kurdish/Farsi "and")
	return artistNames.join(' و ')
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

// SEO: Meta tags
const baseUrl = useBaseUrl()
const songTitle = computed(() => song.value?.title || 'Goranee')
const songDescription = computed(() => {
	if (!song.value) return 'Goranee - Kurdish Chords Platform'
	const artistsNames = getArtistsNames()
	const rhythm = song.value.rhythm || ''
	return `آکورد ${song.value.title}${artistsNames !== 'Unknown Artist' ? ` از ${artistsNames}` : ''}${rhythm ? ` - ${rhythm}` : ''} | Goranee`
})
const songImage = computed(() => {
	if (!song.value?.image) return `${baseUrl.value}/favicon.ico`
	return getImageUrl(song.value.image)
})
const canonicalUrl = computed(() => {
	return langCode.value === 'ckb-IR'
		? `${baseUrl.value}/tab/${songId.value}`
		: `${baseUrl.value}/tab/${songId.value}/${langCode.value}`
})

useSeoMeta({
	title: computed(() => `${songTitle.value} - Goranee`),
	description: songDescription,
	ogTitle: songTitle,
	ogDescription: songDescription,
	ogImage: songImage,
	ogType: 'music.song',
	ogUrl: canonicalUrl,
	twitterCard: 'summary_large_image',
	twitterTitle: songTitle,
	twitterDescription: songDescription,
	twitterImage: songImage,
})

// SEO: Structured Data (JSON-LD) and hreflang/canonical
useHead({
	link: computed(() => {
		if (!song.value || !fullSong.value) return []

		const links: any[] = []
		const available = getAvailableLangs(fullSong.value)

		// Add hreflang for each available language
		available.forEach(lang => {
			const url = lang === 'ckb-IR'
				? `${baseUrl.value}/tab/${songId.value}`
				: `${baseUrl.value}/tab/${songId.value}/${lang}`

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
			href: `${baseUrl.value}/tab/${songId.value}`,
		})

		// Add canonical URL
		links.push({
			rel: 'canonical',
			href: canonicalUrl.value,
		})

		return links
	}),
	script: computed(() => {
		if (!song.value || !fullSong.value) return []

		// Build composer array from individual artists (type-safe)
		type Composer = {
			'@type': 'Person'
			name: string
			url?: string
		}

		const composers: Composer[] = song.value.artists && song.value.artists.length > 0
			? song.value.artists
				.map((artist): Composer | null => {
					// Skip if artist is just a string ID (no name available)
					if (typeof artist === 'string') {
						return null
					}

					const artistObj = artist as Artist
					const artistName = getArtistName(artistObj, langCode.value)

					// Only include if we have a valid name
					if (!artistName || artistName === 'Unknown Artist') {
						return null
					}

					// Build clean composer object with only valid fields
					const composer: Composer = {
						'@type': 'Person',
						name: String(artistName),
					}

					// Only add URL if _id exists and is valid
					if (artistObj._id && typeof artistObj._id === 'string') {
						composer.url = `${baseUrl.value}/artist/${artistObj._id}`
					}

					return composer
				})
				.filter((composer): composer is Composer => composer !== null)
			: []

		// Create structured data using the shared composable
		const structuredData = createMusicCompositionSchema({
			name: song.value.title || 'Untitled Song',
			language: langCode.value,
			composers,
			image: song.value.image && songImage.value && typeof songImage.value === 'string'
				? String(songImage.value)
				: undefined,
			dateCreated: fullSong.value.createdAt,
			dateModified: fullSong.value.updatedAt,
		})

		// Validate and stringify using the shared composable
		return validateAndStringifySchema(structuredData)
	}),
})
</script>

<template>
	<!-- Loading State -->
	<div v-if="isClientLoading" class="min-h-screen flex items-center justify-center bg-surface-base">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
	</div>

	<div v-else-if="song" class="min-h-screen bg-surface-base pb-0">

		<div class="container mx-auto px-4 py-4">
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
							@update:grid-mode="handleGridMode" @update:grid-columns="handleGridColumns"
							@reset:transpose="handleResetTranspose" @reset:scroll="handleResetScroll"
							@reset:font-size="handleResetFontSize" @reset:layout="handleResetLayout" />
					</div>
				</div>

				<!-- 2. CENTER (Chord Sheet) -->
				<div class="lg:col-span-6">
					<!-- Language Switcher -->
					<LanguageSwitcher v-if="availableLangs.length > 1" :available-langs="availableLangs"
						:current-lang="langCode" :song-id="songId" />

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

					<SongSidebar :artist-name="getArtistsNames()" :artist-songs="artistSongs"
						:similar-songs="similarSongs" />
				</div>

				<!-- Mobile Recommendations (Bottom) -->
				<div class="lg:hidden mt-4">
					<SongSidebar :artist-name="getArtistsNames()" :artist-songs="artistSongs"
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
				@update:grid-mode="handleGridMode" @update:grid-columns="handleGridColumns"
				@reset:transpose="handleResetTranspose" @reset:scroll="handleResetScroll"
				@reset:font-size="handleResetFontSize" @reset:layout="handleResetLayout" />
		</div>

	</div>

	<div v-else class="min-h-screen flex items-center justify-center">
		<div class="loading loading-spinner loading-lg text-primary"></div>
	</div>
</template>
