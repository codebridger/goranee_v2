<script setup lang="ts">
import { computed } from 'vue'

interface Option {
	value: any
	label: string
	icon?: any
}

interface Props {
	modelValue: any
	options: Option[]
	size?: 'sm' | 'md' | 'lg'
	variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
	size: 'md',
	variant: 'default',
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: any): void
}>()

const selectOption = (value: any) => {
	emit('update:modelValue', value)
}

const buttonClasses = computed(() => {
	const base = 'flex-1 flex items-center justify-center gap-2 rounded-md cursor-pointer transition-colors'

	const sizes = {
		sm: 'px-2.5 py-1 text-xs',
		md: 'px-2.5 py-1 text-xs',
		lg: 'px-3 py-1.5 text-sm',
	}

	return `${base} ${sizes[props.size]}`
})

const containerClasses = computed(() => {
	const base = 'flex items-center bg-surface-muted rounded-lg'
	return props.variant === 'compact' ? `${base} p-0.5` : `${base} p-1`
})

const iconClasses = computed(() => {
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-4 h-4',
		lg: 'w-5 h-5',
	}
	return sizes[props.size]
})
</script>

<template>
	<div :class="containerClasses">
		<button v-for="option in options" :key="String(option.value)" :class="[
			buttonClasses,
			modelValue === option.value
				? 'bg-surface-base shadow-sm text-text-primary'
				: 'hover:bg-surface-base/50 text-text-muted',
			variant === 'compact' && modelValue === option.value
				? 'bg-surface-base shadow-sm'
				: '',
		]" @click="selectOption(option.value)">
			<component v-if="option.icon" :is="option.icon" :class="iconClasses" />
			<span :class="[
				size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm',
				size === 'md' ? 'font-medium' : ''
			]">
				{{ option.label }}
			</span>
		</button>
	</div>
</template>
