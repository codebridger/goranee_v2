<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Music } from 'lucide-vue-next'
import Typography from '~/components/base/Typography.vue'
import Input from '~/components/base/Input.vue'
import SegmentedControl from '~/components/base/SegmentedControl.vue'
import ArtistCard from '~/components/widget/ArtistCard.vue'
import SkeletonCard from '~/components/widget/SkeletonCard.vue'
import Pagination from '~/components/widget/Pagination.vue'
import { useTabService } from '~/composables/useTabService'
import type { Artist } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'
import type { PaginatedResponseType } from '@modular-rest/client/dist/types/data-provider.type'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { fetchAllArtists } = useTabService()

// Read initial state from URL (works in SSR)
const query = route.query.q as string
const sort = route.query.sort as 'name-asc' | 'name-desc' | 'popularity-desc' | 'popularity-asc'
const page = parseInt(route.query.page as string) || 1

// State
const artists = ref<Artist[]>([])
const searchQuery = ref(query || '')
const sortBy = ref<'name-asc' | 'name-desc' | 'popularity-desc' | 'popularity-asc'>(sort || 'name-asc')
const currentPage = ref(page)
const itemsPerPage = 24
const totalResults = ref(0)
const totalPages = ref(0)
const paginationController = ref<PaginatedResponseType<Artist> | null>(null)

// Computed
const sortOptions = computed(() => [
  { value: 'name-asc', label: `${t('pages.artists.name')} (A-Z)` },
  { value: 'name-desc', label: `${t('pages.artists.name')} (Z-A)` },
  // { value: 'popularity-desc', label: `${t('pages.artists.popularity')} (High)` },
  // { value: 'popularity-asc', label: `${t('pages.artists.popularity')} (Low)` },
])

// Build search key for useAsyncData
const getArtistsKey = () => {
  return `artists-${searchQuery.value}-${sortBy.value}-${currentPage.value}`
}

// Fetch artists with SSR support
const { data: artistsData, pending: isLoading, refresh: refreshArtists } = await useAsyncData(
  getArtistsKey,
  async () => {
    // Get pagination controller
    let initialDocs: Artist[] = []
    const controller = fetchAllArtists(
      {
        limit: itemsPerPage,
        page: currentPage.value,
        sort: sortBy.value,
        search: searchQuery.value.trim() || undefined,
      },
      (docs) => {
        initialDocs = docs
        artists.value = docs
      }
    )

    await controller?.updatePagination()
    await controller?.fetchPage(currentPage.value)

    // Read pagination data from controller after fetching
    let total = 0
    let pages = 0
    if (controller?.pagination) {
      total = controller.pagination.total || 0
      pages = controller.pagination.pages || 0
    }

    paginationController.value = controller

    return {
      artists: initialDocs.length > 0 ? initialDocs : artists.value,
      totalResults: total,
      totalPages: pages,
    }
  },
  {
    server: true,
    lazy: true,
    immediate: true,
  }
)

// Sync artistsData to reactive refs
watch(artistsData, (data) => {
  if (data) {
    artists.value = data.artists
    totalResults.value = data.totalResults
    totalPages.value = data.totalPages
  }
}, { immediate: true })

// Client-only loading state
const isClientLoading = computed(() => {
  return process.client && isLoading.value
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    // useAsyncData will automatically refetch when the key changes (via getArtistsKey function)
  }, 300)
})

watch(sortBy, () => {
  currentPage.value = 1
  // useAsyncData will automatically refetch when the key changes (via getArtistsKey function)
})

// Pagination
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
  // useAsyncData will automatically refetch when the key changes (via getArtistsKey function)

  // Scroll to top (client-only)
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Navigate to artist
const navigateToArtist = (id: string) => {
  router.push(ROUTES.ARTIST.DETAIL(id))
}

// Extract artist name from content object
const getArtistName = (artist: Artist) => {
  // New structure with content object
  if (artist.content) {
    return artist.content['ckb-IR']?.name || ''
  }
  // Fallback to old structure (for backward compatibility during migration)
  return (artist as any).name || ''
}
</script>

<template>
  <div class="min-h-screen bg-surface-base">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <Typography variant="h1" class="mb-2">{{ t('pages.artists.title') }}</Typography>
        <Typography variant="body" class="text-text-secondary">
          {{ t('pages.artists.subtitle') }}
        </Typography>
      </div>

      <!-- Search and Sort Bar -->
      <div class="mb-8 flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <Input v-model="searchQuery" :placeholder="t('pages.artists.searchPlaceholder')" :icon="Search" />
        </div>
        <div class="md:w-64">
          <SegmentedControl :model-value="sortBy" :options="sortOptions" @update:model-value="(val) => sortBy = val" />
        </div>
      </div>

      <!-- Results Count -->
      <div v-if="!isClientLoading && totalResults > 0" class="mb-6">
        <Typography variant="body" class="text-text-secondary">
          {{ t('pages.artists.artistsCount', { count: totalResults }) }}
        </Typography>
      </div>

      <!-- Loading State -->
      <div v-if="isClientLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <SkeletonCard v-for="i in 12" :key="i" />
      </div>

      <!-- Artists Grid -->
      <div v-else-if="artists.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6 gap-6">
        <ArtistCard v-for="artist in artists" :key="artist._id" :name="getArtistName(artist)"
          :song-count="artist.chords || 0" :songs-label="t('common.songs')"
          :avatar-url="useTabService().getImageUrl(artist.image)" :gradient-border="(artist as any)._mockColor"
          @click="navigateToArtist(artist._id || '')" />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <div class="p-4 rounded-full bg-surface-card mb-4">
          <Music class="w-12 h-12 text-text-secondary/50" />
        </div>
        <Typography variant="h3" class="mb-2">{{ t('pages.artists.noArtists') }}</Typography>
        <Typography variant="body" class="text-text-secondary">
          {{ t('pages.artists.subtitle') }}
        </Typography>
      </div>

      <!-- Pagination -->
      <Pagination v-if="artists.length > 0" :current-page="currentPage" :total-pages="totalPages"
        @page-change="goToPage" />
    </div>
  </div>
</template>
