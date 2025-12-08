<script setup lang="ts">
import { computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  formatValue?: (val: number) => string
  decreaseAriaLabel: string
  increaseAriaLabel: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'compact' | 'spacious'
}

const props = withDefaults(defineProps<Props>(), {
  step: 0.1,
  size: 'md',
  variant: 'compact',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const displayValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.modelValue)
  }
  return props.modelValue.toString()
})

const canDecrease = computed(() => {
  if (props.min !== undefined) {
    return props.modelValue > props.min
  }
  return true
})

const canIncrease = computed(() => {
  if (props.max !== undefined) {
    return props.modelValue < props.max
  }
  return true
})

const decrease = () => {
  if (!canDecrease.value) return
  const newValue = Math.round((props.modelValue - props.step) * 100) / 100
  const clampedValue = props.min !== undefined ? Math.max(props.min, newValue) : newValue
  emit('update:modelValue', clampedValue)
}

const increase = () => {
  if (!canIncrease.value) return
  const newValue = Math.round((props.modelValue + props.step) * 100) / 100
  const clampedValue = props.max !== undefined ? Math.min(props.max, newValue) : newValue
  emit('update:modelValue', clampedValue)
}

const buttonClasses = computed(() => {
  const base = 'flex items-center justify-center rounded-md hover:bg-surface-base transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
  
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }
  
  return `${base} ${sizes[props.size]}`
})

const iconClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  return sizes[props.size]
})

const valueClasses = computed(() => {
  const base = 'font-mono font-bold text-center'
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }
  return `${base} ${sizes[props.size]}`
})

const containerClasses = computed(() => {
  const base = 'flex items-center justify-between bg-surface-muted rounded-lg p-1'
  return props.variant === 'spacious' ? `${base} gap-4` : base
})
</script>

<template>
  <div :class="containerClasses">
    <button
      :class="buttonClasses"
      :disabled="!canDecrease"
      :aria-label="decreaseAriaLabel"
      @click="decrease">
      <Minus :class="iconClasses" />
    </button>
    <span :class="[valueClasses, { 'min-w-[3rem]': variant === 'compact' }]">
      {{ displayValue }}
    </span>
    <button
      :class="buttonClasses"
      :disabled="!canIncrease"
      :aria-label="increaseAriaLabel"
      @click="increase">
      <Plus :class="iconClasses" />
    </button>
  </div>
</template>

