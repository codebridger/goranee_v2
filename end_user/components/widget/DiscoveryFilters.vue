<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from '~/components/base/Card.vue'
import Tag from '~/components/base/Tag.vue'
import SegmentedControl from '~/components/base/SegmentedControl.vue'
import Input from '~/components/base/Input.vue'
import Button from '~/components/base/Button.vue'
import Typography from '~/components/base/Typography.vue'
import type { Genre } from '~/types/song.type'

export interface FilterState {
  genre?: string | 'all'
  key?: 'major' | 'minor' | 'all'
  rhythm?: string
  sort?: 'newest' | 'oldest' | 'a-z' | 'z-a'
}

const props = defineProps<{
  genres: Genre[]
  filters: FilterState
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
  (e: 'clear'): void
}>()

const { t } = useI18n()

const keyOptions = computed(() => [
  { value: 'all', label: t('pages.discovery.allKeys') },
  { value: 'major', label: t('pages.discovery.major') },
  { value: 'minor', label: t('pages.discovery.minor') },
])

const sortOptions = computed(() => [
  { value: 'newest', label: t('pages.discovery.newest') },
  { value: 'oldest', label: t('pages.discovery.oldest') },
  { value: 'a-z', label: t('pages.discovery.aToZ') },
  { value: 'z-a', label: t('pages.discovery.zToA') },
])

const updateFilter = (key: keyof FilterState, value: any) => {
  const newFilters = { ...props.filters, [key]: value }
  emit('update:filters', newFilters)
}

const toggleGenre = (genreId: string | 'all') => {
  if (genreId === 'all') {
    updateFilter('genre', 'all')
  } else {
    const newGenre = props.filters.genre === genreId ? 'all' : genreId
    updateFilter('genre', newGenre)
  }
}

const hasActiveFilters = computed(() => {
  return !!(props.filters.genre !== 'all' && props.filters.genre || props.filters.key !== 'all' || props.filters.rhythm || props.filters.sort !== 'newest')
})

const handleClear = () => {
  emit('clear')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <Typography variant="h3">{{ t('pages.discovery.filters') }}</Typography>
      <Button
        v-if="hasActiveFilters"
        variant="link"
        size="sm"
        @click="handleClear"
      >
        {{ t('pages.discovery.clearFilters') }}
      </Button>
    </div>

    <!-- Genre Filter -->
    <Card variant="section">
      <Typography variant="caption" class="mb-3">{{ t('pages.discovery.genre') }}</Typography>
      <div class="flex flex-wrap gap-2">
        <Tag
          :label="t('pages.discovery.allGenres')"
          :variant="(filters.genre === 'all' || !filters.genre) ? 'accent' : 'neutral'"
          class="cursor-pointer"
          @click="toggleGenre('all')"
        />
        <Tag
          v-for="genre in genres"
          :key="genre._id"
          :label="genre.title || ''"
          :variant="filters.genre === genre._id ? 'accent' : 'neutral'"
          class="cursor-pointer"
          @click="toggleGenre(genre._id || '')"
        />
      </div>
    </Card>

    <!-- Key Filter -->
    <Card variant="section">
      <Typography variant="caption" class="mb-3">{{ t('pages.discovery.key') }}</Typography>
      <SegmentedControl
        :model-value="filters.key || 'all'"
        :options="keyOptions"
        @update:model-value="(val) => updateFilter('key', val)"
      />
    </Card>

    <!-- Rhythm Filter -->
    <Card variant="section">
      <Typography variant="caption" class="mb-3">{{ t('pages.discovery.rhythm') }}</Typography>
      <Input
        :model-value="filters.rhythm || ''"
        :placeholder="t('pages.discovery.rhythm')"
        @update:model-value="(val) => updateFilter('rhythm', val)"
      />
    </Card>

    <!-- Sort -->
    <Card variant="section">
      <Typography variant="caption" class="mb-3">{{ t('pages.discovery.sortBy') }}</Typography>
      <SegmentedControl
        :model-value="filters.sort || 'newest'"
        :options="sortOptions"
        @update:model-value="(val) => updateFilter('sort', val)"
      />
    </Card>
  </div>
</template>

