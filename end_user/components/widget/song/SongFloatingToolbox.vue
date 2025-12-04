<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Music, Play, Pause, Zap, Minus, Plus, ChevronLeft, ChevronRight, LayoutGrid, AlignJustify } from 'lucide-vue-next'
import { useTranspose } from '~/composables/useTranspose'
import IconButton from '~/components/base/IconButton.vue'

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

// Select a specific key
const selectKey = (index: number) => {
  emit('update:tableIndex', index)
}

// Speed control constants
const MIN_SPEED = 0.1
const MAX_SPEED = 4
const SPEED_STEP = 0.1

// Step speed up or down
const stepSpeed = (direction: -1 | 1) => {
  const newSpeed = Math.round((props.scrollSpeed + direction * SPEED_STEP) * 10) / 10
  if (newSpeed >= MIN_SPEED && newSpeed <= MAX_SPEED) {
    emit('update:speed', newSpeed)
  }
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
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.transpose') }}</div>

        <!-- +/- Controls -->
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1 mb-3">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer"
            @click="stepKey(-1)" :aria-label="t('toolbox.ariaLabels.decreaseTranspose')">
            <Minus class="w-4 h-4" />
          </button>
          <span class="font-mono font-bold text-lg">{{ currentKeyName }}</span>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer"
            @click="stepKey(1)" :aria-label="t('toolbox.ariaLabels.increaseTranspose')">
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <!-- Key Carousel -->
        <div class="relative mb-3">
          <!-- Left Arrow -->
          <button
            class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-base/90 transition-all cursor-pointer group"
            @click="scrollCarousel(carouselRef, -1)">
            <ChevronLeft class="w-4 h-4 text-text-primary/60 group-hover:text-text-primary transition-colors" />
          </button>

          <!-- Carousel Container -->
          <div ref="carouselRef" class="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth px-7 py-1"
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

          <!-- Right Arrow -->
          <button
            class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-base/90 transition-all cursor-pointer group"
            @click="scrollCarousel(carouselRef, 1)">
            <ChevronRight class="w-4 h-4 text-text-primary/60 group-hover:text-text-primary transition-colors" />
          </button>
        </div>

        <div class="text-center text-xs text-text-muted">
          {{ t('toolbox.original') }}: {{ originalKeyName }}
        </div>
      </div>

      <!-- Auto Scroll Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.autoScroll') }}</div>
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
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="scrollSpeed <= MIN_SPEED" @click="stepSpeed(-1)">
            <Minus class="w-4 h-4" />
          </button>
          <span class="font-mono font-bold text-lg min-w-[3rem] text-center">{{ scrollSpeed }}x</span>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="scrollSpeed >= MAX_SPEED" @click="stepSpeed(1)">
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Font Size Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.fontSize') }}</div>
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1">
          <button class="flex-1 py-1 text-sm font-bold hover:bg-surface-base rounded-md cursor-pointer"
            @click="emit('update:fontSize', Math.max(0.8, fontSize - 0.1))">
            A-
          </button>
          <span class="w-px h-4 bg-border-subtle"></span>
          <button class="flex-1 py-1 text-lg font-bold hover:bg-surface-base rounded-md cursor-pointer"
            @click="emit('update:fontSize', Math.min(2.0, fontSize + 0.1))">
            A+
          </button>
        </div>
      </div>

      <!-- Layout Card (Grid Toggle) -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.layout') }}</div>
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1 mb-3">
          <button class="flex-1 py-2 flex items-center justify-center gap-2 rounded-md cursor-pointer transition-colors"
            :class="!gridMode ? 'bg-surface-base shadow-sm' : 'hover:bg-surface-base/50'"
            @click="emit('update:gridMode', false)">
            <AlignJustify class="w-4 h-4" />
            <span class="text-xs font-medium">{{ t('toolbox.list') }}</span>
          </button>
          <button class="flex-1 py-2 flex items-center justify-center gap-2 rounded-md cursor-pointer transition-colors"
            :class="gridMode ? 'bg-surface-base shadow-sm' : 'hover:bg-surface-base/50'"
            @click="emit('update:gridMode', true)">
            <LayoutGrid class="w-4 h-4" />
            <span class="text-xs font-medium">{{ t('toolbox.grid') }}</span>
          </button>
        </div>

        <!-- Column selector (only visible when grid mode is on) -->
        <div v-if="gridMode" class="flex items-center justify-between">
          <span class="text-xs text-text-muted">{{ t('toolbox.columns') }}</span>
          <div class="flex items-center bg-surface-muted rounded-lg p-0.5">
            <button v-for="option in columnOptions" :key="option.value"
              class="px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors"
              :class="gridColumns === option.value ? 'bg-surface-base shadow-sm' : 'hover:bg-surface-base/50 text-text-muted'"
              @click="emit('update:gridColumns', option.value)">
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
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
    <div v-if="showMobileDrawer" class="lg:hidden fixed inset-0 z-60">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDrawer"></div>

      <div class="absolute bottom-0 left-0 right-0 bg-surface-base rounded-t-2xl p-6 animate-slide-up">
        <div class="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-6"></div>

        <!-- Transpose Tab -->
        <div v-if="activeTab === 'transpose'" class="space-y-6">
          <h3 class="text-lg font-bold text-center">{{ t('toolbox.transposeKey') }}</h3>

          <!-- +/- Controls with Current Key -->
          <div class="flex items-center justify-center gap-6">
            <IconButton :icon="Minus" variant="secondary" size="sm"
              :ariaLabel="t('toolbox.ariaLabels.decreaseTranspose')" @click="stepKey(-1)" />

            <div class="text-center">
              <div class="text-4xl font-bold font-mono text-text-accent">{{ currentKeyName }}</div>
              <div class="text-sm text-text-muted mt-1">{{ t('toolbox.original') }}: {{ originalKeyName }}</div>
            </div>

            <IconButton :icon="Plus" variant="secondary" size="sm"
              :ariaLabel="t('toolbox.ariaLabels.increaseTranspose')" @click="stepKey(1)" />
          </div>

          <!-- Key Carousel (Mobile) -->
          <div class="relative">
            <!-- Left Arrow -->
            <button
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-base/90 transition-all cursor-pointer group"
              @click="scrollCarousel(mobileCarouselRef, -1)">
              <ChevronLeft class="w-5 h-5 text-text-primary/60 group-hover:text-text-primary transition-colors" />
            </button>

            <!-- Carousel Container -->
            <div ref="mobileCarouselRef" class="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10 py-2"
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

            <!-- Right Arrow -->
            <button
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-surface-base/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-base/90 transition-all cursor-pointer group"
              @click="scrollCarousel(mobileCarouselRef, 1)">
              <ChevronRight class="w-5 h-5 text-text-primary/60 group-hover:text-text-primary transition-colors" />
            </button>
          </div>

          <div class="bg-surface-muted rounded-xl p-4 text-center">
            <div class="text-sm text-text-muted mb-1">{{ t('toolbox.recommendedCapo') }}</div>
            <div class="font-bold">{{ t('toolbox.none') }}</div>
          </div>
        </div>

        <!-- Scroll/Speed Tab -->
        <div v-else-if="activeTab === 'scroll'" class="space-y-6">
          <h3 class="text-lg font-bold text-center">{{ t('toolbox.autoScrollSpeed') }}</h3>

          <div class="flex items-center justify-center gap-6">
            <IconButton :icon="Minus" variant="secondary" size="sm" :disabled="scrollSpeed <= MIN_SPEED"
              :ariaLabel="t('toolbox.ariaLabels.decreaseSpeed')" @click="stepSpeed(-1)" />

            <div class="text-center">
              <div class="text-4xl font-bold font-mono text-text-accent min-w-[5rem]">{{ scrollSpeed }}x</div>
            </div>

            <IconButton :icon="Plus" variant="secondary" size="sm" :disabled="scrollSpeed >= MAX_SPEED"
              :ariaLabel="t('toolbox.ariaLabels.increaseSpeed')" @click="stepSpeed(1)" />
          </div>

          <div class="flex items-center justify-between bg-surface-muted rounded-xl p-4">
            <span class="text-sm font-bold">{{ t('toolbox.fontSize') }}</span>
            <div class="flex items-center gap-4">
              <IconButton :icon="Minus" variant="secondary" size="sm"
                :ariaLabel="t('toolbox.ariaLabels.decreaseFontSize')"
                @click="emit('update:fontSize', Math.max(0.8, fontSize - 0.1))" />
              <span class="text-sm">{{ Math.round(fontSize * 100) }}%</span>
              <IconButton :icon="Plus" variant="secondary" size="sm"
                :ariaLabel="t('toolbox.ariaLabels.increaseFontSize')"
                @click="emit('update:fontSize', Math.min(2.0, fontSize + 0.1))" />
            </div>
          </div>

          <!-- Grid Layout & Columns Combined (Mobile) -->
          <div class="bg-surface-muted rounded-xl p-4 space-y-3">
            <!-- Layout Toggle Row -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold">{{ t('toolbox.layout') }}</span>
              <div class="flex items-center bg-surface-base rounded-lg p-1">
                <button class="p-2 rounded-md cursor-pointer transition-colors"
                  :class="!gridMode ? 'bg-text-accent text-white' : 'text-text-muted hover:text-text-primary'"
                  @click="emit('update:gridMode', false)">
                  <AlignJustify class="w-5 h-5" />
                </button>
                <button class="p-2 rounded-md cursor-pointer transition-colors"
                  :class="gridMode ? 'bg-text-accent text-white' : 'text-text-muted hover:text-text-primary'"
                  @click="emit('update:gridMode', true)">
                  <LayoutGrid class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Columns Row (always visible, disabled when not in grid mode) -->
            <div class="flex items-center justify-between transition-opacity"
              :class="{ 'opacity-40 pointer-events-none': !gridMode }">
              <span class="text-sm font-bold">{{ t('toolbox.columns') }}</span>
              <div class="flex items-center bg-surface-base rounded-lg p-1">
                <button v-for="option in columnOptions" :key="option.value"
                  class="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors"
                  :class="gridColumns === option.value ? 'bg-text-accent text-white' : 'text-text-muted hover:text-text-primary'"
                  @click="emit('update:gridColumns', option.value)" :disabled="!gridMode">
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          class="w-full px-4 py-4 rounded-lg font-bold transition-colors flex items-center justify-center hover:bg-surface-muted text-text-muted mt-6 cursor-pointer"
          @click="closeDrawer">
          {{ t('toolbox.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

/* Hide scrollbar for carousel */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
