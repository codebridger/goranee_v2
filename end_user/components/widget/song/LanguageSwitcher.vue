<template>
  <div class="language-switcher" v-if="availableLangs.length > 1">
    <div class="switcher-label">{{ t('song.language') || 'Language' }}:</div>
    <div class="switcher-buttons">
      <button
        v-for="lang in availableLangs"
        :key="lang"
        :class="{ 
          active: currentLang === lang,
          unavailable: !isLangAvailable(lang)
        }"
        @click="switchToLang(lang)"
        :title="getLangLabel(lang)"
      >
        {{ getLangCode(lang) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { LanguageCode } from '~/constants/routes'
import { ROUTES } from '~/constants/routes'

const props = defineProps<{
  availableLangs: LanguageCode[]
  currentLang: LanguageCode
  songId: string
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const switchToLang = (lang: LanguageCode) => {
  if (!props.availableLangs.includes(lang)) return
  
  const newPath = lang === 'ckb-IR' 
    ? ROUTES.TAB.DETAIL(props.songId) // Default: no lang in URL
    : ROUTES.TAB.DETAIL(props.songId, lang)
  
  router.push(newPath)
}

const getLangLabel = (lang: LanguageCode) => {
  const labels = {
    'ckb-IR': 'سورانی (ایران)',
    'ckb-Latn': 'سورانی (لاتین)',
    'kmr': 'کرمانجی',
  }
  return labels[lang] || lang
}

const getLangCode = (lang: LanguageCode) => {
  // Show short code for UI
  return lang.split('-')[0].toUpperCase()
}

const isLangAvailable = (lang: LanguageCode) => {
  return props.availableLangs.includes(lang)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-card, #f9fafb);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.switcher-label {
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.switcher-buttons {
  display: flex;
  gap: 0.25rem;
}

.switcher-buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border, #e5e7eb);
  background: var(--surface-base, #ffffff);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.switcher-buttons button:hover {
  background: var(--surface-hover, #f3f4f6);
}

.switcher-buttons button.active {
  background: var(--brand-primary, #3b82f6);
  color: white;
  border-color: var(--brand-primary, #3b82f6);
}

.switcher-buttons button.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

