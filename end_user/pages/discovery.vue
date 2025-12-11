<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Filter, X, Music, AlertCircle } from 'lucide-vue-next'
import Typography from '~/components/base/Typography.vue'
import Input from '~/components/base/Input.vue'
import Button from '~/components/base/Button.vue'
import Drawer from '~/components/base/Drawer.vue'
import SongCard from '~/components/widget/SongCard.vue'
import SkeletonCard from '~/components/widget/SkeletonCard.vue'
import CtaCard from '~/components/widget/CtaCard.vue'
import Pagination from '~/components/widget/Pagination.vue'
import DiscoveryFilters, { type FilterState } from '~/components/widget/DiscoveryFilters.vue'
import { useTabService } from '~/composables/useTabService'
import { useI18nRtl } from '~/composables/useI18nRtl'
import type { SongWithPopulatedRefs, Genre } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'
import type { PaginatedResponseType } from '@modular-rest/client/dist/types/data-provider.type'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isRtl } = useI18nRtl()
const { searchSongsAdvanced, fetchGenres } = useTabService()

// Read initial state from URL (works in SSR)
const query = route.query.q as string
const genre = route.query.genre as string
const key = route.query.key as 'major' | 'minor' | 'all'
const rhythm = route.query.rhythm as string
const sort = route.query.sort as 'newest' | 'oldest' | 'a-z' | 'z-a'
const page = parseInt(route.query.page as string) || 1

// State
const searchQuery = ref(query || '')
const filters = ref<FilterState>({
  genre: genre || 'all',
  key: key || 'all',
  rhythm: rhythm || undefined,
  sort: sort || 'newest',
})
const songs = ref<SongWithPopulatedRefs[]>([])
const showFiltersDrawer = ref(false)
const itemsPerPage = 12
const currentPage = ref(page)
const totalResults = ref(0)
const totalPages = ref(0)
const paginationController = ref<PaginatedResponseType<SongWithPopulatedRefs> | null>(null)

// Fetch genres with SSR support
const { data: genresData } = await useAsyncData('discovery-genres', () => fetchGenres(), {
  server: true,
  lazy: true,
})
const genres = computed(() => genresData.value || [])

// Computed
const hasResults = computed(() => songs.value.length > 0)
const hasQuery = computed(() => searchQuery.value.trim().length > 0)
const hasFilters = computed(() => {
  return !!(filters.value.genre !== 'all' && filters.value.genre || filters.value.key !== 'all' || filters.value.rhythm)
})

const drawerPosition = computed(() => isRtl.value ? 'right' : 'left')

// Build search key for useAsyncData
const getSearchKey = () => {
  return `discovery-search-${searchQuery.value}-${filters.value.genre}-${filters.value.key}-${filters.value.rhythm}-${filters.value.sort}-${currentPage.value}`
}

// Fetch search results with SSR support
const { data: searchData, pending: isLoading, error: searchError, refresh: refreshSearch } = await useAsyncData(
  getSearchKey,
  async () => {
    // Build search filters object, only including properties that have values
    const searchFilters: {
      query?: string
      genre?: string
      key?: 'major' | 'minor'
      rhythm?: string
      sort?: 'newest' | 'oldest' | 'a-z' | 'z-a'
      limit: number
      page: number
    } = {
      limit: itemsPerPage,
      page: currentPage.value,
    }

    // Only add query if it has a value
    if (searchQuery.value.trim()) {
      searchFilters.query = searchQuery.value.trim()
    }

    // Only add genre if it's not 'all'
    if (filters.value.genre && filters.value.genre !== 'all') {
      searchFilters.genre = filters.value.genre
    }

    // Only add key if it's not 'all'
    if (filters.value.key && filters.value.key !== 'all') {
      searchFilters.key = filters.value.key
    }

    // Only add rhythm if it has a value
    if (filters.value.rhythm?.trim()) {
      searchFilters.rhythm = filters.value.rhythm.trim()
    }

    // Add sort (always has a default)
    searchFilters.sort = filters.value.sort || 'newest'

    // Get pagination controller
    const controller = await searchSongsAdvanced(searchFilters, (docs) => {
      songs.value = docs
    })

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
      songs: songs.value,
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

// Sync searchData to reactive refs
watch(searchData, (data) => {
  if (data) {
    songs.value = data.songs
    totalResults.value = data.totalResults
    totalPages.value = data.totalPages
  }
}, { immediate: true })

const error = computed(() => searchError.value ? t('pages.discovery.error') : null)

// Client-only loading state
const isClientLoading = computed(() => {
  return process.client && isLoading.value
})

// Debounced search refresh
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const performSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    updateURL()
    // useAsyncData will automatically refetch when the key changes (via getSearchKey function)
  }, 300)
}

// Update URL query params
const updateURL = () => {
  const query: Record<string, string> = {}

  if (searchQuery.value.trim()) query.q = searchQuery.value.trim()
  if (filters.value.genre && filters.value.genre !== 'all') query.genre = filters.value.genre as string
  if (filters.value.key && filters.value.key !== 'all') query.key = filters.value.key
  if (filters.value.rhythm?.trim()) query.rhythm = filters.value.rhythm.trim()
  if (filters.value.sort && filters.value.sort !== 'newest') query.sort = filters.value.sort
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  router.push({ query })
}

// Watch for filter changes
watch(() => filters.value, () => {
  currentPage.value = 1
  performSearch()
}, { deep: true })

// Watch for search query changes
watch(searchQuery, () => {
  currentPage.value = 1
  performSearch()
})

// Clear filters
const clearFilters = () => {
  filters.value = {
    genre: 'all',
    key: 'all',
    rhythm: undefined,
    sort: 'newest',
  }
  currentPage.value = 1
}

// Pagination
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
  updateURL()
  // useAsyncData will automatically refetch when the key changes (via getSearchKey function)

  // Scroll to top (client-only)
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Navigate to song
const navigateToSong = (id: string) => {
  router.push(ROUTES.TAB.DETAIL(id))
}

// SEO: Meta tags
const baseUrl = useBaseUrl()
const discoveryTitle = computed(() => {
  if (hasQuery.value) {
    return `${t('pages.discovery.searchResults')} "${searchQuery.value}" - Goranee`
  }
  return `${t('pages.discovery.title')} - Goranee`
})
const discoveryDescription = computed(() => {
  if (hasQuery.value) {
    return `Search results for "${searchQuery.value}" on Goranee. Find Kurdish chord sheets and songs.`
  }
  return 'Discover and search Kurdish songs with chord sheets. Filter by genre, key, rhythm and find the perfect song to learn.'
})

useSeoMeta({
  title: discoveryTitle,
  description: discoveryDescription,
  ogTitle: discoveryTitle,
  ogDescription: discoveryDescription,
  ogImage: `${baseUrl.value}/favicon.ico`,
  ogType: 'website',
  ogUrl: computed(() => `${baseUrl.value}/discovery${route.query.q ? `?q=${route.query.q}` : ''}`),
  twitterCard: 'summary_large_image',
  twitterTitle: discoveryTitle,
  twitterDescription: discoveryDescription,
  twitterImage: `${baseUrl.value}/favicon.ico`,
})

</script>

<template>
  <div class="min-h-screen bg-surface-base">
    <!-- Search Bar (Sticky) -->
    <div class="sticky top-0 z-30 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div class="flex items-center gap-4">
          <!-- Mobile Filter Button -->
          <Button variant="secondary" size="sm" class="md:hidden" @click="showFiltersDrawer = true">
            <Filter class="w-4 h-4 me-2" />
            {{ t('pages.discovery.filters') }}
          </Button>

          <!-- Search Input -->
          <div class="flex-1">
            <Input v-model="searchQuery" :placeholder="t('navbar.searchPlaceholder')" :icon="Search" />
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div class="flex gap-8">
        <!-- Filters Sidebar (Desktop) -->
        <aside class="hidden md:block w-72 shrink-0">
          <div class="sticky top-24">
            <DiscoveryFilters :genres="genres" :filters="filters" @update:filters="(newFilters) => filters = newFilters"
              @clear="clearFilters" />
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <!-- Results Header -->
          <div v-if="hasResults && hasQuery" class="mb-6">
            <Typography variant="h2" class="mb-2">
              <span v-if="hasQuery">{{ t('pages.discovery.searchResults') }}</span>
              <span v-else>{{ t('pages.discovery.title') }}</span>
              <span v-if="searchQuery" class="text-text-accent">{{ searchQuery }}</span>
            </Typography>
            <Typography v-if="hasResults || totalResults > 0" variant="body" class="text-text-secondary">
              {{ t('pages.discovery.resultsCount', { count: totalResults }) }}
            </Typography>
          </div>

          <!-- Loading State -->
          <div v-if="isClientLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SkeletonCard v-for="i in 8" :key="i" />
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
            <AlertCircle class="w-16 h-16 text-text-error mb-4" />
            <Typography variant="h3" class="mb-2">{{ error }}</Typography>
            <Button @click="refreshSearch">
              {{ t('pages.discovery.retry') }}
            </Button>
          </div>

          <!-- Results Grid -->
          <div v-else-if="hasResults" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-6">
            <SongCard v-for="song in songs" :key="song._id" :song="song" @click="navigateToSong(song._id)" />
          </div>

          <!-- Empty State - No Results -->
          <div v-else-if="hasQuery || hasFilters" class="flex flex-col items-center justify-center py-16">
            <div class="p-4 rounded-full bg-surface-card mb-4">
              <Music class="w-12 h-12 text-text-secondary/50" />
            </div>
            <Typography variant="h3" class="mb-2">{{ t('pages.discovery.noResults') }}</Typography>
            <Typography variant="body" class="text-text-secondary mb-6 text-center">
              {{ t('pages.discovery.noResultsDescription') }}
            </Typography>
            <!-- @TODO: Add request song button -->
            <CtaCard :title="t('pages.discovery.requestSong')" :description="t('pages.discovery.noResultsDescription')"
              :button-text="t('pages.discovery.requestSong')" @click="() => router.push(ROUTES.COMMUNITY)" />
          </div>

          <!-- Empty State - No Query and No Filters -->
          <div v-else-if="!hasQuery && !hasFilters" class="flex flex-col items-center justify-center py-16">
            <Typography variant="h2" class="mb-4">{{ t('pages.discovery.title') }}</Typography>
            <Typography variant="body" class="text-text-secondary text-lg mb-8 text-center">
              {{ t('pages.discovery.placeholder') }}
            </Typography>
          </div>

          <!-- Pagination -->
          <Pagination v-if="hasResults" :current-page="currentPage" :total-pages="totalPages" @page-change="goToPage" />
        </main>
      </div>
    </div>

    <!-- Mobile Filters Drawer -->
    <Drawer v-model="showFiltersDrawer" :position="drawerPosition" class="md:hidden">
      <template #header>
        <div class="flex items-center justify-between mb-4">
          <Typography variant="h3">{{ t('pages.discovery.filters') }}</Typography>
          <Button variant="link" size="sm" @click="showFiltersDrawer = false">
            <X class="w-5 h-5" />
          </Button>
        </div>
      </template>

      <DiscoveryFilters :genres="genres" :filters="filters" @update:filters="(newFilters) => filters = newFilters"
        @clear="clearFilters" />
    </Drawer>
  </div>
</template>
