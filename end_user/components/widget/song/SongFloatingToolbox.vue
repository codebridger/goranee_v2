<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Music, Play, Pause, Zap, Minus, Plus } from 'lucide-vue-next'
import { useTranspose } from '~/composables/useTranspose'
import IconButton from '~/components/base/IconButton.vue'

const { t } = useI18n()

interface Props {
  rootNote?: string
  keyQuality?: 'major' | 'minor'
  transposeSteps: number
  isScrolling: boolean
  scrollSpeed: number
  fontSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:transpose', value: number): void
  (e: 'toggleScroll'): void
  (e: 'update:speed', value: number): void
  (e: 'update:fontSize', value: number): void
}>()

const { transposeNote } = useTranspose()

// Helper to show current key
const currentKey = computed(() => {
  if (!props.rootNote) return props.keyQuality || '?'
  const transposedNote = transposeNote(props.rootNote, props.transposeSteps)
  return props.keyQuality ? `${transposedNote} ${props.keyQuality}` : transposedNote
})

// Original key display
const originalKey = computed(() => {
  if (!props.rootNote) return props.keyQuality || '?'
  return props.keyQuality ? `${props.rootNote} ${props.keyQuality}` : props.rootNote
})

// Mobile drawer state
const showMobileDrawer = ref(false)
const activeTab = ref<'transpose' | 'scroll' | 'font'>('transpose')

const openDrawer = (tab: 'transpose' | 'scroll' | 'font') => {
  activeTab.value = tab
  showMobileDrawer.value = true
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
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1 mb-2">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer"
            @click="emit('update:transpose', props.transposeSteps - 1)">
            -
          </button>
          <span class="font-mono font-bold text-lg">{{ currentKey }}</span>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer"
            @click="emit('update:transpose', props.transposeSteps + 1)">
            +
          </button>
        </div>
        <div class="text-center text-xs text-text-muted">
          {{ t('toolbox.original') }}: {{ originalKey }}
        </div>
      </div>

      <!-- Auto Scroll Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.autoScroll') }}</div>
        <button
          class="w-full px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center mb-3 cursor-pointer"
          :class="props.isScrolling ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-text-accent text-white hover:bg-[#ff5ca6]'"
          @click="emit('toggleScroll')">
          {{ props.isScrolling ? t('toolbox.stop') : t('toolbox.start') }}
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">{{ t('toolbox.speed') }}</span>
          <input type="range" min="1" max="10" :value="props.scrollSpeed"
            @input="e => emit('update:speed', Number((e.target as HTMLInputElement).value))"
            class="w-full accent-text-accent">
        </div>
      </div>

      <!-- Font Size Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">{{ t('toolbox.fontSize') }}</div>
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1">
          <button class="flex-1 py-1 text-sm font-bold hover:bg-surface-base rounded cursor-pointer"
            @click="emit('update:fontSize', Math.max(0.8, props.fontSize - 0.1))">
            A-
          </button>
          <span class="w-px h-4 bg-border-subtle"></span>
          <button class="flex-1 py-1 text-lg font-bold hover:bg-surface-base rounded cursor-pointer"
            @click="emit('update:fontSize', Math.min(2.0, props.fontSize + 0.1))">
            A+
          </button>
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
          <span v-if="originalKey" class="font-mono text-[10px] opacity-70 leading-none">{{ originalKey }}</span>
          <span v-if="originalKey && props.transposeSteps !== 0" class="text-[8px] opacity-50">→</span>
          <span class="font-mono font-bold text-xs leading-none">{{ currentKey }}</span>
        </div>
      </button>

      <IconButton :icon="props.isScrolling ? Pause : Play" variant="primary" size="md"
        :ariaLabel="props.isScrolling ? t('toolbox.ariaLabels.stopScrolling') : t('toolbox.ariaLabels.startScrolling')"
        @click="emit('toggleScroll')" class="-mt-6! justify-self-center shadow-lg" />

      <button
        class="flex flex-col items-center gap-1 text-text-muted active:text-text-accent justify-self-end cursor-pointer"
        @click="openDrawer('scroll')">
        <Zap class="w-5 h-5" />
        <span class="text-[10px] font-bold">{{ props.scrollSpeed }}x</span>
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

          <div class="flex items-center justify-center gap-6">
            <IconButton :icon="Minus" variant="secondary" size="sm"
              :ariaLabel="t('toolbox.ariaLabels.decreaseTranspose')"
              @click="emit('update:transpose', props.transposeSteps - 1)" />

            <div class="text-center">
              <div class="text-4xl font-bold font-mono text-text-accent">{{ currentKey }}</div>
              <div class="text-sm text-text-muted mt-1">{{ t('toolbox.original') }}: {{ originalKey }}</div>
            </div>

            <IconButton :icon="Plus" variant="secondary" size="sm"
              :ariaLabel="t('toolbox.ariaLabels.increaseTranspose')"
              @click="emit('update:transpose', props.transposeSteps + 1)" />
          </div>

          <div class="bg-surface-muted rounded-xl p-4 text-center">
            <div class="text-sm text-text-muted mb-1">{{ t('toolbox.recommendedCapo') }}</div>
            <!-- Simple capo logic: if negative transposition, maybe capo? Just placeholder for now -->
            <div class="font-bold">{{ t('toolbox.none') }}</div>
          </div>
        </div>

        <!-- Scroll/Speed Tab -->
        <div v-else-if="activeTab === 'scroll'" class="space-y-6">
          <h3 class="text-lg font-bold text-center">{{ t('toolbox.autoScrollSpeed') }}</h3>

          <div class="text-center mb-4">
            <div class="text-4xl font-bold text-text-accent">{{ props.scrollSpeed }}x</div>
          </div>

          <div class="px-4">
            <input type="range" min="1" max="10" :value="props.scrollSpeed"
              @input="e => emit('update:speed', Number((e.target as HTMLInputElement).value))"
              class="w-full accent-text-accent h-2 bg-surface-muted rounded-lg cursor-pointer">
            <div class="flex justify-between text-xs text-text-muted mt-2">
              <span>{{ t('toolbox.slow') }}</span>
              <span>{{ t('toolbox.fast') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between bg-surface-muted rounded-xl p-4">
            <span class="text-sm font-bold">{{ t('toolbox.fontSize') }}</span>
            <div class="flex items-center gap-4">
              <IconButton :icon="Minus" variant="secondary" size="sm"
                :ariaLabel="t('toolbox.ariaLabels.decreaseFontSize')"
                @click="emit('update:fontSize', Math.max(0.8, props.fontSize - 0.1))" />
              <span class="text-sm">{{ Math.round(props.fontSize * 100) }}%</span>
              <IconButton :icon="Plus" variant="secondary" size="sm"
                :ariaLabel="t('toolbox.ariaLabels.increaseFontSize')"
                @click="emit('update:fontSize', Math.min(2.0, props.fontSize + 0.1))" />
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
</style>
