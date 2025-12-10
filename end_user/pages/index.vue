<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowRight, Music } from 'lucide-vue-next'

import { useTabService } from '~/composables/useTabService'
import { useContentLanguageStore } from '~/stores/contentLanguage'
import type { SongWithPopulatedRefs, Artist, Genre } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'
import CarouselNav from '~/components/base/CarouselNav.vue'

const { t } = useI18n()
const tabService = useTabService()
const contentLanguageStore = useContentLanguageStore()

const isListLoading = ref(false)
const songCache = ref<Record<string, SongWithPopulatedRefs[]>>({})
const artistCarouselRef = ref<HTMLElement | null>(null)

// Fetch initial data with SSR support
const { data: homeData, pending: isLoading } = await useAsyncData('home', async () => {
  const [hero, trending, artists, fetchedGenres] = await Promise.all([
    tabService.fetchSongs(5, 0, { sections: { $slice: 1 } }, {}, { _id: -1 }),
    tabService.fetchSongs(8, 5, {}, {}, { _id: -1 }),
    tabService.fetchFeaturedArtists(),
    tabService.fetchGenres(),
  ])

  return {
    heroSongs: hero,
    trendingSongs: trending,
    featuredArtists: artists,
    genres: fetchedGenres,
  }
}, {
  server: true,
  lazy: true,
})

// Client-only loading state
const isClientLoading = computed(() => {
  return process.client && isLoading.value
})

const heroSongs = computed(() => homeData.value?.heroSongs || [])
const trendingSongs = ref<SongWithPopulatedRefs[]>(homeData.value?.trendingSongs || [])
const featuredArtists = computed(() => homeData.value?.featuredArtists || [])
const genres = computed(() => homeData.value?.genres || [])

// Initialize cache with initial trending songs
if (homeData.value?.trendingSongs) {
  songCache.value[t('home.discovery.tabs.all')] = homeData.value.trendingSongs
}

const tabs = computed(() => [
  t('home.discovery.tabs.all'),
  ...genres.value.map(g => g.title || '').filter(Boolean)
])

const activeTab = ref(t('home.discovery.tabs.all'))

// Helper function to get artist name with language support
const getArtistName = (artist: Artist) => {
  if (!artist) return ''
  const currentLang = contentLanguageStore.currentLanguage

  // Try to get name from current language
  const langContent = artist.content?.[currentLang]
  if (langContent?.name) {
    return langContent.name
  }

  // Final fallback to 'ckb-IR'
  if (artist.content?.['ckb-IR']?.name) {
    return artist.content['ckb-IR'].name
  }

  return ''
}

const scrollCarousel = (direction: -1 | 1) => {
  if (!artistCarouselRef.value) return
  const scrollAmount = 200 * direction
  artistCarouselRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

const handleTabChange = async (tabName: string) => {
  activeTab.value = tabName

  // If cache exists, use it
  if (songCache.value[tabName]) {
    trendingSongs.value = songCache.value[tabName]
    return
  }

  isListLoading.value = true
  try {
    let songs: SongWithPopulatedRefs[] = []

    if (tabName === t('home.discovery.tabs.all')) {
      // For 'All', we fetch the latest songs
      songs = await tabService.fetchSongs(8, 5, {}, {}, { _id: -1 })
    } else {
      // Find the genre object by title
      const genre = genres.value.find(g => g.title === tabName)
      if (genre && genre._id) {
        // Fetch songs filtered by genre ID, sorted by latest
        songs = await tabService.fetchSongs(8, 0, {}, { genres: genre._id }, { _id: -1 })
      }
    }

    // Cache the result
    songCache.value[tabName] = songs
    trendingSongs.value = songs
  } catch (error) {
    console.error(`Failed to fetch songs for tab ${tabName}:`, error)
  } finally {
    isListLoading.value = false
  }
}

// Client-only: Initialize carousel ref after mount
onMounted(() => {
  // Carousel ref is already available in template, no action needed
  // This onMounted is kept for potential future client-only setup
})
</script>

<template>
  <div class="bg-surface-base text-text-primary transition-colors duration-300 font-sans relative">
    <!-- Hero Section -->
    <Hero :songs="heroSongs" :is-loading="isLoading" />

    <!-- --- SONG DISCOVERY --- -->
    <section class="px-6 py-16 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <Typography variant="h2" class="font-bold">{{ t('home.discovery.title') }}</Typography>
          <Typography variant="body" class="text-text-secondary">{{
            t('home.discovery.subtitle')
            }}</Typography>
        </div>
        <TabFilter :tabs="tabs" :activeTab="activeTab" @change="handleTabChange" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <template v-if="isListLoading">
          <SkeletonCard v-for="i in 4" :key="i" />
        </template>
        <template v-else-if="trendingSongs.length > 0">
          <NuxtLink v-for="song in trendingSongs" :key="song._id" :to="ROUTES.TAB.DETAIL(song._id)" class="block">
            <SongCard :song="song" />
          </NuxtLink>
        </template>
        <template v-else>
          <div class="col-span-full flex flex-col items-center justify-center py-12 text-text-secondary">
            <div class="p-4 rounded-full bg-surface-card mb-4">
              <Music class="w-8 h-8 text-text-secondary/50" />
            </div>
            <Typography variant="body">{{ t('home.discovery.emptyState') }}</Typography>
          </div>
        </template>
      </div>
    </section>

    <!-- --- ARTIST SCROLL (Snap Scrolling) --- -->
    <section class="py-16 bg-surface-card/50 backdrop-blur-sm border-y border-white dark:border-white/5">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <Typography variant="h2" class="font-bold">{{ t('home.artists.title') }}</Typography>
          <NuxtLink :to="ROUTES.ARTIST.INDEX"
            class="text-text-accent font-bold text-sm flex items-center hover:underline group">
            {{ t('home.artists.viewAll') }}
            <ArrowRight
              class="w-4 h-4 ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition rtl:rotate-180" />
          </NuxtLink>
        </div>

        <div v-if="isClientLoading || featuredArtists.length > 0" class="relative">
          <CarouselNav direction="left" size="md" :ariaLabel="t('toolbox.ariaLabels.scrollLeft')"
            @click="scrollCarousel(-1)" />

          <div ref="artistCarouselRef"
            class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth px-10">
            <template v-if="isClientLoading">
              <SkeletonArtistCard v-for="i in 6" :key="i" class="shrink-0 snap-center" />
            </template>
            <template v-else>
              <div v-for="artist in featuredArtists" :key="artist._id"
                class="flex flex-col items-center shrink-0 group cursor-pointer snap-center"
                @click="artist._id && $router.push(ROUTES.ARTIST.DETAIL(artist._id))">
                <ArtistCard :name="getArtistName(artist)" :song-count="artist.chords || 0"
                  :songs-label="t('home.artists.songs')" :gradient-border="(artist as any)._mockColor" />
              </div>
            </template>
          </div>

          <CarouselNav direction="right" size="md" :ariaLabel="t('toolbox.ariaLabels.scrollRight')"
            @click="scrollCarousel(1)" />
        </div>
        <div v-else class="flex justify-center py-8 text-text-secondary">
          <Typography variant="body">{{ t('home.artists.emptyState') }}</Typography>
        </div>
      </div>
    </section>

    <!-- TODO: Uncomment when CommunitySection is ready -->
    <!-- <CommunitySection :just-happened-title="t('community.justHappened')" :cta-title="t('community.title')"
      :cta-description="t('community.description')" :cta-description-highlight="t('community.descriptionHighlight')"
      :cta-button-text="t('community.button')" /> -->

  </div>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
