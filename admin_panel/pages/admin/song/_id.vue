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
        v-if="availableLangs.length < 4"
        class="px-4 py-2 text-gray-500 hover:text-gray-700"
        @click="addLanguage"
      >
        + {{ $t('add-language') || 'Add Language' }}
      </button>
    </div>

    <chord-picker
      class="mt-4"
      :value="form.chords"
      @input="form.chords = $event"
    />

    <card class="p-4 mt-4 flex space-x-4">
      <div class="w-1/3 pr-4">
        <div>
          <vs-input
            class="mt-4"
            block
            :label="$t('song.title')"
            v-model="currentLangForm.title"
          />

          <seo-labels v-model="currentLangForm.title_seo"></seo-labels>

          <vs-input
            class="mt-5"
            block
            :label="$t('song.vocal-from')"
            :value="vocalNote"
            disabled
          />
          <vs-input
            class="mt-5"
            block
            :label="$t('song.rhythm')"
            v-model="currentLangForm.rhythm"
          />
          
          <!-- Copy from language -->
          <div class="mt-5">
            <label class="block mb-2">{{ $t('copy-from-language') || 'Copy from language' }}</label>
            <select
              v-model="copyFromLang"
              @change="copyLanguage"
              class="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">{{ $t('select-language') || 'Select language...' }}</option>
              <option
                v-for="lang in availableLangs.filter(l => l !== currentLang)"
                :key="lang"
                :value="lang"
              >
                {{ getLangLabel(lang) }}
              </option>
            </select>
          </div>

          <select-artist
            class="mt-6"
            block
            :label="$t('artist.artists')"
            v-model="form.artists"
          />
          <select-genre
            class="mt-6"
            block
            :label="$t('genre.genres')"
            v-model="form.genres"
          />

          <div class="mt-10">
            <label>{{ $t("image-cover") }}</label>
            <image-field tag="song" v-model="form.image" @changed="update" />
            <MelodyUploader
            class="mt-5"
              tag="melody"
              v-model="form.melodies"
              @changed="update"
            />
          </div>

          <melody-uploader
            class="mt-10"
            v-model="form.melodies"
            @changed="update"
          />
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
    let data = await dataProvider
      .findOne({
        database: "tab",
        collection: "song",
        query: { _id: params.id },
      })
      .catch(({ error }) => null);

    if (data) {
      return {
        song: data,
      };
    } else error("Song doesn't found");
  },
  data() {
    return {
      pending: false,
      song: null,
      currentLang: 'ckb-IR',
      copyFromLang: '',
      form: {
        content: {
          'ckb-IR': { title: '', title_seo: '', rhythm: '', sections: [] },
          'ckb-Latn': null,
          'kmr': null,
          'hac': null,
        },
        defaultLang: 'ckb-IR',
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
        rhythm: "-",
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
      return ['ckb-IR', 'ckb-Latn', 'kmr', 'hac'];
    },
  },
  methods: {
    getLangLabel(lang) {
      const labels = {
        'ckb-IR': 'سورانی (ایران)',
        'ckb-Latn': 'سورانی (لاتین)',
        'kmr': 'کرمانجی',
        'hac': 'گورانی',
      };
      return labels[lang] || lang;
    },
    hasLangContent(lang) {
      return this.form.content[lang] && this.form.content[lang].title;
    },
    switchLanguage(lang) {
      // Save current language content before switching
      if (this.form.content[this.currentLang]) {
        this.form.content[this.currentLang] = { ...this.currentLangForm };
      } else {
        this.form.content[this.currentLang] = { ...this.currentLangForm };
      }
      
      this.currentLang = lang;
      
      // Load new language content
      if (this.form.content[lang]) {
        this.currentLangForm = {
          title: this.form.content[lang].title || '',
          title_seo: this.form.content[lang].title_seo || '',
          rhythm: this.form.content[lang].rhythm || '',
          sections: this.form.content[lang].sections ? JSON.parse(JSON.stringify(this.form.content[lang].sections)) : [],
        };
      } else {
        // Initialize empty form for new language
        this.currentLangForm = {
          title: '',
          title_seo: '',
          rhythm: '',
          sections: [],
        };
      }
    },
    addLanguage() {
      // Find first available language slot
      const available = this.availableLangs.find(lang => !this.form.content[lang]);
      if (available) {
        this.switchLanguage(available);
      }
    },
    copyLanguage() {
      if (!this.copyFromLang) return;
      
      const sourceContent = this.form.content[this.copyFromLang];
      if (!sourceContent) {
        notifier.toast({
          label: 'Error',
          description: 'Source language content not found',
          type: 'error',
        });
        return;
      }
      
      // Copy content to current language
      this.currentLangForm = {
        title: sourceContent.title || '',
        title_seo: sourceContent.title_seo || '',
        rhythm: sourceContent.rhythm || '',
        sections: sourceContent.sections ? JSON.parse(JSON.stringify(sourceContent.sections)) : [],
      };
      
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
            defaultLang: this.form.defaultLang,
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
          rhythm: this.song.rhythm || '',
          sections: this.song.sections || [],
        };
        this.form.defaultLang = 'ckb-IR';
      } else if (this.song.content) {
        // New structure
        this.form.content = { ...this.song.content };
        this.form.defaultLang = this.song.defaultLang || 'ckb-IR';
      }
      
      // Copy shared fields
      this.form.artists = this.song.artists || [];
      this.form.genres = this.song.genres || [];
      this.form.chords = this.song.chords || { keySignature: "", list: [], vocalNote: {} };
      this.form.image = this.song.image || null;
      this.form.melodies = this.song.melodies || [];
      
      // Load current language content
      this.switchLanguage(this.currentLang);
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