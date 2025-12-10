<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const isVisible = ref(false)

const show = () => isVisible.value = true
const hide = () => isVisible.value = false

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
}
</script>

<template>
  <div class="relative inline-flex" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="isVisible && text"
        class="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap pointer-events-none"
        :class="positionClasses[position || 'top']" role="tooltip">
        {{ text }}
        <!-- Arrow -->
        <div class="absolute w-2 h-2 bg-gray-900 transform rotate-45" :class="{
          'bottom-[-4px] left-1/2 -translate-x-1/2': position === 'top' || !position,
          'top-[-4px] left-1/2 -translate-x-1/2': position === 'bottom',
          'right-[-4px] top-1/2 -translate-y-1/2': position === 'left',
          'left-[-4px] top-1/2 -translate-y-1/2': position === 'right'
        }"></div>
      </div>
    </Transition>
  </div>
</template>
