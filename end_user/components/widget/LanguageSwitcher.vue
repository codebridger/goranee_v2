<script setup lang="ts">
import { computed } from 'vue'
import { Languages } from 'lucide-vue-next'
import type { UILanguageOption } from '~/stores/contentLanguage'
import { useAppConfigStore } from '~/stores/appConfig'

const { locale } = useI18n()
const appConfig = useAppConfigStore()

const languages: { code: UILanguageOption; label: string; nativeLabel: string }[] = [
  { code: 'english', label: 'English', nativeLabel: 'English' },
  { code: 'farsi', label: 'Farsi', nativeLabel: 'فارسی' },
]

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === appConfig.currentLanguage) ?? languages[0]
})

const isOpen = defineModel<boolean>({ default: false })

const handleLanguageSwitch = (langCode: UILanguageOption) => {
  appConfig.switchLanguage(langCode)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Language Switcher Button -->
    <button @click="isOpen = !isOpen"
      class="bg-surface-card p-3 rounded-full shadow-lg border border-border-subtle hover:scale-110 transition cursor-pointer flex items-center gap-2"
      :title="currentLanguage?.label">
      <Languages class="w-5 h-5" />
      <span class="text-xs font-bold hidden sm:inline">{{ currentLanguage?.nativeLabel }}</span>
    </button>

    <!-- Language Dropdown -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
      <div v-if="isOpen"
        class="absolute bottom-full mb-2 end-0 bg-surface-card rounded-2xl shadow-2xl border border-border-subtle p-2 min-w-[140px] z-50">
        <button v-for="lang in languages" :key="lang.code" @click="handleLanguageSwitch(lang.code)"
          class="w-full text-start px-4 py-2 rounded-xl hover:bg-surface-base transition flex items-center justify-between gap-3 cursor-pointer"
          :class="{
            'bg-surface-base font-bold': appConfig.currentLanguage === lang.code,
          }">
          <span class="text-sm">{{ lang.nativeLabel }}</span>
          <span class="text-xs text-text-secondary">{{ lang.label }}</span>
        </button>
      </div>
    </Transition>

    <!-- Backdrop to close dropdown -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>
  </div>
</template>
