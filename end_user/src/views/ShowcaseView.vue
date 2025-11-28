<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Play,
  Heart,
  ArrowRight,
  Search,
  Settings,
  Moon,
  Sun,
  Share2,
  Mic,
  Music,
} from 'lucide-vue-next'

const { t } = useI18n()
import Typography from '../components/base/Typography.vue'
import Button from '../components/base/Button.vue'
import Input from '../components/base/Input.vue'
import Toggle from '../components/base/Toggle.vue'
import FloatingToolbox from '../components/widget/FloatingToolbox.vue'
import CommentCard from '../components/widget/CommentCard.vue'
import SongCard from '../components/widget/SongCard.vue'
import ArtistCard from '../components/widget/ArtistCard.vue'
import ChordSheet, { type ChordLine } from '../components/widget/ChordSheet.vue'
import Tag from '../components/base/Tag.vue'
import IconButton from '../components/base/IconButton.vue'
import SectionTitle from '../components/widget/SectionTitle.vue'
import DevFloatingWidget from '../components/widget/DevFloatingWidget.vue'
import { useAppConfigStore } from '../stores/appConfig'

const appConfig = useAppConfigStore()
const isLoading = ref(false)
const autoScroll = ref(true)

// Chord sheet data
const chordLines: ChordLine[] = [
  { chord: 'Am', lyrics: 'Ewa disan baran bari' },
  { chord: 'G', lyrics: 'Firmesk la chawm hate xware' },
  { chord: 'F', lyrics: 'Bochi to wa be wafa buy?' },
]
</script>

<template>
  <div
    class="min-h-screen bg-surface-base text-text-primary transition-colors duration-500 font-sans p-8 pb-32 selection:bg-pink-500 selection:text-white"
  >
    <!-- Dev Mode Floating Widget -->
    <DevFloatingWidget v-model:is-loading="isLoading" />

    <!-- HEADER -->
    <header class="max-w-7xl mx-auto mb-16 text-center pt-10">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-grad-primary text-white text-3xl font-black shadow-lg mb-6 ring-4 ring-white dark:ring-white/10"
      >
        G
      </div>
      <Typography variant="h1" class="mb-4">{{ t('showcase.title') }}</Typography>
      <Typography variant="body" class="text-text-secondary text-xl">{{
        t('showcase.subtitle')
      }}</Typography>
    </header>

    <main class="max-w-7xl mx-auto space-y-20">
      <!-- 1. COLORS -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.colors.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1">{{
            t('showcase.sections.colors.subtitle', {
              mode: appConfig.isDark
                ? t('showcase.sections.colors.modes.darkMode')
                : t('showcase.sections.colors.modes.lightMode'),
            })
          }}</Typography>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 bg-surface-base"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">
                {{ t('showcase.sections.colors.labels.canvasBackground') }}
              </p>
              <p class="text-xs font-mono text-text-secondary">
                {{ appConfig.isDark ? '#130a12' : '#FDF2F0' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 bg-text-primary"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">
                {{ t('showcase.sections.colors.labels.primaryText') }}
              </p>
              <p class="text-xs font-mono text-text-secondary">
                {{ appConfig.isDark ? '#eddeeb' : '#2A1B28' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 bg-surface-card"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">
                {{ t('showcase.sections.colors.labels.cardSurface') }}
              </p>
              <p class="text-xs font-mono text-text-secondary">
                {{ appConfig.isDark ? '#1f121d' : '#FFFFFF' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 bg-grad-primary"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">
                {{ t('showcase.sections.colors.labels.electricGradient') }}
              </p>
              <p class="text-xs font-mono text-text-secondary">#FF2E93 -> #8E2DE2</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. TYPOGRAPHY -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.typography.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1">{{
            t('showcase.sections.typography.subtitle')
          }}</Typography>
        </div>
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border dark:border-white/10 border-pink-50 transition-all duration-300 grid md:grid-cols-2 gap-12"
        >
          <div class="space-y-6">
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">{{
                t('showcase.sections.typography.displayH1')
              }}</span>
              <Typography variant="h1">Play the Melody</Typography>
            </div>
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">{{
                t('showcase.sections.typography.headingH2')
              }}</span>
              <Typography variant="h2">Featured Artists</Typography>
            </div>
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">{{
                t('showcase.sections.typography.bodyText')
              }}</span>
              <Typography variant="body" class="text-text-secondary">
                {{ t('showcase.sections.typography.sampleText') }}
              </Typography>
            </div>
          </div>

          <!-- CHORD PREVIEW -->
          <div class="rounded-2xl p-6 border bg-surface-base dark:border-white/5 border-pink-100">
            <span class="text-xs text-pink-500 font-bold uppercase mb-4 block">{{
              t('showcase.sections.typography.chordSheetPreview')
            }}</span>
            <div class="font-mono text-lg space-y-4">
              <div>
                <span class="text-[#FF2E93] font-bold">[Am]</span>
                <span class="text-text-primary"> Ewa disan baran bari</span>
              </div>
              <div>
                <span class="text-[#FF2E93] font-bold">[G]</span>
                <span class="text-text-primary"> Firmesk la chawm hate xware</span>
              </div>
              <div>
                <span class="text-[#FF2E93] font-bold">[F]</span>
                <span class="text-text-primary"> Bochi to wa be wafa buy?</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. BUTTONS & CONTROLS -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.buttons.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >{{ t('showcase.sections.buttons.subtitle') }}
          </Typography>
        </div>
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border dark:border-white/10 border-pink-50 transition-all duration-300 space-y-8"
        >
          <!-- Row 1: Main Buttons -->
          <div class="flex flex-wrap items-center gap-6">
            <Button variant="primary">{{ t('showcase.sections.buttons.primaryAction') }}</Button>
            <Button variant="secondary">{{
              t('showcase.sections.buttons.secondaryAction')
            }}</Button>
            <button
              class="text-pink-600 font-bold hover:underline flex items-center gap-2 cursor-pointer"
            >
              {{ t('showcase.sections.buttons.textLink') }}
              <ArrowRight class="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          <!-- Row 2: Icon Buttons & Tools -->
          <div class="flex flex-wrap items-center gap-6">
            <button
              class="w-12 h-12 rounded-full bg-grad-primary flex items-center justify-center text-white shadow-md hover:scale-105 transition cursor-pointer"
            >
              <Play class="w-5 h-5 fill-current" />
            </button>
            <button
              class="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center transition bg-surface-card text-text-secondary hover:text-text-accent cursor-pointer"
            >
              <Heart class="w-5 h-5" />
            </button>

            <!-- Tags/Chips -->
            <span
              class="px-3 py-1 rounded-md text-xs font-bold border dark:bg-white/10 dark:border-white/5 dark:text-gray-300 bg-gray-100 border-gray-200 text-gray-600"
              >{{ t('showcase.sections.tags.key') }}</span
            >
            <span
              class="px-3 py-1 rounded-md bg-pink-500/10 text-xs font-bold text-pink-500 border border-pink-500/20"
              >{{ t('showcase.sections.tags.rhythm') }}</span
            >
          </div>

          <!-- Row 3: Inputs & Toggles -->
          <div class="max-w-xl grid md:grid-cols-2 gap-8">
            <Input placeholder="Search for songs..." :icon="Search" />

            <!-- Toggles Demo -->
            <div class="flex items-center gap-4">
              <Toggle v-model="autoScroll" label="Auto-scroll" />
            </div>
          </div>
        </div>
      </section>

      <!-- 4. CARDS -->
      <section>
        <SectionTitle
          :title="t('showcase.sections.cards.title')"
          :subtitle="t('showcase.sections.cards.subtitle')"
        />
        <div class="grid md:grid-cols-3 gap-8">
          <!-- NEW: SongCard Component -->
          <SongCard
            title="Xam (Sorrow)"
            artist="Zakaria Abdulla"
            musical-key="Cm"
            tempo="Slow"
            image-gradient="from-indigo-500 to-purple-600"
            @click="() => console.log('Song clicked')"
          />

          <!-- NEW: ArtistCard Component -->
          <ArtistCard
            name="Chopy Fatah"
            :song-count="142"
            gradient-border="from-orange-400 to-red-500"
            @click="() => console.log('Artist clicked')"
          />

          <!-- COMPONENT: Comment Bubble -->
          <CommentCard
            username="MusicLover99"
            timestamp="2h ago"
            comment="This is the most accurate version I've found! The bridge chords are spot on."
          />
        </div>
      </section>

      <!-- 4.5 TAGS & ICON BUTTONS -->
      <section>
        <SectionTitle
          :title="t('showcase.sections.tags.title')"
          :subtitle="t('showcase.sections.tags.subtitle')"
        />
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border dark:border-white/10 border-pink-50 space-y-8"
        >
          <!-- Tags -->
          <div>
            <h3 class="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              {{ t('showcase.sections.tags.tagsChips') }}
            </h3>
            <div class="flex flex-wrap items-center gap-3">
              <Tag :label="t('showcase.sections.tags.key')" variant="neutral" />
              <Tag :label="t('showcase.sections.tags.rhythm')" variant="accent" />
              <Tag :label="t('showcase.sections.tags.slow')" variant="accent" size="sm" />
              <Tag :label="t('showcase.sections.tags.popular')" variant="neutral" :icon="Music" />
            </div>
          </div>

          <!-- Icon Buttons -->
          <div>
            <h3 class="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              {{ t('showcase.sections.tags.iconButtons') }}
            </h3>
            <div class="flex flex-wrap items-center gap-4">
              <IconButton
                :icon="Play"
                variant="primary"
                :ariaLabel="t('showcase.ariaLabels.playSong')"
              />
              <IconButton
                :icon="Heart"
                variant="secondary"
                :ariaLabel="t('showcase.ariaLabels.likeSong')"
              />
              <IconButton
                :icon="Share2"
                variant="secondary"
                size="sm"
                :ariaLabel="t('showcase.ariaLabels.share')"
              />
              <IconButton
                :icon="Settings"
                variant="primary"
                size="lg"
                :ariaLabel="t('showcase.ariaLabels.settings')"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 4.6 CHORD SHEET -->
      <section>
        <SectionTitle
          :title="t('showcase.sections.chordSheet.title')"
          :subtitle="t('showcase.sections.chordSheet.subtitle')"
          :icon="Music"
        />
        <ChordSheet :lines="chordLines" />
      </section>

      <!-- 5. COMPLEX COMPONENTS: NAVIGATION -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.navigation.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >{{ t('showcase.sections.navigation.subtitle') }}
          </Typography>
        </div>
        <div
          class="relative rounded-xl overflow-hidden shadow-2xl bg-gray-900 h-64 border border-white/10"
        >
          <!-- The Overlay to darken bg for demo -->
          <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-80"></div>

          <!-- THE COMPONENT -->
          <nav
            class="absolute top-0 start-0 end-0 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center bg-white/10"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold"
              >
                G
              </div>
              <span class="text-xl font-black text-white">Goranee</span>
            </div>
            <div class="hidden md:flex gap-6 text-sm font-bold text-gray-200">
              <a href="#" class="hover:text-pink-500">{{ t('navbar.links.discovery') }}</a>
              <a href="#" class="hover:text-pink-500">{{ t('navbar.links.artists') }}</a>
              <a href="#" class="hover:text-pink-500">{{ t('navbar.links.community') }}</a>
            </div>
            <div class="flex items-center gap-3">
              <button class="text-sm font-bold text-white cursor-pointer">
                {{ t('navbar.login') }}
              </button>
              <Button variant="primary" size="sm">{{ t('navbar.explore') }}</Button>
            </div>
          </nav>
        </div>
      </section>

      <!-- 6. COMPLEX COMPONENTS: FLOATING TOOLBOX -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.toolbox.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >{{ t('showcase.sections.toolbox.subtitle') }}
          </Typography>
        </div>
        <div
          class="h-64 rounded-3xl relative overflow-hidden border border-border-subtle flex items-center justify-center bg-surface-base"
        >
          <p class="text-text-secondary font-bold">
            {{ t('showcase.sections.toolbox.pageContent') }}
          </p>

          <!-- THE COMPONENT: Floating Bar -->
          <div class="absolute bottom-6 start-1/2 -translate-x-1/2">
            <FloatingToolbox />
          </div>
        </div>
      </section>

      <!-- 7. CTA & FOOTER -->
      <section>
        <div
          class="mb-8 border-b dark:border-white/10 border-pink-200 pb-4 mt-12 transition-colors duration-300"
        >
          <Typography variant="h2" class="font-bold tracking-tight">{{
            t('showcase.sections.marketing.title')
          }}</Typography>
          <Typography variant="body" class="text-text-secondary mt-1">{{
            t('showcase.sections.marketing.subtitle')
          }}</Typography>
        </div>

        <!-- COMPONENT: CTA -->
        <div
          class="rounded-[2rem] p-12 text-white relative overflow-hidden flex flex-col items-center text-center bg-grad-primary shadow-xl mb-12"
        >
          <div class="relative z-10 max-w-2xl">
            <h3 class="text-3xl font-black mb-4">
              {{ t('showcase.sections.marketing.cta.title') }}
            </h3>
            <p class="text-pink-100 mb-8 text-lg">
              {{ t('showcase.sections.marketing.cta.description') }}
            </p>
            <Button
              variant="secondary"
              class="bg-white text-pink-600 border-transparent hover:bg-pink-50"
            >
              {{ t('showcase.sections.marketing.cta.button') }}
              <ArrowRight class="w-4 h-4 ms-2 rtl:rotate-180" />
            </Button>
          </div>
          <!-- Decor -->
          <div
            class="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full -ms-20 -mt-20 blur-2xl"
          ></div>
          <div
            class="absolute bottom-0 end-0 w-64 h-64 bg-purple-900/20 rounded-full -me-20 -mb-20 blur-2xl"
          ></div>
        </div>

        <!-- COMPONENT: Mini Footer -->
        <div
          class="p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 bg-[#2A1B28] text-white dark:bg-[#0a0509] dark:text-gray-400"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center text-white text-xs font-bold"
            >
              G
            </div>
            <span class="font-bold tracking-tight">{{ t('navbar.logo') }}</span>
          </div>
          <div class="text-xs opacity-60">{{ t('footer.copyright') }}</div>
          <div class="flex gap-4">
            <div
              class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition"
            >
              <Share2 class="w-4 h-4" />
            </div>
            <div
              class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition"
            >
              <Mic class="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
