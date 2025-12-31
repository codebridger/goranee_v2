<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t("artist.new-artist") || "New Artist" }}</h2>
      <vs-button :loading="pending" @click="create">{{
        $t("create")
      }}</vs-button>
    </div>

    <!-- Language Tabs -->
    <div class="mt-4 flex gap-2 border-b border-gray-200">
      <button
        v-for="lang in availableLangs"
        :key="lang"
        :class="[
          'px-4 py-2 font-medium transition-colors',
          currentLang === lang
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        ]"
        @click="switchLanguage(lang)"
      >
        {{ getLangLabel(lang) }}
        <span v-if="hasLangContent(lang)" class="ml-1 text-green-500">✓</span>
      </button>
      <button
        v-if="availableLangs.length < 3"
        class="px-4 py-2 text-gray-500 hover:text-gray-700"
        @click="addLanguage"
      >
        + {{ $t('add-language') || 'Add Language' }}
      </button>
    </div>

    <card class="p-4 mt-4">
      <div class="w-full">
        <vs-input
          class="mt-4"
          block
          :label="$t('artist.artists') || 'Name'"
          v-model="currentLangForm.name"
        />

        <seo-labels v-model="currentLangForm.name_seo"></seo-labels>

        <vs-textarea
          class="mt-5"
          block
          :label="$t('artist.bio') || 'Bio'"
          v-model="currentLangForm.bio"
          rows="5"
        />

        <div class="mt-10">
          <label>{{ $t('image-cover') || 'Image Cover' }}</label>
          <image-field tag="artist" v-model="form.image" />
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../../utilities/notifier'

export default {
  middleware: ['auth'],
  data() {
    return {
      pending: false,
      currentLang: 'ckb-IR',
      availableLangs: ['ckb-IR', 'ckb-Latn', 'kmr'],
      isInitializing: false,
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
    hasCurrentContent() {
      return this.currentLangForm.name ||
        this.currentLangForm.name_seo ||
        this.currentLangForm.bio;
    },
  },
  methods: {
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
      if (!this.isInitializing && this.hasCurrentContent) {
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
    addLanguage() {
      // Find first available language slot
      const available = this.availableLangs.find(lang => !this.form.content[lang])
      if (available) {
        this.switchLanguage(available)
      }
    },
    create() {
      // Save current language content before creating
      this.form.content[this.currentLang] = { ...this.currentLangForm }

      this.pending = true
      dataProvider
        .insertOne({
          database: 'tab',
          collection: 'artist',
          doc: this.form,
        })
        .then((newArtist) => {
          this.$router.push('/admin/artist/' + newArtist._id)
        })
        .catch(({ error }) => {
          notifier.toast({
            label: 'Create artist error',
            description: JSON.stringify(error),
            type: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },
  },
}
</script>

<style>
</style>

