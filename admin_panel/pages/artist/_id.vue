<template>
  <div>
    <grid-songs :list="list" :title="artistName" />
  </div>
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  async asyncData({ params }) {
    let list = [];
    let artistId = params.id;
    let artist = null;

    // Skip API calls during static generation
    if (process.server) {
      return {
        list,
        artistId,
        artist,
      };
    }

    try {
      artist = await dataProvider.findOne({
        database: "tab",
        collection: "artist",
        query: { _id: artistId },
      });

      const docs = await dataProvider.find({
        database: "tab",
        collection: "song",
        query: { artists: { $all: [artistId] } },
        populates: ["genres", { path: "artists", select: "name" }],
        options: { sort: "-_id" },
      });
      list = docs || [];
    } catch (err) {
      console.error("Error fetching artist or songs:", err);
    }

    return {
      list,
      artistId,
      artist,
    };
  },

  data() { },

  computed: {
    artistName() {
      if (!this.artist) return '';
      // Handle new structure with content object
      if (this.artist.content) {
        const defaultLang = this.artist.defaultLang || 'ckb-IR';
        return this.artist.content[defaultLang]?.name || this.artist.content['ckb-IR']?.name || '';
      }
      // Fallback to old structure
      return this.artist.name || '';
    },
  },
  head() {
    const name = this.artistName;
    let titles = [
      name,
      ...((this.artist?.content?.[this.artist?.defaultLang || 'ckb-IR']?.name_seo || this.artist?.name_seo || "")).split("\n"),
    ];

    let metaList = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i].trim();

      if (!title.length) continue;

      metaList.push({
        hid: this.id + i,
        name: "description",
        content: "لیست آکورد های کوردی " + title,
      });
    }

    return {
      title: name,
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

    isLogin() {
      return this.$store.getters["auth/isLogin"];
    },
  },
};
</script>