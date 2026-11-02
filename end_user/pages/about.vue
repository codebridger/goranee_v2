<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Users, Instagram, Send } from 'lucide-vue-next'
import Typography from '~/components/base/Typography.vue'
import Card from '~/components/base/Card.vue'
import Button from '~/components/base/Button.vue'

const { t } = useI18n()

const CONTACT_FORM_URL = 'https://forms.gle/nd6jY73D33Y3rBrW7'

const team = [
  { key: 'pouya', initial: 'P' },
  { key: 'navid', initial: 'N' },
]

// Reachability differs by region, so contacts are grouped by where the visitor lives.
const contactGroups = [
  {
    key: 'insideIran',
    member: 'pouya',
    links: [
      { key: 'instagram', icon: Instagram, href: 'https://www.instagram.com/pooya_jalaali_guitarist' },
      { key: 'telegram', icon: Send, href: 'https://t.me/Pooya_Jalaali' },
    ],
  },
  {
    key: 'outsideIran',
    member: 'navid',
    links: [
      { key: 'instagram', icon: Instagram, href: 'https://www.instagram.com/navid.dev.life/' },
      { key: 'telegram', icon: Send, href: 'https://t.me/Navidshad' },
    ],
  },
]

useHead({
  title: () => `${t('pages.about.title')} | ${t('navbar.logo')}`,
  meta: [{ name: 'description', content: () => t('pages.about.story1') }],
})
</script>

<template>
  <div class="min-h-screen bg-surface-base">
    <div class="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div class="mb-8">
        <Typography variant="h1" class="mb-2">{{ t('pages.about.title') }}</Typography>
        <Typography variant="body" class="text-text-secondary">
          {{ t('pages.about.subtitle') }}
        </Typography>
      </div>

      <Card class="mb-8">
        <Typography variant="body" class="leading-loose mb-4">{{ t('pages.about.story1') }}</Typography>
        <Typography variant="body" class="leading-loose text-text-secondary">{{ t('pages.about.story2') }}</Typography>
      </Card>

      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
          <Users class="w-5 h-5 text-text-accent" />
          <Typography variant="h3">{{ t('pages.about.teamTitle') }}</Typography>
        </div>
        <Typography variant="body" class="text-text-secondary mb-4">{{ t('pages.about.teamIntro') }}</Typography>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card v-for="member in team" :key="member.key" class="flex items-center gap-4">
            <div
              class="w-12 h-12 shrink-0 rounded-full bg-grad-primary flex items-center justify-center text-white font-bold">
              {{ member.initial }}
            </div>
            <div>
              <div class="font-bold text-text-primary">{{ t(`pages.about.members.${member.key}.name`) }}</div>
              <div class="text-sm text-text-secondary">{{ t(`pages.about.members.${member.key}.role`) }}</div>
            </div>
          </Card>
        </div>
      </div>

      <div class="mb-8">
        <Typography variant="h3" class="mb-2">{{ t('pages.about.contact.title') }}</Typography>
        <Typography variant="body" class="text-text-secondary mb-4">{{ t('pages.about.contact.intro') }}</Typography>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card v-for="group in contactGroups" :key="group.key">
            <div class="text-xs font-bold text-text-accent uppercase tracking-wider mb-1">
              {{ t(`pages.about.contact.${group.key}`) }}
            </div>
            <div class="font-bold text-text-primary mb-4">{{ t(`pages.about.members.${group.member}.name`) }}</div>
            <div class="flex flex-col gap-2">
              <a v-for="link in group.links" :key="link.key" :href="link.href" target="_blank" rel="noopener noreferrer"
                class="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border-subtle text-text-primary hover:bg-surface-base/50 hover:text-text-accent transition">
                <component :is="link.icon" class="w-5 h-5" />
                <span class="font-semibold text-sm">{{ t(`pages.about.contact.${link.key}`) }}</span>
              </a>
            </div>
          </Card>
        </div>
      </div>

      <Card class="text-center">
        <Typography variant="h3" class="mb-2">{{ t('pages.about.requestTitle') }}</Typography>
        <Typography variant="body" class="text-text-secondary mb-6 leading-loose">
          {{ t('pages.about.requestText') }}
        </Typography>
        <Button variant="primary" :href="CONTACT_FORM_URL">{{ t('pages.about.contactButton') }}</Button>
      </Card>
    </div>
  </div>
</template>
