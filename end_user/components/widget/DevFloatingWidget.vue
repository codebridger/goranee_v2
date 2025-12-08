<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sun, Languages, ToggleLeft, ToggleRight, X, Settings } from 'lucide-vue-next'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { useAppConfigStore } from '~/stores/appConfig'
import { useContentLanguageStore } from '~/stores/contentLanguage'

const { t } = useI18n()
const appConfig = useAppConfigStore()
const contentLanguageStore = useContentLanguageStore()

const props = withDefaults(
  defineProps<{
    isLoading?: boolean
    onLoadingToggle?: () => void
  }>(),
  {
    isLoading: false,
  },
)

const emit = defineEmits<{
  'update:isLoading': [value: boolean]
}>()

const isExpanded = ref(false)
const isLanguageMenuOpen = ref(false)
const isDevMode = process.dev

const toggleTheme = () => {
  appConfig.toggleTheme()
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
    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-2">
      <div v-if="isExpanded"
        class="bg-surface-card rounded-2xl shadow-2xl border border-border-subtle p-4 min-w-[200px] mb-2">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-text-secondary uppercase">Dev Tools</span>
          <button @click="isExpanded = false" class="p-1 rounded-lg hover:bg-surface-base transition cursor-pointer">
            <X class="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div class="space-y-2">
          <!-- Theme Toggle -->
          <button @click="toggleTheme"
            class="w-full px-4 py-2 rounded-xl hover:bg-surface-base transition flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <component :is="appConfig.isDark ? Sun : Moon" class="w-4 h-4" />
              <span class="text-sm font-medium">
                {{
                  appConfig.isDark
                    ? t('home.themeToggle.switchToLight')
                    : t('home.themeToggle.switchToDark')
                }}
              </span>
            </div>
          </button>

          <!-- Loading Toggle -->
          <button @click="toggleLoading"
            class="w-full px-4 py-2 rounded-xl hover:bg-surface-base transition flex items-center justify-between cursor-pointer">
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
            <span class="text-xs font-bold">{{ contentLanguageStore.currentDirection }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Control Buttons -->
    <div class="flex gap-2">
      <!-- Language Switcher -->
      <LanguageSwitcher v-model="isLanguageMenuOpen" />

      <!-- Expand/Collapse Button -->
      <button @click="isExpanded = !isExpanded"
        class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition cursor-pointer"
        :title="isExpanded ? 'Close Dev Tools' : 'Open Dev Tools'">
        <component :is="isExpanded ? X : Settings" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
