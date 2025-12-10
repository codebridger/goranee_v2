<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Play, Heart } from 'lucide-vue-next';
import { useTabService } from '~/composables/useTabService';
import { useContentLanguageStore } from '~/stores/contentLanguage';
import type { Artist, SongWithPopulatedRefs } from '~/types/song.type';
import type { LanguageCode } from '~/constants/routes';
import { fileProvider } from '@modular-rest/client';
import SongCard from '~/components/widget/SongCard.vue';
import ArtistCard from '~/components/widget/ArtistCard.vue';
import Button from '~/components/base/Button.vue';
import ArtistHero from '~/components/widget/ArtistHero.vue';
import { ROUTES } from '~/constants/routes';

const route = useRoute();
const { t } = useI18n();
const contentLanguageStore = useContentLanguageStore();
const { fetchArtist, fetchSongsByArtist, fetchFeaturedArtists } = useTabService();

const artistId = computed(() => route.params.id as string);
const langCode = computed<LanguageCode>(() => {
	const lang = route.params.lang as string | string[]
	// Handle array case (catch-all route)
	const langStr = Array.isArray(lang) ? lang[0] : lang
	const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'en']
	return validLangs.includes(langStr as LanguageCode)
		? (langStr as LanguageCode)
		: 'ckb-IR' // Default fallback
});

// Fetch artist data with SSR support
const { data: artistData, pending: isLoading, refresh: refreshArtistData } = await useAsyncData(
	() => `artist-${artistId.value}-${langCode.value}`,
	async () => {
		const [artistData, songsData, relatedData] = await Promise.all([
			fetchArtist(artistId.value, langCode.value),
			fetchSongsByArtist(artistId.value),
			fetchFeaturedArtists()
		]);

		// Filter out current artist and limit to 10
		const filteredRelatedArtists = relatedData
			.filter(a => a._id !== artistId.value)
			.slice(0, 10);

		return {
			artist: artistData,
			songs: songsData,
			relatedArtists: filteredRelatedArtists,
		}
	},
	{
		server: true,
		lazy: true,
		watch: [langCode],
	}
)

const artist = computed(() => artistData.value?.artist || null);
const songs = computed(() => artistData.value?.songs || []);
const relatedArtists = computed(() => artistData.value?.relatedArtists || []);

// Client-only: Sync store with route on mount
onMounted(() => {
	contentLanguageStore.syncWithRoute();
});

// Watch for language changes in route
watch(langCode, async (newLang) => {
	if (newLang && newLang !== contentLanguageStore.currentLanguage) {
		contentLanguageStore.setContentLanguage(newLang);
	}
	if (artistId.value) {
		await refreshArtistData();
	}
});

const artistImage = computed(() => {
	return artist.value?.image ? fileProvider.getFileLink(artist.value.image as any) : undefined;
});

const gradientClass = computed(() => {
	return (artist.value as any)?._mockColor || 'from-indigo-500 to-purple-600';
});

const topSongs = computed(() => songs.value.slice(0, 5));

const songsCount = computed(() => songs.value.length);
const totalPlays = computed(() => (artist.value?.chords || 0) * 1250);

const getSongGradientClass = (song: SongWithPopulatedRefs) => {
	const mockColor = (song as any)?._mockColor;
	if (!mockColor) return 'from-gray-400 to-gray-600';

	try {
		const parts = mockColor.split(' ');
		const fromPart = parts[0]?.split('-')[1];
		const toPart = parts[2]?.split('-')[1];
		return `from-${fromPart}-400 to-${toPart}-600`;
	} catch {
		return 'from-gray-400 to-gray-600';
	}
};

const getSongMetadata = (song: SongWithPopulatedRefs) => {
	const rhythm = song.rhythm || '';
	const key = song.chords?.keySignature || 'C';
	return `${rhythm} • ${key}`;
};

const getRelatedArtistAvatarUrl = (related: Artist) => {
	return related.image ? fileProvider.getFileLink(related.image as any) : undefined;
};

const getRelatedArtistSongCount = (related: Artist) => {
	return related.chords || 0;
};

const getRelatedArtistName = (related: Artist) => {
	// Extract name from content object
	if (related.content) {
		return related.content['ckb-IR']?.name || ''
	}
	// Fallback to old structure
	return (related as any).name || ''
};

const navigateToSong = (songId?: string) => {
	if (songId) {
		return navigateTo(ROUTES.TAB.DETAIL(songId));
	}
};

const navigateToArtist = (artistId?: string) => {
	if (artistId) {
		return navigateTo(ROUTES.ARTIST.DETAIL(artistId));
	}
};

const navigateToHome = () => {
	return navigateTo(ROUTES.HOME);
};

// Get artist name from current language content
const artistName = computed(() => {
	if (!artist.value) return ''
	const langContent = artist.value.content?.[langCode.value]
	return langContent?.name || artist.value.content?.['ckb-IR']?.name || ''
});

// SEO
useHead({
	title: computed(() => artistName.value ? `${artistName.value} - Goranee` : t('common.artist')),
	link: computed(() => {
		if (!artist.value) return []

		const baseUrl = 'https://goranee.ir'
		const links: any[] = []

		// Get available languages for artist
		const availableLangs = (Object.keys(artist.value.content || {}) as LanguageCode[]).filter(
			lang => artist.value?.content?.[lang]?.name
		)

		if (availableLangs.length > 1) {
			// Add hreflang for each available language
			availableLangs.forEach(lang => {
				const url = lang === 'ckb-IR'
					? `${baseUrl}/artist/${artistId.value}`
					: `${baseUrl}/artist/${artistId.value}/${lang}`

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
				href: `${baseUrl}/artist/${artistId.value}`,
			})
		}

		// Add canonical URL
		const canonicalUrl = langCode.value === 'ckb-IR'
			? `${baseUrl}/artist/${artistId.value}`
			: `${baseUrl}/artist/${artistId.value}/${langCode.value}`

		links.push({
			rel: 'canonical',
			href: canonicalUrl,
		})

		return links
	}),
});
</script>

<template>
	<div class="min-h-screen pb-20 bg-surface-base text-text-primary transition-colors duration-300">

		<!-- Loading State -->
		<div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
		</div>

		<div v-else-if="artist">
			<ArtistHero :artist="artist" :songs-count="songsCount" :total-plays="totalPlays" :artist-image="artistImage"
				:gradient-class="gradientClass" motion-variant="vignette" />

			<div class="container mx-auto px-4 py-12 space-y-16">

				<!-- Top Songs & Catalog Layout -->
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-12">

					<!-- Left Column: Top Songs (Ranked) -->
					<div class="lg:col-span-4 xl:col-span-3">
						<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
							<Heart class="w-6 h-6 text-brand-primary fill-current" />
							{{ t('common.popular') }}
						</h2>
						<div class="space-y-3">
							<div v-for="(song, index) in topSongs" :key="song._id"
								class="group flex items-center gap-4 p-3 rounded-xl hover:bg-surface-card transition-colors cursor-pointer border border-transparent hover:border-border-subtle">
								<div
									class="text-2xl font-black text-text-disabled w-6 text-center group-hover:text-brand-primary transition-colors">
									{{ index + 1 }}
								</div>
								<div class="w-12 h-12 rounded-lg bg-surface-subtle overflow-hidden shrink-0 relative">
									<!-- Fallback or Image -->
									<div class="absolute inset-0 bg-linear-to-br opacity-80"
										:class="getSongGradientClass(song)">
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-bold text-text-primary truncate">{{ song.title }}</h3>
									<p class="text-xs text-text-secondary">{{ getSongMetadata(song) }}</p>
								</div>
								<div class="opacity-0 group-hover:opacity-100 transition-opacity">
									<Play class="w-5 h-5 text-text-primary fill-current" />
								</div>
							</div>
						</div>
					</div>

					<!-- Right Column: Full Catalog Grid -->
					<div class="lg:col-span-8 xl:col-span-9">
						<div class="flex items-center justify-between mb-6">
							<h2 class="text-2xl font-bold">{{ t('common.discography') }}</h2>
							<!-- Simple Filter/Sort could go here -->
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<SongCard v-for="song in songs" :key="song._id" :song="song"
								@click="navigateToSong(song._id)" />
						</div>
						<div v-if="songs.length === 0" class="text-center py-12 text-text-secondary">
							{{ t('common.noSongsFound') }}
						</div>
					</div>
				</div>

				<!-- Related Artists -->
				<div v-if="relatedArtists.length > 0" class="border-t border-border-subtle pt-12">
					<h2 class="text-2xl font-bold mb-8">{{ t('common.fansAlsoLike') }}</h2>

					<!-- Horizontal Scroll Container -->
					<div class="flex overflow-x-auto pb-8 -mx-4 px-4 gap-6 hide-scrollbar snap-x">
						<ArtistCard v-for="related in relatedArtists" :key="related._id"
							:name="getRelatedArtistName(related)" :song-count="getRelatedArtistSongCount(related)"
							:avatar-url="getRelatedArtistAvatarUrl(related)"
							:gradient-border="(related as any)._mockColor" class="min-w-[200px] w-[200px] snap-start"
							@click="navigateToArtist(related._id)" />
					</div>
				</div>

			</div>
		</div>

		<div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary">
			<p class="text-xl font-bold mb-2">{{ t('common.artistNotFound') }}</p>
			<Button variant="secondary" @click="navigateToHome">{{ t('common.goHome') }}</Button>
		</div>

	</div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
	display: none;
}

.hide-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}

@keyframes blob {
	0% {
		transform: translate(0px, 0px) scale(1);
	}

	33% {
		transform: translate(30px, -50px) scale(1.1);
	}

	66% {
		transform: translate(-20px, 20px) scale(0.9);
	}

	100% {
		transform: translate(0px, 0px) scale(1);
	}
}

.animate-blob {
	animation: blob 7s infinite;
}

.animation-delay-2000 {
	animation-delay: 2s;
}

.animation-delay-4000 {
	animation-delay: 4s;
}
</style>
