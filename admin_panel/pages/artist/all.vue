<template>
  <grid-artists :list="list" :title="$t('artist.artists')" />
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  async asyncData({}) {
    let list = [];

    await dataProvider
      .find({
        database: "tab",
        collection: "artist",
        query: {},
        options: { sort: "-_id" },
      })
      .then((docs) => (list = docs));

    return {
      list,
    };
  },

  data() {},

  head() {
    return {
      title: "لیست هنرمندان",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "all-artists",
          name: "description",
          content: "لیست آکور هنرمندان کورد",
        },
      ],
    };
  },

  mounted() {
    this.$gtag("config", {
      page_path: this.$route.path,
    });
  },

  computed: {
    isLogin() {
      return this.$store.getters["auth/isLogin"];
    },
  },
};
</script>