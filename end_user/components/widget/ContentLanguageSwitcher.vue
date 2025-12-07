<script setup lang="ts">
import { computed } from 'vue'
import { Globe } from 'lucide-vue-next'
import type { UILanguageOption } from '~/stores/contentLanguage'
import { useContentLanguageStore } from '~/stores/contentLanguage'

const props = withDefaults(
	defineProps<{
		compact?: boolean
		placement?: 'navbar' | 'menu' | 'inline'
	}>(),
	{
		compact: false,
		placement: 'navbar',
	},
)

const contentLanguageStore = useContentLanguageStore()
const isOpen = defineModel<boolean>({ default: false })

const languages: { code: UILanguageOption; nativeLabel: string; shortCode: string }[] = [
	{ code: 'sorani-latin', nativeLabel: 'Sorani', shortCode: 'LAT' },
	{ code: 'sorani-farsi', nativeLabel: 'سورانی', shortCode: 'CKB' },
	{ code: 'farsi', nativeLabel: 'فارسی', shortCode: 'FA' },
	{ code: 'kmr', nativeLabel: 'Kurmanjî', shortCode: 'KMR' },
	{ code: 'english', nativeLabel: 'English', shortCode: 'EN' },
]

const currentLanguage = computed(() => {
	return languages.find((lang) => lang.code === contentLanguageStore.currentUILanguage) ?? languages[2] // Default to farsi
})

const handleLanguageSwitch = (uiLang: UILanguageOption) => {
	contentLanguageStore.setUILanguage(uiLang)
	isOpen.value = false
}

// Determine dropdown position based on placement
const dropdownClass = computed(() => {
	if (props.placement === 'menu') {
		return 'absolute top-full mt-2 start-0 bg-surface-card rounded-2xl shadow-2xl border border-border-subtle p-2 min-w-[180px] z-50'
	}
	// For navbar and inline, open downward
	return 'absolute top-full mt-2 end-0 bg-surface-card rounded-xl shadow-2xl border border-border-subtle p-1 min-w-[140px] z-50'
})
</script>

<template>
	<div class="relative">
		<!-- Language Switcher Button -->
		<button @click="isOpen = !isOpen" :class="[
			'bg-surface-card rounded-full shadow-lg border border-border-subtle hover:scale-110 transition cursor-pointer flex items-center gap-2',
			compact ? 'p-2' : 'p-3',
			placement === 'menu' ? 'w-full justify-between px-4 py-3 rounded-xl' : '',
		]" :title="currentLanguage?.nativeLabel">
			<Globe class="w-5 h-5 flex-shrink-0" />
			<span v-if="!compact || placement === 'menu'" class="text-xs font-bold">
				{{ placement === 'menu' ? currentLanguage?.nativeLabel : currentLanguage?.shortCode }}
			</span>
		</button>

		<!-- Language Dropdown -->
		<Transition enter-active-class="transition duration-200 ease-out"
			enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
			leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100"
			leave-to-class="transform scale-95 opacity-0">
			<div v-if="isOpen" :class="dropdownClass" @click.stop>
				<button v-for="lang in languages" :key="lang.code" @click.stop="handleLanguageSwitch(lang.code)"
					class="w-full text-start px-3 py-2 rounded-lg hover:bg-surface-base transition cursor-pointer"
					:class="{
						'bg-surface-base font-semibold': contentLanguageStore.currentUILanguage === lang.code,
					}">
					<span class="text-sm">{{ lang.nativeLabel }}</span>
				</button>
			</div>
		</Transition>

		<!-- Backdrop to close dropdown -->
		<div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>
	</div>
</template>
