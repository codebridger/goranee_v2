<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Typography from '~/components/base/Typography.vue'

const route = useRoute()
const { t } = useI18n()
const query = route.query.q
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <Typography variant="h1" class="mb-4">{{ t('pages.discovery.title') }}</Typography>
    <p class="text-text-secondary text-lg mb-8">
      {{ t('pages.discovery.subtitle') }}
    </p>
    
    <div v-if="query" class="bg-surface-card p-6 rounded-xl border border-border-subtle">
      <p>{{ t('pages.discovery.searchResults') }} <span class="font-bold text-text-primary">{{ query }}</span></p>
    </div>
    <div v-else class="text-text-secondary">
      {{ t('pages.discovery.placeholder') }}
    </div>
  </div>
</template>
