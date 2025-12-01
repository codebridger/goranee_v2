<script setup lang="ts">
import { Clock, ArrowRight } from 'lucide-vue-next'
import Typography from '../base/Typography.vue'

export interface Activity {
  username: string
  action: string
  songTitle: string
  comment: string
}

const props = withDefaults(
  defineProps<{
    activities?: Activity[]
    justHappenedTitle?: string
    ctaTitle?: string
    ctaDescription?: string
    ctaDescriptionHighlight?: string
    ctaButtonText?: string
  }>(),
  {
    justHappenedTitle: 'Just Happened',
    ctaTitle: 'Join the Community',
    ctaDescription:
      'Upload your own chords, request songs, and connect with other Kurdish musicians.',
    ctaDescriptionHighlight: 'Join 15,000+ members today.',
    ctaButtonText: 'Create Free Account',
  },
)

const defaultActivities: Activity[] = [
  {
    username: 'Alan88',
    action: 'commented on',
    songTitle: 'Nazdar - Baran',
    comment: 'The bridge chords sound perfect! Thanks for the update.',
  },
  {
    username: 'Sara_Music',
    action: 'uploaded',
    songTitle: 'Xam - Zakaria',
    comment: 'Just added the full chord sheet with capo suggestions!',
  },
  {
    username: 'KurdishGuitar',
    action: 'requested',
    songTitle: 'Bo Kurdistan',
    comment: 'Does anyone have the chords for this classic?',
  },
]

const displayActivities = props.activities || defaultActivities
</script>

<template>
  <section class="px-6 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
    <!-- Comments/Activity -->
    <div
      class="bg-surface-card rounded-[2rem] p-8 shadow-lg border border-border-subtle relative overflow-hidden group hover:shadow-2xl transition duration-500"
    >
      <div
        class="absolute top-0 end-0 w-32 h-32 bg-text-accent/10 dark:bg-text-accent/20 rounded-full -me-10 -mt-10 blur-2xl group-hover:bg-text-accent/20 dark:group-hover:bg-text-accent/30 transition"
      ></div>
        <Typography variant="h3" class="mb-6 flex items-center gap-2">
          <div
            class="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400"
          >
            <Clock class="w-5 h-5" />
          </div>
          {{ justHappenedTitle }}
        </Typography>
      <div class="space-y-6">
        <div
          v-for="(activity, i) in displayActivities"
          :key="i"
          class="flex gap-4 items-start p-2 rounded-xl hover:bg-surface-base transition"
        >
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 border-2 border-white dark:border-white/10 shadow-sm"
          ></div>
          <div>
            <p class="text-sm text-text-primary">
              <span class="font-bold">{{ activity.username }}</span> {{ activity.action }}
              <span class="font-bold text-text-accent hover:underline cursor-pointer">{{
                activity.songTitle
              }}</span>
            </p>
            <div
              class="bg-surface-base p-2 rounded-te-xl rounded-be-xl rounded-bs-xl mt-1 text-xs text-text-secondary italic border border-border-subtle"
            >
              "{{ activity.comment }}"
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div
      class="rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center bg-grad-primary shadow-2xl shadow-pink-500/20"
    >
      <div class="relative z-10">
        <h3 class="text-3xl font-black mb-4">{{ ctaTitle }}</h3>
        <p class="text-white/80 mb-8 max-w-sm leading-relaxed">
          {{ ctaDescription }}
          <span class="block mt-2 font-bold text-white">{{ ctaDescriptionHighlight }}</span>
        </p>
        <NuxtLink
          to="/community"
          class="bg-white text-text-accent px-8 py-4 rounded-full font-bold hover:bg-text-accent/10 transition shadow-lg flex items-center gap-2 group cursor-pointer w-fit"
        >
          {{ ctaButtonText }}
          <ArrowRight
            class="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition rtl:rotate-180"
          />
        </NuxtLink>
      </div>
      <!-- Decorative circles -->
      <div
        class="absolute top-1/2 end-0 w-64 h-64 bg-white/10 rounded-full -me-16 -mt-16 blur-sm animate-pulse"
      ></div>
      <div class="absolute bottom-0 end-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
    </div>
  </section>
</template>
