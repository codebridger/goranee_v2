<template>
  <div>
    <grid-songs :list="list" :title="artist.name" />
  </div>
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  async asyncData({ params }) {
    let list = [];
    let artistId = params.id;

    let artist = await dataProvider.findOne({
      database: "tab",
      collection: "artist",
      query: { _id: artistId },
    });

    await dataProvider
      .find({
        database: "tab",
        collection: "song",
        query: { artists: { $all: [artistId] } },
        populates: ["genres", { path: "artists", select: "name" }],
        options: { sort: "-_id" },
      })
      .then((docs) => (list = docs));

    return {
      list,
      artistId,
      artist,
    };
  },

  data() {},

  head() {
    let titles = [
      this.artist.name,
      ...(this.artist.name_seo || "").split("\n"),
    ];

    let metaList = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i].trim();

      if(!title.length) continue;

      metaList.push({
        hid: this.id + i,
        name: "description",
        content: "لیست آکورد های کوردی " + title,
      });
    }

    return {
      title: this.artist.name,
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