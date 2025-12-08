<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse mb-4">
      <div>
        <h2 class="text-lg">{{ "آکورد " + this.song.title }}</h2>
        <p dir="rtl" class="text-sm">
          <span v-for="(artist, i) in song.artists" :key="i">
            {{ getArtistName(artist) }}،
          </span>
        </p>
      </div>
      <div dir="rtl">
        <h3 class="text-sm">{{ $t("song.rhythm") + " " + song.rhythm }}</h3>
        <h3 class="text-sm text-right">
          {{ $t("song.vocal-from") + " " }}
          <span dir="ltr">{{ vocalNote.note }}</span>
        </h3>
      </div>
    </div>

    <client-only placeholder="Loading transpose...">
      <Transpose :chords="song.chords" :sections="song.sections" @transposed="onReceivedTranspose" />

      <AutoScroll />
    </client-only>

    <card class="p-4 mt-4">
      <tabview :key="componentKey" :sections="transposedSections" />
    </card>
    <div class="empty"></div>
  </div>
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  async asyncData({ error, params }) {
    // Skip API calls during static generation
    if (process.server) {
      return {
        song: null,
        songTitle: '',
        songRhythm: '',
        songSections: [],
        songTitleSeo: '',
      };
    }

    let song = null;
    try {
      song = await dataProvider.findOne({
        database: "tab",
        collection: "song",
        query: { _id: params.id },
        populates: ["artists", "genres"],
      });
    } catch (err) {
      console.error("Error fetching song:", err);
    }

    if (song) {
      // Extract content from new structure for backward compatibility
      let songTitle = ''
      let songRhythm = ''
      let songSections = []
      let songTitleSeo = ''

      if (song.content) {
        const defaultLang = 'ckb-IR'
        const langContent = song.content[defaultLang] || song.content['ckb-IR']
        songTitle = langContent?.title || ''
        songRhythm = song.rhythm || '' // Rhythm is now in main object
        songSections = langContent?.sections || []
        songTitleSeo = langContent?.title_seo || ''
      } else {
        // Fallback to old structure
        songTitle = song.title || ''
        songRhythm = song.rhythm || ''
        songSections = song.sections || []
        songTitleSeo = song.title_seo || ''
      }

      // Add flattened fields to song object for template compatibility
      song.title = songTitle
      song.rhythm = songRhythm
      song.sections = songSections
      song.title_seo = songTitleSeo

      return {
        song,
        transposedSections: songSections,
        vocalNote: song.chords?.vocalNote || {},
      };
    } else {
      error({ statusCode: 404, message: "This song doesn't found" });
    }
  },

  data() {
    return {
      transposedSections: [],
      componentKey: "",
      vocalNote: {},
    };
  },

  methods: {
    getArtistName(artist) {
      // Extract name from content object (new structure)
      if (artist && artist.content) {
        const defaultLang = 'ckb-IR'
        return artist.content[defaultLang]?.name || artist.content['ckb-IR']?.name || ''
      }
      // Fallback to old structure
      return artist?.name || ''
    },
    onReceivedTranspose({ sections, vocalNote }) {
      this.transposedSections = sections;
      this.componentKey = new Date().getUTCMilliseconds();
      this.vocalNote = vocalNote;
    },
  },

  head() {
    let artists = this.song.artists.map((artist) => this.getArtistName(artist)).join(" و ");
    let titles = [this.song.title, ...(this.song.title_seo || "").split("\n")];
    let metaList = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i].trim();

      if (!title.length) continue;

      metaList.push({
        hid: this.id + i,
        name: "description",
        content: "آکورد " + title + " از " + artists,
      });
    }

    return {
      title: "آکورد " + this.song.title,
      meta: metaList,
    };
  },

  mounted() {
    this.$gtag("config", {
      page_path: this.$route.path,
    });
  },

  computed: {
    id() {
      return this.$route.params.id;
    },
  },
};
</script>

<style scoped>
.empty {
  height: 50px;
}
</style>