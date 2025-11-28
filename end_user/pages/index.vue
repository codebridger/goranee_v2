<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowRight, Music } from 'lucide-vue-next'

import { useHomeService } from '~/composables/useHomeService'
import type { SongWithPopulatedRefs, Artist } from '~/types/song.type'

const { t } = useI18n()
const homeService = useHomeService()

const isLoading = ref(true)
const trendingSongs = ref<SongWithPopulatedRefs[]>([])
const featuredArtists = ref<Artist[]>([])

const tabs = computed(() => [
  t('home.discovery.tabs.all'),
  t('home.discovery.tabs.pop'),
  t('home.discovery.tabs.folklore'),
  t('home.discovery.tabs.slow'),
  t('home.discovery.tabs.halparke'),
])

const activeTab = ref(t('home.discovery.tabs.all'))

onMounted(async () => {
  isLoading.value = true
  try {
    const [songs, artists] = await Promise.all([
      homeService.getTrendingSongs(),
      homeService.getFeaturedArtists(),
    ])
    trendingSongs.value = songs
    featuredArtists.value = artists
  } catch (error) {
    console.error('Failed to load home data:', error)
  } finally {
    isLoading.value = false
  }
})
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
        <template v-else-if="trendingSongs.length > 0">
          <SongCard
            v-for="song in trendingSongs"
            :key="song._id"
            :title="song.title"
            :artist="
              song.artists && song.artists[0] ? song.artists[0].name : t('common.unknownArtist')
            "
            :musical-key="song.chords?.keySignature"
            :tempo="song.rhythm"
            :image-gradient="`from-${(song as any)._mockColor}-400 to-${(song as any)._mockColor}-600`"
          />
        </template>
        <template v-else>
          <div
            class="col-span-full flex flex-col items-center justify-center py-12 text-text-secondary"
          >
            <div class="p-4 rounded-full bg-surface-card mb-4">
              <Music class="w-8 h-8 text-text-secondary/50" />
            </div>
            <Typography variant="body">{{ t('home.discovery.emptyState') }}</Typography>
          </div>
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

        <div
          v-if="isLoading || featuredArtists.length > 0"
          class="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
        >
          <template v-if="isLoading">
            <!-- Skeleton for artists could go here if needed -->
          </template>
          <template v-else>
            <div
              v-for="artist in featuredArtists"
              :key="artist._id"
              class="flex flex-col items-center shrink-0 group cursor-pointer snap-center"
            >
              <ArtistCard
                :name="artist.name"
                :song-count="artist.chords || 0"
                :songs-label="t('home.artists.songs')"
                :gradient-border="(artist as any)._mockColor"
              />
            </div>
          </template>
        </div>
        <div v-else class="flex justify-center py-8 text-text-secondary">
          <Typography variant="body">{{ t('home.artists.emptyState') }}</Typography>
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


