<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Share2, Mic } from 'lucide-vue-next';
import { ROUTES } from '~/constants/routes';

const { t } = useI18n()

// Use i18n translations directly
const footerDescription = computed(() => t('footer.description'))
const footerDiscoverTitle = computed(() => t('footer.sections.discover.title'))
const footerDiscoverLinks = computed(() => ({
	newArrivals: t('footer.sections.discover.newArrivals'),
	trendingCharts: t('footer.sections.discover.trendingCharts'),
	featuredArtists: t('footer.sections.discover.featuredArtists'),
	songRequests: t('footer.sections.discover.songRequests'),
}))
const footerCommunityTitle = computed(() => t('footer.sections.community.title'))
const footerCommunityLinks = computed(() => ({
	signUpLogin: t('footer.sections.community.signUpLogin'),
	submitChord: t('footer.sections.community.submitChord'),
	topContributors: t('footer.sections.community.topContributors'),
	discordServer: t('footer.sections.community.discordServer'),
}))
const footerLegalTitle = computed(() => t('footer.sections.legal.title'))
const footerLegalLinks = computed(() => ({
	privacyPolicy: t('footer.sections.legal.privacyPolicy'),
	termsOfService: t('footer.sections.legal.termsOfService'),
	dmcaGuidelines: t('footer.sections.legal.dmcaGuidelines'),
}))
const footerCopyright = computed(() => t('footer.copyright'))
const footerDesignSystem = computed(() => t('footer.designSystem'))
</script>

<template>
	<footer class="bg-[#2A1B28] text-white pt-16 pb-8 px-6 mt-10 rounded-t-[3rem]">
		<div class="max-w-7xl mx-auto flex justify-between gap-8 mb-12">
			<div>
				<div class="flex items-center gap-2 mb-4">
					<div
						class="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold">
						G</div>
					<h4 class="font-black text-2xl tracking-tighter">Goranee</h4>
				</div>
				<p class="text-gray-400 text-sm leading-relaxed">
					{{ footerDescription }}
				</p>
			</div>



			<!-- TODO: Uncomment when Community section is ready -->
			<div>
				<!-- <h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ footerCommunityTitle }}</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li><NuxtLink to="/login" class="hover:text-white cursor-pointer transition">{{ footerCommunityLinks.signUpLogin }}</NuxtLink></li>
					<li><NuxtLink to="/upload" class="hover:text-white cursor-pointer transition">{{ footerCommunityLinks.submitChord }}</NuxtLink></li>
					<li><NuxtLink to="/community?tag=top" class="hover:text-white cursor-pointer transition">{{ footerCommunityLinks.topContributors }}</NuxtLink></li>
					<li><a href="#" class="hover:text-white cursor-pointer transition">{{ footerCommunityLinks.discordServer }}</a></li>
				</ul> -->
			</div>
			<!-- TODO: Uncomment when Legal section is ready -->
			<div>
				<!-- <h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ footerLegalTitle }}</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li><NuxtLink to="/legal/privacy" class="hover:text-white cursor-pointer transition">{{ footerLegalLinks.privacyPolicy }}</NuxtLink></li>
					<li><NuxtLink to="/legal/terms" class="hover:text-white cursor-pointer transition">{{ footerLegalLinks.termsOfService }}</NuxtLink></li>
					<li><NuxtLink to="/legal/dmca" class="hover:text-white cursor-pointer transition">{{ footerLegalLinks.dmcaGuidelines }}</NuxtLink></li>
				</ul> -->
			</div>

			<div>
				<h5 class="font-bold mb-4 text-text-accent uppercase text-xs tracking-wider">{{ footerDiscoverTitle }}
				</h5>
				<ul class="space-y-2 text-sm text-gray-300">
					<li>
						<NuxtLink to="/discovery" class="hover:text-white cursor-pointer transition">
							{{ footerDiscoverLinks.newArrivals }}
						</NuxtLink>
					</li>
					<li>
						<NuxtLink to="/discovery?sort=trending" class="hover:text-white cursor-pointer transition">
							{{ footerDiscoverLinks.trendingCharts }}
						</NuxtLink>
					</li>
					<li>
						<NuxtLink :to="ROUTES.ARTIST.INDEX" class="hover:text-white cursor-pointer transition">
							{{ footerDiscoverLinks.featuredArtists }}
						</NuxtLink>
					</li>
					<!-- <li>
						<NuxtLink to="/community?tag=requests" class="hover:text-white cursor-pointer transition">
							{{ footerDiscoverLinks.songRequests }}
						</NuxtLink>
					</li> -->
				</ul>
			</div>
		</div>

		<div
			class="text-center text-gray-600 text-xs border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-center items-center gap-4">
			<span>{{ footerCopyright }}</span>
			<!-- <div class="flex gap-4">
				<div
					class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
					<Share2 class="w-4 h-4" />
				</div>
				<div
					class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition">
					<Mic class="w-4 h-4" />
				</div>
			</div> -->
			<span class="md:mt-0">{{ footerDesignSystem }}</span>
		</div>
	</footer>
</template>
