<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Filter, X, Music, AlertCircle } from 'lucide-vue-next'
import Typography from '~/components/base/Typography.vue'
import Input from '~/components/base/Input.vue'
import Button from '~/components/base/Button.vue'
import Card from '~/components/base/Card.vue'
import Drawer from '~/components/base/Drawer.vue'
import SongCard from '~/components/widget/SongCard.vue'
import SkeletonCard from '~/components/widget/SkeletonCard.vue'
import CtaCard from '~/components/widget/CtaCard.vue'
import DiscoveryFilters, { type FilterState } from '~/components/widget/DiscoveryFilters.vue'
import { useTabService } from '~/composables/useTabService'
import { useI18nRtl } from '~/composables/useI18nRtl'
import type { SongWithPopulatedRefs, Genre } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isRtl } = useI18nRtl()
const { searchSongsAdvanced, fetchGenres } = useTabService()

// State
const searchQuery = ref('')
const filters = ref<FilterState>({
  genre: 'all',
  key: 'all',
  rhythm: undefined,
  sort: 'newest',
})
const songs = ref<SongWithPopulatedRefs[]>([])
const genres = ref<Genre[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const showFiltersDrawer = ref(false)
const itemsPerPage = 12
const totalResults = ref(0)
const totalPages = ref(0)
let paginationController: ReturnType<typeof searchSongsAdvanced> | null = null

// Computed
const hasResults = computed(() => songs.value.length > 0)
const hasQuery = computed(() => searchQuery.value.trim().length > 0)
const hasFilters = computed(() => {
  return !!(filters.value.genre !== 'all' && filters.value.genre || filters.value.key !== 'all' || filters.value.rhythm)
})

const drawerPosition = computed(() => isRtl.value ? 'right' : 'left')

// Load genres on mount
onMounted(async () => {
  genres.value = await fetchGenres()

  // Read initial state from URL
  const query = route.query.q as string
  const genre = route.query.genre as string
  const key = route.query.key as 'major' | 'minor' | 'all'
  const rhythm = route.query.rhythm as string
  const sort = route.query.sort as 'newest' | 'oldest' | 'a-z' | 'z-a'
  const page = parseInt(route.query.page as string) || 1

  if (query) searchQuery.value = query
  if (genre) filters.value.genre = genre
  else filters.value.genre = 'all'
  if (key) filters.value.key = key
  if (rhythm) filters.value.rhythm = rhythm
  if (sort) filters.value.sort = sort
  currentPage.value = page

  // Always perform initial search to fetch songs
  await performSearch()
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const performSearch = async () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    isLoading.value = true
    error.value = null

    try {
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
      paginationController = await searchSongsAdvanced(searchFilters, (docs) => {
        songs.value = docs
      })

      await paginationController.updatePagination()

      // Fetch the current page
      await paginationController.fetchPage(currentPage.value)

      // Read pagination data from controller after fetching
      if (paginationController.pagination) {
        totalResults.value = paginationController.pagination.total || 0
        totalPages.value = paginationController.pagination.pages || 0
      }

      // Update URL
      updateURL()
    } catch (err) {
      error.value = t('pages.discovery.error')
      console.error('Search error:', err)
    } finally {
      isLoading.value = false
    }
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
const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
  isLoading.value = true
  error.value = null

  try {
    if (paginationController) {
      // Fetch the page
      await paginationController.fetchPage(page)

      // Read pagination data from controller after fetching
      if (paginationController.pagination) {
        totalResults.value = paginationController.pagination.total || 0
        totalPages.value = paginationController.pagination.pages || 0
      }
    } else {
      await performSearch()
    }
    updateURL()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = t('pages.discovery.error')
    console.error('Pagination error:', err)
  } finally {
    isLoading.value = false
  }
}

// Navigate to song
const navigateToSong = (id: string) => {
  router.push(ROUTES.TAB.DETAIL(id))
}

// Get page numbers for pagination UI
const getPageNumbers = (): (number | string)[] => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (currentPage.value > 3) {
      pages.push('...')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(totalPages.value - 1, currentPage.value + 1)

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages.value) {
        pages.push(i)
      }
    }

    if (currentPage.value < totalPages.value - 2) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
}
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
          <div v-if="hasResults || hasQuery || hasFilters" class="mb-6">
            <Typography variant="h2" class="mb-2">
              <span v-if="hasQuery || hasFilters">{{ t('pages.discovery.searchResults') }}</span>
              <span v-else>{{ t('pages.discovery.title') }}</span>
              <span v-if="searchQuery" class="text-text-accent">{{ searchQuery }}</span>
            </Typography>
            <Typography v-if="hasResults || totalResults > 0" variant="body" class="text-text-secondary">
              {{ t('pages.discovery.resultsCount', { count: totalResults }) }}
            </Typography>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SkeletonCard v-for="i in 8" :key="i" />
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
            <AlertCircle class="w-16 h-16 text-text-error mb-4" />
            <Typography variant="h3" class="mb-2">{{ error }}</Typography>
            <Button @click="performSearch">
              {{ t('pages.discovery.retry') }}
            </Button>
          </div>

          <!-- Results Grid -->
          <div v-else-if="hasResults" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div v-if="hasResults && totalPages > 1" class="mt-8 flex flex-col items-center gap-4">
            <div class="flex items-center gap-2">
              <Button variant="secondary" size="sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                {{ t('pages.discovery.previous') }}
              </Button>

              <!-- Page Numbers -->
              <div class="flex items-center gap-1">
                <button v-for="page in getPageNumbers()" :key="page" :class="[
                  'px-3 py-1.5 rounded-lg text-sm font-bold transition-colors',
                  page === currentPage
                    ? 'bg-text-accent text-white'
                    : 'bg-surface-card text-text-secondary hover:bg-surface-base hover:text-text-primary'
                ]" :disabled="page === '...'" @click="typeof page === 'number' && goToPage(page)">
                  {{ page }}
                </button>
              </div>

              <Button variant="secondary" size="sm" :disabled="currentPage >= totalPages"
                @click="goToPage(currentPage + 1)">
                {{ t('pages.discovery.next') }}
              </Button>
            </div>
            <Typography variant="caption" class="text-text-secondary">
              {{ t('pages.discovery.page') }} {{ currentPage }} {{ t('common.of') }} {{ totalPages }}
            </Typography>
          </div>
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
