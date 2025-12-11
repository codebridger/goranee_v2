<template>
  <div v-if="availableLangs.length > 1" class="flex justify-center mb-4 language-switcher-wrapper" dir="rtl">
    <SegmentedControl :model-value="currentLang" :options="languageOptions" size="md"
      @update:model-value="switchToLang" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { LanguageCode } from '~/constants/routes'
import { ROUTES } from '~/constants/routes'
import SegmentedControl from '~/components/base/SegmentedControl.vue'

const props = defineProps<{
  availableLangs: LanguageCode[]
  currentLang: LanguageCode
  songId: string
}>()

const router = useRouter()
const { t } = useI18n()

const languageOptions = computed(() => {
  return props.availableLangs.map((lang) => ({
    value: lang,
    label: getLangLabel(lang),
  }))
})

const switchToLang = (lang: LanguageCode) => {
  if (!props.availableLangs.includes(lang)) return

  const newPath = lang === 'ckb-IR'
    ? ROUTES.TAB.DETAIL(props.songId) // Default: no lang in URL
    : ROUTES.TAB.DETAIL(props.songId, lang)

  router.push(newPath)
}

const getLangLabel = (lang: LanguageCode): string => {
  const translation = t(`song.languages.${lang}`)
  return (translation as string) || lang
}
</script>

<style scoped>
.language-switcher-wrapper :deep(button) {
  white-space: nowrap;
  min-width: fit-content;
}

.language-switcher-wrapper :deep(span) {
  white-space: nowrap;
}
</style>
