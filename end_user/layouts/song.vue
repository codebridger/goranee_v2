<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Navbar from '~/components/widget/Navbar.vue'
import MiniFooter from '~/components/widget/MiniFooter.vue'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
const isDevLoading = ref(false)
</script>

<template>
	<div class="min-h-screen bg-surface-base text-text-primary font-sans relative flex flex-col">
		<!-- Navbar (Sticky) -->
		<div class="sticky top-0 left-0 right-0 z-50 w-full">
			<Navbar :logo="t('navbar.logo')" :search-placeholder="t('navbar.searchPlaceholder')" :links="[
				{ label: t('navbar.links.discovery'), to: ROUTES.DISCOVERY },
				{ label: t('navbar.links.artists'), to: ROUTES.ARTIST.INDEX },
				{ label: t('navbar.links.community'), to: ROUTES.COMMUNITY },
			]" :login-text="t('navbar.login')" :explore-text="t('navbar.explore')" :is-transparent="false" />
		</div>

		<!-- Main Content -->
		<main class="grow">
			<slot />
		</main>

		<!-- Simple Footer -->
		<div class="container mx-auto px-4 py-8">
			<MiniFooter :copyright="t('footer.copyright')" />
		</div>

		<!-- Dev Mode Floating Widget -->
		<!-- <DevFloatingWidget v-model:is-loading="isDevLoading" /> -->
	</div>
</template>
