<script setup lang="ts">
import { ref } from 'vue'
import {
  Play,
  Heart,
  ArrowRight,
  Search,
  Settings,
  Minus,
  Plus,
  Moon,
  Sun,
  Share2,
  Mic,
  Music,
} from 'lucide-vue-next'
import Typography from '../components/design-system/Typography.vue'
import Button from '../components/design-system/Button.vue'
import Input from '../components/design-system/Input.vue'
import Card from '../components/design-system/Card.vue'
import Toggle from '../components/design-system/Toggle.vue'
import FloatingToolbox from '../components/design-system/FloatingToolbox.vue'
import CommentCard from '../components/design-system/CommentCard.vue'
import SongCard from '../components/design-system/SongCard.vue'
import ArtistCard from '../components/design-system/ArtistCard.vue'
import ChordSheet, { type ChordLine } from '../components/design-system/ChordSheet.vue'
import Tag from '../components/design-system/Tag.vue'
import IconButton from '../components/design-system/IconButton.vue'
import SectionTitle from '../components/design-system/SectionTitle.vue'

const isDark = ref(false)
const autoScroll = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
}

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
    <!-- GLOBAL THEME TOGGLE (Floating) -->
    <button
      @click="toggleTheme"
      class="fixed bottom-8 right-8 z-50 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-all duration-300 bg-text-primary text-surface-base hover:bg-text-secondary"
    >
      <component :is="isDark ? Sun : Moon" class="w-5 h-5" />
      {{ isDark ? 'Switch to Light' : 'Switch to Dark' }}
    </button>

    <!-- HEADER -->
    <header class="max-w-7xl mx-auto mb-16 text-center pt-10">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-grad-primary text-white text-3xl font-black shadow-lg mb-6 ring-4 ring-white dark:ring-white/10"
      >
        G
      </div>
      <Typography variant="h1" class="mb-4">NeoBeat UI Kit</Typography>
      <Typography variant="body" class="text-text-secondary text-xl"
        >Design System for Goranee.ir</Typography
      >
    </header>

    <main class="max-w-7xl mx-auto space-y-20">
      <!-- 1. COLORS -->
      <section>
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight">01. Color Palette</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >Adaptive palette: {{ isDark ? 'Dark Mode Active' : 'Light Mode' }}</Typography
          >
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border border-border-subtle bg-surface-base"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">Canvas Background</p>
              <p class="text-xs font-mono text-text-secondary">
                {{ isDark ? '#130a12' : '#FDF2F0' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border border-border-subtle bg-text-primary"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">Primary Text</p>
              <p class="text-xs font-mono text-text-secondary">
                {{ isDark ? '#eddeeb' : '#2A1B28' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border border-border-subtle bg-surface-card"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">Card Surface</p>
              <p class="text-xs font-mono text-text-secondary">
                {{ isDark ? '#1f121d' : '#FFFFFF' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div
              class="w-full h-24 rounded-2xl shadow-sm border border-border-subtle bg-grad-primary"
            ></div>
            <div>
              <p class="font-bold text-sm text-text-primary">Electric Gradient</p>
              <p class="text-xs font-mono text-text-secondary">#FF2E93 -> #8E2DE2</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. TYPOGRAPHY -->
      <section>
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight">02. Typography</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >Headings in Sans-Serif, Chords in Monospace.</Typography
          >
        </div>
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border border-border-subtle transition-all duration-300 grid md:grid-cols-2 gap-12"
        >
          <div class="space-y-6">
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">Display H1</span>
              <Typography variant="h1">Play the Melody</Typography>
            </div>
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">Heading H2</span>
              <Typography variant="h2">Featured Artists</Typography>
            </div>
            <div>
              <span class="text-xs text-text-secondary font-mono uppercase">Body Text</span>
              <Typography variant="body" class="text-text-secondary">
                Goranee is a community-driven platform. Access thousands of Kurdish chords, lyrics,
                and rhythms. Join us to share your musical knowledge.
              </Typography>
            </div>
          </div>

          <!-- CHORD PREVIEW -->
          <div class="rounded-2xl p-6 border bg-surface-base border-border-subtle">
            <span class="text-xs text-pink-500 font-bold uppercase mb-4 block"
              >Chord Sheet Preview</span
            >
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
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight"
            >03. Buttons & Interactions</Typography
          >
          <Typography variant="body" class="text-text-secondary mt-1"
            >Gradient primaries, ghost secondaries.
          </Typography>
        </div>
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border border-border-subtle transition-all duration-300 space-y-8"
        >
          <!-- Row 1: Main Buttons -->
          <div class="flex flex-wrap items-center gap-6">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <button class="text-pink-600 font-bold hover:underline flex items-center gap-2">
              Text Link
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Row 2: Icon Buttons & Tools -->
          <div class="flex flex-wrap items-center gap-6">
            <button
              class="w-12 h-12 rounded-full bg-grad-primary flex items-center justify-center text-white shadow-md hover:scale-105 transition"
            >
              <Play class="w-5 h-5 fill-current" />
            </button>
            <button
              class="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center transition bg-surface-card text-text-secondary hover:text-text-accent"
            >
              <Heart class="w-5 h-5" />
            </button>

            <!-- Tags/Chips -->
            <span
              class="px-3 py-1 rounded-md text-xs font-bold border bg-surface-base border-border-subtle text-text-secondary"
              >Key: Am</span
            >
            <span
              class="px-3 py-1 rounded-md bg-pink-500/10 text-xs font-bold text-pink-500 border border-pink-500/20"
              >Rhythm: 7/8</span
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
        <SectionTitle title="04. Component: Cards" subtitle="Reusable containers for content." />
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
          title="04.5 Tags & Icon Buttons"
          subtitle="Small UI elements for metadata and actions."
        />
        <div
          class="bg-surface-card rounded-3xl p-8 shadow-sm border border-border-subtle space-y-8"
        >
          <!-- Tags -->
          <div>
            <h3 class="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              Tags / Chips
            </h3>
            <div class="flex flex-wrap items-center gap-3">
              <Tag label="Key: Am" variant="neutral" />
              <Tag label="Rhythm: 7/8" variant="accent" />
              <Tag label="Slow" variant="accent" size="sm" />
              <Tag label="Popular" variant="neutral" :icon="Music" />
            </div>
          </div>

          <!-- Icon Buttons -->
          <div>
            <h3 class="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              Icon Buttons
            </h3>
            <div class="flex flex-wrap items-center gap-4">
              <IconButton :icon="Play" variant="primary" ariaLabel="Play song" />
              <IconButton :icon="Heart" variant="secondary" ariaLabel="Like song" />
              <IconButton :icon="Share2" variant="secondary" size="sm" ariaLabel="Share" />
              <IconButton :icon="Settings" variant="primary" size="lg" ariaLabel="Settings" />
            </div>
          </div>
        </div>
      </section>

      <!-- 4.6 CHORD SHEET -->
      <section>
        <SectionTitle
          title="04.6 Chord Sheet"
          subtitle="Display chords inline with lyrics."
          :icon="Music"
        />
        <ChordSheet :lines="chordLines" />
      </section>

      <!-- 5. COMPLEX COMPONENTS: NAVIGATION -->
      <section>
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight">05. Navigation</Typography>
          <Typography variant="body" class="text-text-secondary mt-1"
            >Sticky 'Glassmorphism' Header.
          </Typography>
        </div>
        <div
          class="relative rounded-xl overflow-hidden shadow-2xl bg-gray-900 h-64 border border-white/10"
        >
          <!-- The Overlay to darken bg for demo -->
          <div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-80"></div>

          <!-- THE COMPONENT -->
          <nav
            class="absolute top-0 left-0 right-0 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center bg-white/10"
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
              <a href="#" class="hover:text-pink-500">Discovery</a>
              <a href="#" class="hover:text-pink-500">Artists</a>
              <a href="#" class="hover:text-pink-500">Community</a>
            </div>
            <div class="flex items-center gap-3">
              <button class="text-sm font-bold text-white">Login</button>
              <Button variant="primary" size="sm">Explore</Button>
            </div>
          </nav>
        </div>
      </section>

      <!-- 6. COMPLEX COMPONENTS: FLOATING TOOLBOX -->
      <section>
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight"
            >06. The Musician's Toolbox</Typography
          >
          <Typography variant="body" class="text-text-secondary mt-1"
            >Sticky controls for the Chord View page.
          </Typography>
        </div>
        <div
          class="h-64 rounded-3xl relative overflow-hidden border border-border-subtle flex items-center justify-center bg-surface-base"
        >
          <p class="text-text-secondary font-bold">Page Content Area...</p>

          <!-- THE COMPONENT: Floating Bar -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2">
            <FloatingToolbox />
          </div>
        </div>
      </section>

      <!-- 7. CTA & FOOTER -->
      <section>
        <div class="mb-8 border-b border-border-subtle pb-4 mt-12 transition-colors duration-300">
          <Typography variant="h2" class="font-black tracking-tight"
            >07. Marketing Blocks</Typography
          >
          <Typography variant="body" class="text-text-secondary mt-1"
            >Call to Action & Footer.</Typography
          >
        </div>

        <!-- COMPONENT: CTA -->
        <div
          class="rounded-[2rem] p-12 text-white relative overflow-hidden flex flex-col items-center text-center bg-grad-primary shadow-xl mb-12"
        >
          <div class="relative z-10 max-w-2xl">
            <h3 class="text-3xl font-black mb-4">Ready to play?</h3>
            <p class="text-pink-100 mb-8 text-lg">
              Join 15,000+ Kurdish musicians sharing chords and lyrics every day.
            </p>
            <Button
              variant="secondary"
              class="bg-white text-pink-600 border-transparent hover:bg-pink-50"
            >
              Create Free Account
              <ArrowRight class="w-4 h-4 ml-2" />
            </Button>
          </div>
          <!-- Decor -->
          <div
            class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mt-20 blur-2xl"
          ></div>
          <div
            class="absolute bottom-0 right-0 w-64 h-64 bg-purple-900/20 rounded-full -mr-20 -mb-20 blur-2xl"
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
            <span class="font-bold tracking-tight">Goranee</span>
          </div>
          <div class="text-xs opacity-60">© 2025 Goranee.ir. All rights reserved.</div>
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
