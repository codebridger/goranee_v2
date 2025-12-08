<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t("song.edit-song") }}</h2>
      <div class="flex">
        <vs-button :loading="pending" @click="update">{{
          $t("update")
          }}</vs-button>
        <div class="float-button">
          <vs-button danger icon blank :loading="pending" @click="update">
            <i class="bx bxs-save"></i>
          </vs-button>
        </div>

        <vs-button transparent icon blank :href="'/tab/' + id">
          <i class="bx bx-desktop"></i>
        </vs-button>
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

    <chord-picker class="mt-4" :value="form.chords" @input="form.chords = $event" />

    <card class="p-4 mt-4 flex space-x-4">
      <div class="w-1/3 pr-4">
        <div>
          <vs-input class="mt-4" block :label="$t('song.title')" v-model="currentLangForm.title" />

          <seo-labels v-model="currentLangForm.title_seo"></seo-labels>

          <vs-input class="mt-5" block :label="$t('song.vocal-from')" :value="vocalNote" disabled />
          <vs-input class="mt-5" block :label="$t('song.rhythm')" v-model="form.rhythm" />

          <!-- Copy from language -->
          <div class="mt-5">
            <label class="block mb-2 font-medium">{{ $t('copy-from-language') || 'Copy from language' }}</label>
            <div class="flex gap-2">
              <select v-model="copyFromLang" class="flex-1 p-2 border border-gray-300 rounded"
                :class="{ 'border-blue-500': copyFromLang }">
                <option value="">{{ $t('select-language') || 'Select language...' }}</option>
                <option v-for="lang in availableLangs.filter(l => l !== currentLang && hasLangContent(l))" :key="lang"
                  :value="lang">
                  {{ getLangLabel(lang) }}
                </option>
              </select>
              <vs-button :disabled="!copyFromLang || !hasLangContent(copyFromLang)" @click="copyLanguage" class="px-4">
                <i class="bx bx-copy mr-1"></i>
                {{ $t('copy') || 'Copy' }}
              </vs-button>
            </div>
            <p v-if="copyFromLang && !hasLangContent(copyFromLang)" class="mt-1 text-xs text-red-500">
              {{ $t('no-content-to-copy') || 'No content available in this language' }}
            </p>
            <p v-if="hasCurrentContent && copyFromLang && hasLangContent(copyFromLang)"
              class="mt-1 text-xs text-yellow-600">
              {{ $t('copy-warning') || '⚠ This will overwrite current content' }}
            </p>
          </div>

          <select-artist class="mt-6" block :label="$t('artist.artists')" v-model="form.artists" />
          <select-genre class="mt-6" block :label="$t('genre.genres')" v-model="form.genres" />

          <div class="mt-10">
            <label>{{ $t("image-cover") }}</label>
            <image-field tag="song" v-model="form.image" @changed="update" />
          </div>

          <melody-uploader class="mt-10" v-model="form.melodies" @changed="update" />
        </div>
      </div>
      <chord-editor class="w-2/3" v-model="currentLangForm.sections" />
    </card>
  </div>
</template>

<script>
import { dataProvider } from "@modular-rest/client";
import notifier from "../../../utilities/notifier";
import SeoLabels from '~/components/inputs/SeoLabels.vue';

export default {
  components: { SeoLabels },
  middleware: ["auth"],
  async asyncData({ params, error }) {
    // Skip API calls during static generation
    if (process.server) {
      return {
        song: null,
      };
    }

    try {
      const data = await dataProvider.findOne({
        database: "tab",
        collection: "song",
        query: { _id: params.id },
      });

      if (data) {
        return {
          song: data,
        };
      } else {
        error({ statusCode: 404, message: "Song doesn't found" });
      }
    } catch (err) {
      console.error("Error fetching song:", err);
      error({ statusCode: 500, message: "Failed to load song" });
    }
  },
  data() {
    return {
      pending: false,
      song: null,
      currentLang: 'ckb-IR',
      copyFromLang: '',
      isInitializing: true,
      form: {
        content: {
          'ckb-IR': null,
          'ckb-Latn': null,
          'kmr': null,
        },
        rhythm: "",
        artists: [],
        genres: [],
        chords: {
          keySignature: "",
          list: [],
          vocalNote: {},
        },
        image: null,
        melodies: [],
      },
      currentLangForm: {
        title: "",
        title_seo: "",
        sections: [],
      },
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    vocalNote() {
      return (this.form.chords.vocalNote || {}).note || "";
    },
    availableLangs() {
      return ['ckb-IR', 'ckb-Latn', 'kmr'];
    },
    hasCurrentContent() {
      return this.currentLangForm.title ||
        this.currentLangForm.title_seo ||
        (this.currentLangForm.sections && this.currentLangForm.sections.length > 0);
    },
  },
  methods: {
    getLangLabel(lang) {
      const labels = {
        'ckb-IR': 'سورانی (ایران)',
        'ckb-Latn': 'سورانی (لاتین)',
        'kmr': 'کرمانجی',
      };
      return labels[lang] || lang;
    },
    hasLangContent(lang) {
      return this.form.content[lang] && this.form.content[lang].title;
    },
    switchLanguage(lang) {
      // Save current language content before switching (but not during initialization)
      if (!this.isInitializing && (this.currentLangForm.title || this.currentLangForm.title_seo || this.currentLangForm.sections.length > 0)) {
        this.form.content[this.currentLang] = { ...this.currentLangForm };
      }

      this.currentLang = lang;

      // Load new language content
      if (this.form.content[lang] && this.form.content[lang] !== null) {
        this.currentLangForm = {
          title: this.form.content[lang].title || '',
          title_seo: this.form.content[lang].title_seo || '',
          sections: this.form.content[lang].sections ? JSON.parse(JSON.stringify(this.form.content[lang].sections)) : [],
        };
      } else {
        // Initialize empty form for new language
        this.currentLangForm = {
          title: '',
          title_seo: '',
          sections: [],
        };
      }
    },

    copyLanguage() {
      if (!this.copyFromLang) return;

      const sourceContent = this.form.content[this.copyFromLang];
      if (!sourceContent || !this.hasLangContent(this.copyFromLang)) {
        notifier.toast({
          label: 'Error',
          description: 'Source language content not found',
          type: 'error',
        });
        return;
      }

      // Show confirmation if current content will be overwritten
      if (this.hasCurrentContent) {
        const confirmed = confirm(
          this.$t('copy-confirm-message') ||
          `This will overwrite the current ${this.getLangLabel(this.currentLang)} content. Continue?`
        );
        if (!confirmed) return;
      }

      // Copy content to current language (rhythm is not copied as it's shared)
      this.currentLangForm = {
        title: sourceContent.title || '',
        title_seo: sourceContent.title_seo || '',
        sections: sourceContent.sections ? JSON.parse(JSON.stringify(sourceContent.sections)) : [],
      };

      // Show success message
      notifier.toast({
        label: 'Success',
        description: `${this.$t('copied-from') || 'Copied from'} ${this.getLangLabel(this.copyFromLang)}`,
        type: 'success',
      });

      this.copyFromLang = '';
    },
    update() {
      // Save current language content before updating
      this.form.content[this.currentLang] = { ...this.currentLangForm };

      this.pending = true;
      dataProvider
        .updateOne({
          database: "tab",
          collection: "song",
          query: { _id: this.id },
          update: {
            content: this.form.content,
            rhythm: this.form.rhythm,
            artists: this.form.artists,
            genres: this.form.genres,
            chords: this.form.chords,
            image: this.form.image,
            melodies: this.form.melodies,
            updatedAt: new Date(),
          },
        })
        .then(() => {
          notifier.toast({
            label: 'Success',
            description: 'Song saved successfully',
            type: 'success',
          });
        })
        .catch(({ error }) => {
          notifier.toast({
            label: "Update song error",
            description: JSON.stringify(error),
            type: "error",
          });
        })
        .finally(() => (this.pending = false));
    },
  },
  mounted() {
    // Initialize form from song data
    if (this.song) {
      // Migrate old structure to new if needed
      if (this.song.title && !this.song.content) {
        // Old structure - migrate on the fly
        this.form.content['ckb-IR'] = {
          title: this.song.title || '',
          title_seo: this.song.title_seo || '',
          sections: this.song.sections || [],
        };
        // Move rhythm from old structure to main object
        this.form.rhythm = this.song.rhythm || '';
      } else if (this.song.content) {
        // New structure - ensure all language keys exist
        this.form.content = {
          'ckb-IR': this.song.content['ckb-IR'] || null,
          'ckb-Latn': this.song.content['ckb-Latn'] || null,
          'kmr': this.song.content['kmr'] || null,
        };
      }

      // Copy shared fields (including rhythm)
      this.form.rhythm = this.song.rhythm || '';
      this.form.artists = this.song.artists || [];
      this.form.genres = this.song.genres || [];
      this.form.chords = this.song.chords || { keySignature: "", list: [], vocalNote: {} };
      this.form.image = this.song.image || null;
      this.form.melodies = this.song.melodies || [];

      // Set current language to default language
      this.currentLang = 'ckb-IR';

      // Load current language content (without saving first)
      this.isInitializing = true;
      this.switchLanguage(this.currentLang);
      this.isInitializing = false;
    }
  },
};
</script>

<style scoped>
.float-button {
  position: fixed;
  bottom: 20px;
}
</style>