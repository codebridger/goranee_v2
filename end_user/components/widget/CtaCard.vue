<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import Button from '~/components/base/Button.vue'

defineProps<{
  title: string
  description: string
  buttonText: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    class="rounded-[2rem] p-12 text-white relative overflow-hidden flex flex-col items-center text-center bg-grad-primary shadow-xl mb-12"
  >
    <div class="relative z-10 max-w-2xl">
      <h3 class="text-3xl font-black mb-4">
        {{ title }}
      </h3>
      <p class="text-pink-100 mb-8 text-lg">
        {{ description }}
      </p>
      <Button
        variant="secondary"
        class="bg-white text-pink-600 border-transparent hover:bg-pink-50"
        @click="$emit('click')"
      >
        {{ buttonText }}
        <ArrowRight class="w-4 h-4 ms-2 rtl:rotate-180" />
      </Button>
    </div>
    <!-- Decor -->
    <div class="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full -ms-20 -mt-20 blur-2xl"></div>
    <div
      class="absolute bottom-0 end-0 w-64 h-64 bg-purple-900/20 rounded-full -me-20 -mb-20 blur-2xl"
    ></div>
  </div>
</template>

