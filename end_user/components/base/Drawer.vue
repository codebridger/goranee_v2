<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  position?: 'bottom' | 'top' | 'left' | 'right'
  backdrop?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  backdrop: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const drawerClasses = computed(() => {
  const base = 'absolute bg-surface-base p-6'
  const positions = {
    bottom: 'bottom-0 left-0 right-0 rounded-t-2xl animate-slide-up',
    top: 'top-0 left-0 right-0 rounded-b-2xl animate-slide-down',
    left: 'left-0 top-0 bottom-0 rounded-r-2xl animate-slide-left',
    right: 'right-0 top-0 bottom-0 rounded-l-2xl animate-slide-right',
  }
  return `${base} ${positions[props.position]}`
})

// Prevent body scroll when drawer is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-60">
      <div
        v-if="backdrop"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"></div>

      <div :class="drawerClasses">
        <!-- Drag handle for bottom drawer -->
        <div
          v-if="position === 'bottom'"
          class="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-6"></div>

        <!-- Header slot -->
        <div v-if="$slots.header" class="mb-6">
          <slot name="header" />
        </div>

        <!-- Default content -->
        <slot />

        <!-- Footer slot -->
        <div v-if="$slots.footer" class="mt-6">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

.animate-slide-left {
  animation: slideLeft 0.3s ease-out;
}

.animate-slide-right {
  animation: slideRight 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>

