<template>
  <grid-songs :list="list" :title="$t('song.songs')" justify="center" />
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  async asyncData({ }) {
    let list = [];

    // Skip API calls during static generation
    if (process.server) {
      return {
        list,
      };
    }

    try {
      const docs = await dataProvider.find({
        database: "tab",
        collection: "song",
        query: {},
        populates: ["genres", { path: "artists", select: "name" }],
        options: { sort: "-_id" },
      });
      list = docs || [];
    } catch (err) {
      console.error("Error fetching songs:", err);
      // Return empty list on error
    }

    return {
      list,
    };
  },

  data() { },

  computed: {
    isLogin() {
      return this.$store.getters["auth/isLogin"];
    },
  },
};
</script>
