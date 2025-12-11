<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t("artist.edit-artist") || "Edit Artist" }}</h2>
      <div class="flex">
        <vs-button :loading="pending" @click="update">{{
          $t("update")
          }}</vs-button>
        <div class="float-button">
          <vs-button danger icon blank :loading="pending" @click="update">
            <i class="bx bxs-save"></i>
          </vs-button>
        </div>
      </div>
    </div>

    <!-- Language Tabs -->
    <div class="mt-4 flex gap-2 border-b border-gray-200">
      <button v-for="lang in availableLangs" :key="lang" :class="[
        'px-4 py-2 font-medium transition-colors',
        currentLang === lang
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      ]" @click="switchLanguage(lang)">
        {{ getLangLabel(lang) }}
        <span v-if="hasLangContent(lang)" class="ml-1 text-green-500">✓</span>
      </button>

    </div>

    <card class="p-4 mt-4 relative min-h-[200px]">
      <loading-state :active="$fetchState.pending" />
      <div class="w-full">
        <vs-input class="mt-4" block :label="$t('artist.artists') || 'Name'" v-model="currentLangForm.name" />

        <seo-labels v-model="currentLangForm.name_seo"></seo-labels>

        <vs-textarea class="mt-5" block :label="$t('artist.bio') || 'Bio'" v-model="currentLangForm.bio" rows="5" />

        <div class="mt-10">
          <label>{{ $t('image-cover') || 'Image Cover' }}</label>
          <image-field tag="artist" v-model="form.image" @changed="update()" />
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../../utilities/notifier'
import LoadingState from '~/components/materials/LoadingState.vue'

export default {
  middleware: ['auth'],
  components: { LoadingState },
  async fetch() {
    try {
      const artist = await dataProvider.findOne({
        database: 'tab',
        collection: 'artist',
        query: { _id: this.$route.params.id },
      })

      if (!artist) {
        this.$nuxt.error({ statusCode: 404, message: 'Artist not found' })
        return
      }

      this.artist = artist
      this.initForm()
    } catch (err) {
      console.error("Error fetching artist:", err);
      this.$nuxt.error({ statusCode: 500, message: 'Failed to load artist' })
    }
  },
  data() {
    return {
      artist: null,
      pending: false,
      currentLang: 'ckb-IR',
      availableLangs: ['ckb-IR', 'ckb-Latn', 'kmr'],
      form: {
        content: {
          'ckb-IR': null,
          'ckb-Latn': null,
          'kmr': null,
        },
        image: null,
      },
      currentLangForm: {
        name: '',
        name_seo: '',
        bio: '',
      },
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
  },
  methods: {
    initForm() {
      // Initialize form from artist data
      if (this.artist) {
        // Migrate old structure to new if needed
        if (this.artist.name && !this.artist.content) {
          // Old structure - migrate on the fly
          this.form.content['ckb-IR'] = {
            name: this.artist.name || '',
            name_seo: this.artist.name_seo || '',
            bio: this.artist.bio || '',
          }
        } else if (this.artist.content) {
          // New structure
          this.form.content = { ...this.artist.content }
        }

        // Copy shared fields
        this.form.image = this.artist.image || null

        // Load current language content
        this.switchLanguage(this.currentLang)
      }
    },
    getLangLabel(lang) {
      const labels = {
        'ckb-IR': 'سورانی (ایران)',
        'ckb-Latn': 'سورانی (لاتین)',
        'kmr': 'کرمانجی',
      }
      return labels[lang] || lang
    },
    hasLangContent(lang) {
      return this.form.content[lang] && this.form.content[lang].name
    },
    switchLanguage(lang) {
      // Save current language content before switching
      if (this.currentLangForm.name || this.currentLangForm.name_seo || this.currentLangForm.bio) {
        this.form.content[this.currentLang] = { ...this.currentLangForm }
      }

      this.currentLang = lang

      // Load new language content
      if (this.form.content[lang]) {
        this.currentLangForm = {
          name: this.form.content[lang].name || '',
          name_seo: this.form.content[lang].name_seo || '',
          bio: this.form.content[lang].bio || '',
        }
      } else {
        // Initialize empty form for new language
        this.currentLangForm = {
          name: '',
          name_seo: '',
          bio: '',
        }
      }
    },

    update() {
      // Save current language content before updating
      if (this.currentLangForm.name || this.currentLangForm.name_seo || this.currentLangForm.bio) {
        this.form.content[this.currentLang] = { ...this.currentLangForm }
      }

      this.pending = true
      dataProvider
        .updateOne({
          database: 'tab',
          collection: 'artist',
          query: { _id: this.id },
          update: {
            content: this.form.content,
            image: this.form.image,
            updatedAt: new Date(),
          },
        })
        .then(() => {
          notifier.toast({
            label: 'Success',
            description: 'Artist saved successfully',
            type: 'success',
          })
        })
        .catch(({ error }) => {
          notifier.toast({
            label: 'Update artist error',
            description: JSON.stringify(error),
            type: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },
  },
  // mounted() block removed as logic moved to fetch/initForm
}
</script>

<style scoped>
.float-button {
  position: fixed;
  bottom: 20px;
}
</style>
