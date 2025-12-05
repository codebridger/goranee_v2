<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse mb-4">
      <div>
        <h2 class="text-lg">{{ "آکورد " + this.song.title }}</h2>
        <p dir="rtl" class="text-sm">
          <span v-for="(artist, i) in song.artists" :key="i">
            {{ artist.name }}،
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
      <Transpose
        :chords="song.chords"
        :sections="song.sections"
        @transposed="onReceivedTranspose"
      />

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
    let song = await dataProvider
      .findOne({
        database: "tab",
        collection: "song",
        query: { _id: params.id },
        populates: ["artists", "genres"],
      })
      .catch(() => null);

    if (song) {
      return {
        song,
        transposedSections: song.sections,
        vocalNote: song.chords.vocalNote,
      };
    } else {
      error("This song dosen't found");
    }
  },

  data() {
    return {
      transposedSections: [],
      componentKey: "",
      vocalNote: {},
    };
  },

  head() {
    let artists = this.song.artists.map((artist) => artist.name).join(" و ");
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

  methods: {
    onReceivedTranspose({ sections, vocalNote }) {
      this.transposedSections = sections;
      this.componentKey = new Date().getUTCMilliseconds();
      this.vocalNote = vocalNote;
    },
  },
};
</script>

<style scoped>
.empty {
  height: 50px;
}
</style>