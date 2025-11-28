<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Moon, Sun, Languages, ToggleLeft, ToggleRight, X, Settings } from 'lucide-vue-next'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { isRtlLanguage, type MessageLanguages } from '../../i18n'

const { t, locale } = useI18n()

const props = withDefaults(
  defineProps<{
    isDark?: boolean
    isLoading?: boolean
    onThemeToggle?: () => void
    onLoadingToggle?: () => void
  }>(),
  {
    isDark: false,
    isLoading: false,
  },
)

const emit = defineEmits<{
  'update:isDark': [value: boolean]
  'update:isLoading': [value: boolean]
}>()

const isExpanded = ref(false)
const isLanguageMenuOpen = ref(false)
const isDevMode = import.meta.env.DEV

const currentDirection = computed(() => {
  return isRtlLanguage(locale.value as MessageLanguages) ? 'RTL' : 'LTR'
})

const toggleTheme = () => {
  const newValue = !props.isDark
  emit('update:isDark', newValue)
  if (newValue) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
  props.onThemeToggle?.()
}

const toggleLoading = () => {
  const newValue = !props.isLoading
  emit('update:isLoading', newValue)
  props.onLoadingToggle?.()
}
</script>

<template>
  <div v-if="isDevMode" class="fixed bottom-4 end-4 z-50 flex flex-col gap-2 items-end">
    <!-- Expanded Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-2"
    >
      <div
        v-if="isExpanded"
        class="bg-surface-card rounded-2xl shadow-2xl border border-border-subtle p-4 min-w-[200px] mb-2"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-text-secondary uppercase">Dev Tools</span>
          <button
            @click="isExpanded = false"
            class="p-1 rounded-lg hover:bg-surface-base transition cursor-pointer"
          >
            <X class="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div class="space-y-2">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="w-full px-4 py-2 rounded-xl hover:bg-surface-base transition flex items-center justify-between cursor-pointer"
          >
            <div class="flex items-center gap-2">
              <component :is="isDark ? Sun : Moon" class="w-4 h-4" />
              <span class="text-sm font-medium">
                {{
                  isDark ? t('home.themeToggle.switchToLight') : t('home.themeToggle.switchToDark')
                }}
              </span>
            </div>
          </button>

          <!-- Loading Toggle -->
          <button
            @click="toggleLoading"
            class="w-full px-4 py-2 rounded-xl hover:bg-surface-base transition flex items-center justify-between cursor-pointer"
          >
            <div class="flex items-center gap-2">
              <component :is="isLoading ? ToggleRight : ToggleLeft" class="w-4 h-4" />
              <span class="text-sm font-medium">
                {{
                  isLoading
                    ? t('home.loadingToggle.viewContent')
                    : t('home.loadingToggle.previewLoading')
                }}
              </span>
            </div>
          </button>

          <!-- Language Info -->
          <div class="px-4 py-2 rounded-xl bg-surface-base flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Languages class="w-4 h-4 text-text-secondary" />
              <span class="text-xs text-text-secondary">Direction:</span>
            </div>
            <span class="text-xs font-bold">{{ currentDirection }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Control Buttons -->
    <div class="flex gap-2">
      <!-- Language Switcher -->
      <LanguageSwitcher v-model="isLanguageMenuOpen" />

      <!-- Expand/Collapse Button -->
      <button
        @click="isExpanded = !isExpanded"
        class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition cursor-pointer"
        :title="isExpanded ? 'Close Dev Tools' : 'Open Dev Tools'"
      >
        <component :is="isExpanded ? X : Settings" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
