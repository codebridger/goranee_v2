<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Music, Play, Pause, Zap, Minus, Plus, ChevronLeft, ChevronRight, LayoutGrid, AlignJustify, RotateCcw } from 'lucide-vue-next'
import { useTranspose } from '~/composables/useTranspose'
import IconButton from '~/components/base/IconButton.vue'
import Stepper from '~/components/base/Stepper.vue'
import SegmentedControl from '~/components/base/SegmentedControl.vue'
import CarouselNav from '~/components/base/CarouselNav.vue'
import Drawer from '~/components/base/Drawer.vue'
import Card from '~/components/base/Card.vue'

const { t } = useI18n()

type GridColumns = 2 | 3 | 'auto'

interface Props {
  currentTableIndex: number
  originalTableIndex: number
  keyQuality?: 'major' | 'minor'
  isScrolling: boolean
  scrollSpeed: number
  fontSize: number
  gridMode?: boolean
  gridColumns?: GridColumns
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:tableIndex', value: number): void
  (e: 'toggleScroll'): void
  (e: 'update:speed', value: number): void
  (e: 'update:fontSize', value: number): void
  (e: 'update:gridMode', value: boolean): void
  (e: 'update:gridColumns', value: GridColumns): void
  (e: 'reset:transpose'): void
  (e: 'reset:scroll'): void
  (e: 'reset:fontSize'): void
  (e: 'reset:layout'): void
}>()

// Column options for grid
const columnOptions: { value: GridColumns; label: string }[] = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 'auto', label: 'Auto' }
]

const { keySignatures, getKeyDisplayName } = useTranspose()

// Carousel refs
const carouselRef = ref<HTMLElement | null>(null)
const mobileCarouselRef = ref<HTMLElement | null>(null)

// Helper to show current key name
const currentKeyName = computed(() => {
  return getKeyDisplayName(props.currentTableIndex, props.keyQuality)
})

// Original key display
const originalKeyName = computed(() => {
  return getKeyDisplayName(props.originalTableIndex, props.keyQuality)
})

// Check if current key is different from original
const isTransposed = computed(() => {
  return props.currentTableIndex !== props.originalTableIndex
})

// Step to next/previous key (wrapping around)
const stepKey = (direction: -1 | 1) => {
  let newIndex = props.currentTableIndex + direction
  if (newIndex < 0) newIndex = 11
  if (newIndex > 11) newIndex = 0
  emit('update:tableIndex', newIndex)
}

// Format key name for stepper
const formatKeyName = (val: number) => {
  return getKeyDisplayName(val, props.keyQuality)
}

// Select a specific key
const selectKey = (index: number) => {
  emit('update:tableIndex', index)
}

// Speed control constants
const MIN_SPEED = 0.1
const MAX_SPEED = 4
const SPEED_STEP = 0.1

// Step speed up or down (kept for mobile IconButton usage)
const stepSpeed = (direction: -1 | 1) => {
  const newSpeed = Math.round((props.scrollSpeed + direction * SPEED_STEP) * 10) / 10
  if (newSpeed >= MIN_SPEED && newSpeed <= MAX_SPEED) {
    emit('update:speed', newSpeed)
  }
}

// Format speed for stepper
const formatSpeed = (val: number) => {
  return `${val}x`
}

// Format font size for stepper
const formatFontSize = (val: number) => {
  return `${Math.round(val * 100)}%`
}

// Scroll carousel to center the selected key
const scrollToKey = (carouselEl: HTMLElement | null, index: number) => {
  if (!carouselEl) return
  const keyButton = carouselEl.querySelector(`[data-key-index="${index}"]`) as HTMLElement
  if (keyButton) {
    const containerWidth = carouselEl.offsetWidth
    const buttonLeft = keyButton.offsetLeft
    const buttonWidth = keyButton.offsetWidth
    const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
    carouselEl.scrollTo({ left: scrollPosition, behavior: 'smooth' })
  }
}

// Watch for index changes to scroll carousel
watch(() => props.currentTableIndex, (newIndex) => {
  nextTick(() => {
    scrollToKey(carouselRef.value, newIndex)
    scrollToKey(mobileCarouselRef.value, newIndex)
  })
})

// Scroll to current key on mount
onMounted(() => {
  nextTick(() => {
    scrollToKey(carouselRef.value, props.currentTableIndex)
  })
})

// Carousel navigation
const scrollCarousel = (carouselEl: HTMLElement | null, direction: -1 | 1) => {
  if (!carouselEl) return
  const scrollAmount = 120 * direction
  carouselEl.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

// Grid mode options for segmented control
const gridModeOptions = computed(() => [
  { value: false, label: t('toolbox.list'), icon: AlignJustify },
  { value: true, label: t('toolbox.grid'), icon: LayoutGrid }
])

// Column options for segmented control
const columnOptionsForControl = computed(() =>
  columnOptions.map(opt => ({ value: opt.value, label: opt.label }))
)

// Mobile drawer state
const showMobileDrawer = ref(false)
const activeTab = ref<'transpose' | 'scroll' | 'font'>('transpose')

const openDrawer = (tab: 'transpose' | 'scroll' | 'font') => {
  activeTab.value = tab
  showMobileDrawer.value = true
  // Scroll to current key when opening drawer
  if (tab === 'transpose') {
    nextTick(() => {
      scrollToKey(mobileCarouselRef.value, props.currentTableIndex)
    })
  }
}

const closeDrawer = () => {
  showMobileDrawer.value = false
}

</script>

<template>
  <div>
    <!-- DESKTOP VIEW (Sticky Sidebar) -->
    <div class="hidden lg:flex flex-col gap-6 sticky top-24">
      <!-- Transpose Card -->
      <Card variant="section" :title="t('toolbox.transpose')">
        <template #header-action>
          <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
            :title="t('toolbox.reset')" @click="emit('reset:transpose')" />
        </template>
        <!-- +/- Controls -->
        <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
        <div class="mb-3" dir="ltr">
          <Stepper :model-value="currentTableIndex" :min="0" :max="11" :step="1" :format-value="formatKeyName"
            :decrease-aria-label="t('toolbox.ariaLabels.decreaseTranspose')"
            :increase-aria-label="t('toolbox.ariaLabels.increaseTranspose')" size="md" variant="compact"
            @update:model-value="(val) => emit('update:tableIndex', val)" />
        </div>

        <!-- Key Carousel -->
        <div class="relative mb-3">
          <CarouselNav direction="left" size="md" :ariaLabel="t('toolbox.ariaLabels.scrollLeft')"
            @click="scrollCarousel(carouselRef, -1)" />

          <!-- Carousel Container -->
          <!-- Note: dir="ltr" is mandatory here to ensure correct order of keys regardless of app direction -->
          <div ref="carouselRef" dir="ltr" class="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth px-7 py-1"
            style="scrollbar-width: none; -ms-overflow-style: none;">
            <button v-for="key in keySignatures" :key="key.index" :data-key-index="key.index"
              class="flex-shrink-0 w-9 h-9 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer" :class="[
                key.index === currentTableIndex
                  ? 'bg-text-accent text-white shadow-md scale-105'
                  : 'bg-surface-muted hover:bg-surface-base text-text-primary',
                key.index === originalTableIndex && key.index !== currentTableIndex
                  ? 'ring-2 ring-text-accent/30'
                  : ''
              ]" @click="selectKey(key.index)">
              {{ keyQuality === 'minor' ? key.minor : key.major }}
            </button>
          </div>

          <CarouselNav direction="right" size="md" :ariaLabel="t('toolbox.ariaLabels.scrollRight')"
            @click="scrollCarousel(carouselRef, 1)" />
        </div>

        <div class="text-center text-xs text-text-muted">
          {{ t('toolbox.original') }}: {{ originalKeyName }}
        </div>
      </Card>

      <!-- Auto Scroll Card -->
      <Card variant="section" :title="t('toolbox.autoScroll')">
        <template #header-action>
          <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
            :title="t('toolbox.reset')" @click="emit('reset:scroll')" />
        </template>
        <div class="relative group">
          <button
            class="w-full px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center mb-3 cursor-pointer"
            :class="isScrolling ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-text-accent text-white hover:opacity-90'"
            :title="t('toolbox.spacebarHint')" @click="emit('toggleScroll')">
            {{ isScrolling ? t('toolbox.stop') : t('toolbox.start') }}
          </button>
          <!-- Tooltip -->
          <div
            class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-muted text-text-muted text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {{ t('toolbox.spacebarHint') }}
          </div>
        </div>

        <div class="text-xs text-text-muted mb-2">{{ t('toolbox.speed') }}</div>
        <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
        <div dir="ltr">
          <Stepper :model-value="scrollSpeed" :min="MIN_SPEED" :max="MAX_SPEED" :step="SPEED_STEP"
            :format-value="formatSpeed" :decrease-aria-label="t('toolbox.ariaLabels.decreaseSpeed')"
            :increase-aria-label="t('toolbox.ariaLabels.increaseSpeed')" size="md" variant="compact"
            @update:model-value="(val) => emit('update:speed', val)" />
        </div>
      </Card>

      <!-- Font Size Card -->
      <Card variant="section" :title="t('toolbox.fontSize')">
        <template #header-action>
          <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
            :title="t('toolbox.reset')" @click="emit('reset:fontSize')" />
        </template>
        <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
        <div dir="ltr">
          <Stepper :model-value="fontSize" :min="0.8" :max="2.0" :step="0.1" :format-value="formatFontSize"
            :decrease-aria-label="t('toolbox.ariaLabels.decreaseFontSize')"
            :increase-aria-label="t('toolbox.ariaLabels.increaseFontSize')" size="md" variant="compact"
            @update:model-value="(val) => emit('update:fontSize', val)" />
        </div>
      </Card>

      <!-- Layout Card (Grid Toggle) -->
      <Card variant="section" :title="t('toolbox.layout')">
        <template #header-action>
          <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
            :title="t('toolbox.reset')" @click="emit('reset:layout')" />
        </template>
        <div class="mb-3">
          <SegmentedControl :model-value="gridMode" :options="gridModeOptions" size="md" variant="default"
            @update:model-value="(val) => emit('update:gridMode', val)" />
        </div>

        <!-- Column selector (only visible when grid mode is on) -->
        <div v-if="gridMode" class="flex items-center justify-between">
          <span class="text-xs text-text-muted">{{ t('toolbox.columns') }}</span>
          <SegmentedControl :model-value="gridColumns" :options="columnOptionsForControl" size="sm" variant="compact"
            @update:model-value="(val) => emit('update:gridColumns', val)" />
        </div>
      </Card>
    </div>

    <!-- MOBILE VIEW (Fixed Bottom Bar) -->
    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-base border-t border-border-subtle px-4 py-3 z-50 grid grid-cols-3 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        class="flex flex-col items-center gap-1 text-text-muted active:text-text-accent justify-self-start cursor-pointer"
        @click="openDrawer('transpose')">
        <Music class="w-5 h-5" />
        <div class="flex items-baseline gap-1.5">
          <span v-if="originalKeyName" class="font-mono text-[10px] opacity-70 leading-none">{{ originalKeyName
          }}</span>
          <span v-if="isTransposed" class="text-[8px] opacity-50">→</span>
          <span class="font-mono font-bold text-xs leading-none" :class="{ 'text-text-accent': isTransposed }">{{
            currentKeyName }}</span>
        </div>
      </button>

      <div class="relative group justify-self-center">
        <IconButton :icon="isScrolling ? Pause : Play" variant="primary" size="md"
          :ariaLabel="isScrolling ? t('toolbox.ariaLabels.stopScrolling') : t('toolbox.ariaLabels.startScrolling')"
          :title="t('toolbox.spacebarHint')" @click="emit('toggleScroll')" class="-mt-6! shadow-lg" />
        <!-- Mobile Tooltip -->
        <div
          class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-muted text-text-muted text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {{ t('toolbox.spacebarHint') }}
        </div>
      </div>

      <button
        class="flex flex-col items-center gap-1 text-text-muted active:text-text-accent justify-self-end cursor-pointer"
        @click="openDrawer('scroll')">
        <Zap class="w-5 h-5" />
        <span class="text-[10px] font-bold">{{ scrollSpeed }}x</span>
      </button>
    </div>

    <!-- MOBILE DRAWER (Overlay) -->
    <Drawer v-model="showMobileDrawer" position="bottom" :backdrop="true" :lock-scroll="false" :close-on-backdrop="true"
      class="lg:hidden">

      <!-- Transpose Tab -->
      <div v-if="activeTab === 'transpose'" class="space-y-6">
        <div class="flex items-center justify-center relative">
          <h3 class="text-lg font-bold text-center">{{ t('toolbox.transposeKey') }}</h3>
          <div class="absolute right-0">
            <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
              :title="t('toolbox.reset')" @click="emit('reset:transpose')" />
          </div>
        </div>

        <!-- +/- Controls with Current Key -->
        <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
        <div class="flex items-center justify-center gap-6" dir="ltr">
          <IconButton :icon="Minus" variant="secondary" size="sm" :ariaLabel="t('toolbox.ariaLabels.decreaseTranspose')"
            @click="stepKey(-1)" />

          <div class="text-center">
            <div class="text-4xl font-bold font-mono text-text-accent">{{ currentKeyName }}</div>
            <div class="text-sm text-text-muted mt-1">{{ t('toolbox.original') }}: {{ originalKeyName }}</div>
          </div>

          <IconButton :icon="Plus" variant="secondary" size="sm" :ariaLabel="t('toolbox.ariaLabels.increaseTranspose')"
            @click="stepKey(1)" />
        </div>

        <!-- Key Carousel (Mobile) -->
        <div class="relative">
          <CarouselNav direction="left" size="lg" :ariaLabel="t('toolbox.ariaLabels.scrollLeft')"
            @click="scrollCarousel(mobileCarouselRef, -1)" />

          <!-- Carousel Container -->
          <!-- Note: dir="ltr" is mandatory here to ensure correct order of keys regardless of app direction -->
          <div ref="mobileCarouselRef" dir="ltr"
            class="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10 py-2"
            style="scrollbar-width: none; -ms-overflow-style: none;">
            <button v-for="key in keySignatures" :key="key.index" :data-key-index="key.index"
              class="flex-shrink-0 w-12 h-12 rounded-xl font-mono text-base font-bold transition-all cursor-pointer"
              :class="[
                key.index === currentTableIndex
                  ? 'bg-text-accent text-white shadow-lg scale-110'
                  : 'bg-surface-muted hover:bg-surface-base text-text-primary',
                key.index === originalTableIndex && key.index !== currentTableIndex
                  ? 'ring-2 ring-text-accent/30'
                  : ''
              ]" @click="selectKey(key.index)">
              {{ keyQuality === 'minor' ? key.minor : key.major }}
            </button>
          </div>

          <CarouselNav direction="right" size="lg" :ariaLabel="t('toolbox.ariaLabels.scrollRight')"
            @click="scrollCarousel(mobileCarouselRef, 1)" />
        </div>

        <div class="bg-surface-muted rounded-xl p-4 text-center">
          <div class="text-sm text-text-muted mb-1">{{ t('toolbox.recommendedCapo') }}</div>
          <div class="font-bold">{{ t('toolbox.none') }}</div>
        </div>
      </div>

      <!-- Scroll/Speed Tab -->
      <div v-else-if="activeTab === 'scroll'" class="space-y-6">
        <div class="flex items-center justify-center relative">
          <h3 class="text-lg font-bold text-center">{{ t('toolbox.autoScrollSpeed') }}</h3>
          <div class="absolute right-0">
            <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
              :title="t('toolbox.reset')" @click="emit('reset:scroll')" />
          </div>
        </div>

        <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
        <div class="flex items-center justify-center gap-6" dir="ltr">
          <IconButton :icon="Minus" variant="secondary" size="sm" :disabled="scrollSpeed <= MIN_SPEED"
            :ariaLabel="t('toolbox.ariaLabels.decreaseSpeed')" @click="stepSpeed(-1)" />

          <div class="text-center">
            <div class="text-4xl font-bold font-mono text-text-accent min-w-[5rem]">{{ scrollSpeed }}x</div>
          </div>

          <IconButton :icon="Plus" variant="secondary" size="sm" :disabled="scrollSpeed >= MAX_SPEED"
            :ariaLabel="t('toolbox.ariaLabels.increaseSpeed')" @click="stepSpeed(1)" />
        </div>

        <div class="flex items-center justify-between bg-surface-muted rounded-xl p-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold">{{ t('toolbox.fontSize') }}</span>
            <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
              :title="t('toolbox.reset')" @click="emit('reset:fontSize')" />
          </div>
          <!-- Note: dir="ltr" is mandatory here to ensure correct order of +/- controls regardless of app direction -->
          <div dir="ltr">
            <Stepper :model-value="fontSize" :min="0.8" :max="2.0" :step="0.1" :format-value="formatFontSize"
              :decrease-aria-label="t('toolbox.ariaLabels.decreaseFontSize')"
              :increase-aria-label="t('toolbox.ariaLabels.increaseFontSize')" size="sm" variant="compact"
              @update:model-value="(val) => emit('update:fontSize', val)" />
          </div>
        </div>

        <!-- Grid Layout & Columns Combined (Mobile) -->
        <div class="bg-surface-muted rounded-xl p-4 space-y-3">
          <!-- Layout Toggle Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold">{{ t('toolbox.layout') }}</span>
              <IconButton :icon="RotateCcw" variant="ghost" size="xs" :ariaLabel="t('toolbox.reset')"
                :title="t('toolbox.reset')" @click="emit('reset:layout')" />
            </div>
            <SegmentedControl :model-value="gridMode" :options="gridModeOptions" size="lg" variant="compact"
              @update:model-value="(val) => emit('update:gridMode', val)" />
          </div>

          <!-- Columns Row (always visible, disabled when not in grid mode) -->
          <div class="flex items-center justify-between transition-opacity"
            :class="{ 'opacity-40 pointer-events-none': !gridMode }">
            <span class="text-sm font-bold">{{ t('toolbox.columns') }}</span>
            <SegmentedControl :model-value="gridColumns" :options="columnOptionsForControl" size="md" variant="compact"
              @update:model-value="(val) => emit('update:gridColumns', val)" />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          class="w-full px-4 py-4 rounded-lg font-bold transition-colors flex items-center justify-center hover:bg-surface-muted text-text-muted cursor-pointer"
          @click="closeDrawer">
          {{ t('toolbox.close') }}
        </button>
      </template>
    </Drawer>
  </div>
</template>

<style scoped>
/* Hide scrollbar for carousel */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
