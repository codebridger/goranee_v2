<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Navbar from '~/components/widget/Navbar.vue'
import Footer from '~/components/widget/Footer.vue'
import { ROUTES } from '~/constants/routes'

const route = useRoute()
const { t } = useI18n()
const isScrolled = ref(false)
const isDevLoading = ref(false)

// Determine if the navbar should be transparent (homepage only for now)
const isHome = computed(() => route.name === 'index' || route.path === '/')
const isTransparent = computed(() => isHome.value && !isScrolled.value)

const handleScroll = () => {
	isScrolled.value = window.scrollY > 50
}

onMounted(() => {
	window.addEventListener('scroll', handleScroll)
	handleScroll() // Check initial position
})

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
	<div
		class="min-h-screen bg-surface-base text-text-primary transition-colors duration-300 font-sans relative flex flex-col">

		<!-- Navbar Wrapper -->
		<div :class="[
			'z-50 w-full transition-all duration-300',
			isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
		]">
			<Navbar :logo="t('navbar.logo')" :search-placeholder="t('navbar.searchPlaceholder')" :links="[
				{ label: t('navbar.links.discovery'), to: ROUTES.DISCOVERY },
				{ label: t('navbar.links.artists'), to: ROUTES.ARTIST.INDEX },
				{ label: t('navbar.links.community'), to: ROUTES.COMMUNITY },
			]" :login-text="t('navbar.login')" :explore-text="t('navbar.explore')" :is-transparent="isTransparent" />
		</div>

		<!-- Main Content -->
		<main class="grow">
			<slot />
		</main>

		<!-- Footer -->
		<Footer :description="t('footer.description')" :discover-title="t('footer.sections.discover.title')"
			:discover-links="{
				newArrivals: t('footer.sections.discover.newArrivals'),
				trendingCharts: t('footer.sections.discover.trendingCharts'),
				featuredArtists: t('footer.sections.discover.featuredArtists'),
				songRequests: t('footer.sections.discover.songRequests'),
			}" :community-title="t('footer.sections.community.title')" :community-links="{
				signUpLogin: t('footer.sections.community.signUpLogin'),
				submitChord: t('footer.sections.community.submitChord'),
				topContributors: t('footer.sections.community.topContributors'),
				discordServer: t('footer.sections.community.discordServer'),
			}" :legal-title="t('footer.sections.legal.title')" :legal-links="{
				privacyPolicy: t('footer.sections.legal.privacyPolicy'),
				termsOfService: t('footer.sections.legal.termsOfService'),
				dmcaGuidelines: t('footer.sections.legal.dmcaGuidelines'),
			}" :copyright="t('footer.copyright')" :design-system="t('footer.designSystem')" />

		<!-- Dev Mode Floating Widget -->
		<DevFloatingWidget v-model:is-loading="isDevLoading" />
	</div>
</template>
