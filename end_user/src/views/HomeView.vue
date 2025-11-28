<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Play, ArrowRight } from 'lucide-vue-next'
import Typography from '../components/base/Typography.vue'
import Button from '../components/base/Button.vue'
import Card from '../components/base/Card.vue'
import Navbar from '../components/widget/Navbar.vue'
import Hero from '../components/widget/Hero.vue'
import TabFilter from '../components/widget/TabFilter.vue'
import SkeletonCard from '../components/widget/SkeletonCard.vue'
import CommunitySection from '../components/widget/CommunitySection.vue'
import Footer from '../components/widget/Footer.vue'
import DevFloatingWidget from '../components/widget/DevFloatingWidget.vue'

const { t } = useI18n()

const isLoading = ref(false)

const featuredSongs = [
  { title: 'Xam', artist: 'Zakaria', key: 'Cm', rhythm: 'Slow 6/8', img: 'purple' },
  { title: 'Gule', artist: 'Hassan', key: 'Am', rhythm: 'Kurdish 7/8', img: 'pink' },
  { title: 'Baran', artist: 'Nazdar', key: 'Gm', rhythm: '4/4 Pop', img: 'blue' },
  { title: 'Dlem', artist: 'Kamaran', key: 'Dm', rhythm: 'Georgina', img: 'orange' },
]

const artists = [
  { name: 'Zakaria', color: 'from-pink-500 to-rose-500' },
  { name: 'Dashni', color: 'from-purple-500 to-indigo-500' },
  { name: 'Hassan', color: 'from-blue-500 to-cyan-500' },
  { name: 'Chopy', color: 'from-orange-500 to-red-500' },
  { name: 'Navid', color: 'from-emerald-500 to-teal-500' },
]

const tabs = computed(() => [
  t('home.discovery.tabs.all'),
  t('home.discovery.tabs.pop'),
  t('home.discovery.tabs.folklore'),
  t('home.discovery.tabs.slow'),
  t('home.discovery.tabs.halparke'),
])

const activeTab = ref(t('home.discovery.tabs.all'))
</script>

<template>
  <div
    class="min-h-screen bg-surface-base text-text-primary transition-colors duration-300 font-sans relative"
  >
    <!-- Dev Mode Floating Widget -->
    <DevFloatingWidget v-model:is-loading="isLoading" />

    <Navbar
      :logo="t('navbar.logo')"
      :search-placeholder="t('navbar.searchPlaceholder')"
      :links="[
        { label: t('navbar.links.discovery'), to: '/discovery' },
        { label: t('navbar.links.artists'), to: '/artists' },
        { label: t('navbar.links.community'), to: '/community' },
      ]"
      :login-text="t('navbar.login')"
      :explore-text="t('navbar.explore')"
    />

    <Hero
      :badge="t('hero.badge')"
      :title="t('hero.title')"
      :title-highlight="t('hero.titleHighlight')"
      :title-line2="t('hero.titleLine2')"
      :description="t('hero.description')"
      :start-playing-text="t('hero.startPlaying')"
      :submit-chord-text="t('hero.submitChord')"
      :featured-artist-label="t('hero.featuredArtist')"
      :trending-now-label="t('hero.trendingNow')"
    />

    <!-- --- SONG DISCOVERY --- -->
    <section class="px-6 py-16 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <Typography variant="h2" class="font-bold">{{ t('home.discovery.title') }}</Typography>
          <Typography variant="body" class="text-text-secondary">{{
            t('home.discovery.subtitle')
          }}</Typography>
        </div>
        <TabFilter :tabs="tabs" :activeTab="activeTab" @change="activeTab = $event" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <template v-if="isLoading">
          <SkeletonCard v-for="i in 4" :key="i" />
        </template>
        <template v-else>
          <Card v-for="(song, i) in featuredSongs" :key="i" variant="song" hoverable>
            <div
              class="h-48 rounded-2xl bg-gradient-to-br mb-4 relative overflow-hidden shadow-inner group"
              :class="`from-${song.img}-400 to-${song.img}-600`"
            >
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-sm"
              >
                <div
                  class="w-14 h-14 rounded-full bg-grad-primary flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300"
                >
                  <Play class="w-6 h-6 text-white fill-current ml-1" />
                </div>
              </div>
            </div>
            <div class="flex justify-between items-start">
              <div>
                <Typography variant="h3" class="mb-1">{{ song.title }}</Typography>
                <Typography variant="caption" class="text-text-secondary normal-case"
                  >{{ song.artist }}
                </Typography>
              </div>
              <div class="flex flex-col items-end gap-1">
                <div
                  class="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 min-w-[30px] text-center"
                >
                  {{ song.key }}
                </div>
                <div
                  class="bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-900/30"
                >
                  {{ song.rhythm }}
                </div>
              </div>
            </div>
          </Card>
        </template>
      </div>
    </section>

    <!-- --- ARTIST SCROLL (Snap Scrolling) --- -->
    <section
      class="py-16 bg-surface-card/50 backdrop-blur-sm border-y border-white dark:border-white/5"
    >
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center mb-8">
          <Typography variant="h2" class="font-bold">{{ t('home.artists.title') }}</Typography>
          <a
            href="#"
            class="text-text-accent font-bold text-sm flex items-center hover:underline group"
          >
            {{ t('home.artists.viewAll') }}
            <ArrowRight
              class="w-4 h-4 ms-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition rtl:rotate-180"
            />
          </a>
        </div>

        <div class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          <div
            v-for="(artist, i) in artists"
            :key="i"
            class="flex flex-col items-center flex-shrink-0 group cursor-pointer snap-center"
          >
            <div
              class="w-28 h-28 rounded-full bg-gradient-to-br p-[3px] mb-3 group-hover:scale-110 transition duration-300 shadow-lg relative"
              :class="artist.color"
            >
              <div
                class="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden relative"
              >
                <!-- Placeholder for Avatar Image -->
                <div class="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
              </div>
              <!-- Online Status Dot -->
              <div
                class="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"
              ></div>
            </div>
            <span
              class="font-bold text-text-primary group-hover:text-text-accent transition text-lg"
              >{{ artist.name }}</span
            >
            <span
              class="text-xs text-text-secondary font-medium bg-surface-card px-2 py-0.5 rounded-full shadow-sm mt-1"
              >12 {{ t('home.artists.songs') }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <CommunitySection
      :just-happened-title="t('community.justHappened')"
      :cta-title="t('community.title')"
      :cta-description="t('community.description')"
      :cta-description-highlight="t('community.descriptionHighlight')"
      :cta-button-text="t('community.button')"
    />

    <Footer
      :description="t('footer.description')"
      :discover-title="t('footer.sections.discover.title')"
      :discover-links="{
        newArrivals: t('footer.sections.discover.newArrivals'),
        trendingCharts: t('footer.sections.discover.trendingCharts'),
        featuredArtists: t('footer.sections.discover.featuredArtists'),
        songRequests: t('footer.sections.discover.songRequests'),
      }"
      :community-title="t('footer.sections.community.title')"
      :community-links="{
        signUpLogin: t('footer.sections.community.signUpLogin'),
        submitChord: t('footer.sections.community.submitChord'),
        topContributors: t('footer.sections.community.topContributors'),
        discordServer: t('footer.sections.community.discordServer'),
      }"
      :legal-title="t('footer.sections.legal.title')"
      :legal-links="{
        privacyPolicy: t('footer.sections.legal.privacyPolicy'),
        termsOfService: t('footer.sections.legal.termsOfService'),
        dmcaGuidelines: t('footer.sections.legal.dmcaGuidelines'),
      }"
      :copyright="t('footer.copyright')"
      :design-system="t('footer.designSystem')"
    />
  </div>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
