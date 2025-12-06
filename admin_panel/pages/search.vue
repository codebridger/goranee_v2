<template>
  <div class="flex flex-col items-center">
    <div class="flex">
      <vs-button
        icon
        @click="search"
        :disabled="!(phrase.length > 2)"
        :loading="pending"
      >
        <i class="bx bx-search"></i>
      </vs-button>
      <vs-input v-model="phrase" :placeholder="$t('search.label')"> </vs-input>
    </div>
    <grid-artists
      v-if="artists.length"
      :list="artists"
      :title="$t('search.searchedArtists')"
    />
    <grid-songs
      v-if="songs.length"
      :list="songs"
      :title="$t('search.searchedSongs')"
    />
    <div v-else dir="rtl" class="mt-16 max-w-sm text-gray-600">
      {{ $t("search.help") }}
    </div>
  </div>
</template>

<script>
import { dataProvider } from "@modular-rest/client";

export default {
  data() {
    return {
      songs: [],
      artists: [],
      phrase: "",
      pending: false,
    };
  },

  head() {
    return {
      title: "جستجو آکورد",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "search",
          name: "description",
          content: "جستجو آکورد در آرشیو وبسایت",
        },
      ],
    };
  },

  mounted() {
    this.$gtag("config", {
      page_path: this.$route.path,
    });
  },

  methods: {
    async search() {
      if (!this.phrase.length) return;

      this.songs = [];
      this.artists = [];

      this.pending = true;

      await Promise.all([
        // Search Songs
        dataProvider
          .find({
            database: "tab",
            collection: "song",
            query: { 
              $or: [
                { 'content.ckb-IR.title': { $regex: this.phrase, $options: 'i' } },
                { 'content.ckb-Latn.title': { $regex: this.phrase, $options: 'i' } },
                { 'content.kmr.title': { $regex: this.phrase, $options: 'i' } },
                { 'content.hac.title': { $regex: this.phrase, $options: 'i' } },
              ]
            },
            populates: ["genres", "artists"],
            options: { sort: "-_id" },
          })
          .then((docs) => this.filterSearchResultSong(docs, this.phrase)),

        // Search Artists
        dataProvider
          .find({
            database: "tab",
            collection: "artist",
            query: { 
              $or: [
                { 'content.ckb-IR.name': { $regex: this.phrase, $options: 'i' } },
                { 'content.ckb-Latn.name': { $regex: this.phrase, $options: 'i' } },
                { 'content.kmr.name': { $regex: this.phrase, $options: 'i' } },
                { 'content.hac.name': { $regex: this.phrase, $options: 'i' } },
              ]
            },
            options: { sort: "-_id" },
          })
          // .then((docs) => this.filterSearchResultArtist(docs, this.phrase)),
          .then((docs) => (this.artists = docs)),
      ]).finally((_) => (this.pending = false));

      this.$gtag("event", "search", {
        event_label: this.phrase,
      });
    },

    addSong(song) {
      let isAdded = this.songs.findIndex((s) => s._id == song._id);
      if (isAdded == -1) this.songs.push(song);
    },

    filterSearchResultSong(docs = [], phrase = "") {
      for (let i = 0; i < docs.length; i++) {
        const song = docs[i];

        // Extract title from content object (new structure)
        let songTitle = ''
        if (song.content) {
          const defaultLang = song.defaultLang || 'ckb-IR'
          songTitle = song.content[defaultLang]?.title || song.content['ckb-IR']?.title || ''
        } else {
          songTitle = song.title || ''
        }

        // Search in title
        if (songTitle.includes(phrase)) {
          this.addSong(song);
          continue
        }

        // Search in lyrics (sections) - check all language versions
        const contentToSearch = song.content || {}
        const languages = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
        
        for (const lang of languages) {
          const langContent = contentToSearch[lang]
          if (!langContent || !langContent.sections) continue
          
          for (let sectionIndex = 0; sectionIndex < langContent.sections.length; sectionIndex++) {
            const section = langContent.sections[sectionIndex]
            if (!section.lines) continue

            // search line by line
            for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
              const line = section.lines[lineIndex]
              if (line.text && line.text.includes(phrase)) {
                this.addSong(song)
                return // Found in lyrics, no need to continue searching
              }
            }
          }
        }
      }
    },

    filterSearchResultArtist(docs = [], phrase = "") {
      // This function appears to be unused but keeping it updated for consistency
      for (let i = 0; i < docs.length; i++) {
        const song = docs[i];

        // Extract title from content object (new structure)
        let songTitle = ''
        if (song.content) {
          const defaultLang = song.defaultLang || 'ckb-IR'
          songTitle = song.content[defaultLang]?.title || song.content['ckb-IR']?.title || ''
        } else {
          songTitle = song.title || ''
        }

        // Search in title
        if (songTitle.includes(phrase)) {
          this.addSong(song);
          continue
        }

        // Search in lyrics (sections) - check all language versions
        const contentToSearch = song.content || {}
        const languages = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
        
        for (const lang of languages) {
          const langContent = contentToSearch[lang]
          if (!langContent || !langContent.sections) continue
          
          for (let sectionIndex = 0; sectionIndex < langContent.sections.length; sectionIndex++) {
            const section = langContent.sections[sectionIndex]
            if (!section.lines) continue

            for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
              const line = section.lines[lineIndex]
              if (line.text && line.text.includes(phrase)) {
                this.addSong(song)
                return
              }
            }
          }
        }
      }
    },
  },
};
</script>
