<script setup lang="ts">
import { Share2, Mic } from 'lucide-vue-next'

defineProps<{
  copyright: string
}>()

const { isRtl } = useI18nRtl()
const dir = computed(() => isRtl.value ? 'rtl' : 'ltr')
</script>

<template>
  <div
    class="p-4 lg:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 bg-[#2A1B28] text-white dark:bg-[#0a0509] dark:text-gray-400">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold">
        G
      </div>
      <span class="font-bold tracking-tight">Goranee</span>
    </div>

    <div class="text-xs opacity-60 " :dir="dir">{{ copyright }}</div>

    <div class="flex gap-4">
      <div
        class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
        <Share2 class="w-4 h-4" />
      </div>
      <div
        class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
        <Mic class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>
