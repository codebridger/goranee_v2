<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Search, Music } from 'lucide-vue-next'
import Typography from '~/components/base/Typography.vue'
import Input from '~/components/base/Input.vue'
import Button from '~/components/base/Button.vue'
import SegmentedControl from '~/components/base/SegmentedControl.vue'
import ArtistCard from '~/components/widget/ArtistCard.vue'
import SkeletonCard from '~/components/widget/SkeletonCard.vue'
import { useTabService } from '~/composables/useTabService'
import type { Artist } from '~/types/song.type'
import { ROUTES } from '~/constants/routes'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { fetchAllArtists } = useTabService()

// State
const artists = ref<Artist[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref<'name-asc' | 'name-desc' | 'popularity-desc' | 'popularity-asc'>('name-asc')
const currentPage = ref(1)
const itemsPerPage = 24

// Computed
const sortOptions = computed(() => [
  { value: 'name-asc', label: `${t('pages.artists.name')} (A-Z)` },
  { value: 'name-desc', label: `${t('pages.artists.name')} (Z-A)` },
  { value: 'popularity-desc', label: `${t('pages.artists.popularity')} (High)` },
  { value: 'popularity-asc', label: `${t('pages.artists.popularity')} (Low)` },
])

// Load artists
const loadArtists = async () => {
  isLoading.value = true
  try {
    const results = await fetchAllArtists({
      limit: itemsPerPage,
      skip: (currentPage.value - 1) * itemsPerPage,
      sort: sortBy.value,
      search: searchQuery.value.trim() || undefined,
    })
    artists.value = results
  } catch (error) {
    console.error('Failed to load artists:', error)
  } finally {
    isLoading.value = false
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadArtists()
  }, 300)
})

watch(sortBy, () => {
  currentPage.value = 1
  loadArtists()
})

// Pagination
const goToPage = (page: number) => {
  currentPage.value = page
  loadArtists()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Navigate to artist
const navigateToArtist = (id: string) => {
  router.push(ROUTES.ARTIST.DETAIL(id))
}

onMounted(() => {
  // Read initial state from URL
  const query = route.query.q as string
  const sort = route.query.sort as typeof sortBy.value
  const page = parseInt(route.query.page as string) || 1

  if (query) searchQuery.value = query
  if (sort) sortBy.value = sort
  currentPage.value = page

  loadArtists()
})
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
          <Input
            v-model="searchQuery"
            :placeholder="t('pages.artists.searchPlaceholder')"
            :icon="Search"
          />
        </div>
        <div class="md:w-64">
          <SegmentedControl
            :model-value="sortBy"
            :options="sortOptions"
            @update:model-value="(val) => sortBy = val"
          />
        </div>
      </div>

      <!-- Results Count -->
      <div v-if="!isLoading && artists.length > 0" class="mb-6">
        <Typography variant="body" class="text-text-secondary">
          {{ t('pages.artists.artistsCount', { count: artists.length }) }}
        </Typography>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <SkeletonCard v-for="i in 12" :key="i" />
      </div>

      <!-- Artists Grid -->
      <div v-else-if="artists.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <ArtistCard
          v-for="artist in artists"
          :key="artist._id"
          :name="artist.name"
          :song-count="artist.chords || 0"
          :songs-label="t('common.songs')"
          @click="navigateToArtist(artist._id || '')"
        />
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
      <div v-if="artists.length >= itemsPerPage" class="mt-8 flex justify-center items-center gap-2">
        <Button
          variant="secondary"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          {{ t('pages.discovery.previous') }}
        </Button>
        <span class="flex items-center px-4 text-text-secondary">
          {{ t('pages.discovery.page') }} {{ currentPage }}
        </span>
        <Button
          variant="secondary"
          :disabled="artists.length < itemsPerPage"
          @click="goToPage(currentPage + 1)"
        >
          {{ t('pages.discovery.next') }}
        </Button>
      </div>
    </div>
  </div>
</template>
