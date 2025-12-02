<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Typography from '~/components/base/Typography.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <Typography variant="h1" class="mb-4">{{ t('pages.artists.title') }}</Typography>
    <p class="text-text-secondary text-lg">
      {{ t('pages.artists.subtitle') }}
    </p>
  </div>
</template>
