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
            v-model="form.title"
          />

          <seo-labels v-model="form.title_seo"></seo-labels>

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
            v-model="form.rhythm"
          />
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
      <chord-editor class="w-2/3" v-model="form.sections" />
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
      delete data._id;
      return {
        form: data,
      };
    } else error("Song doesn't found");
  },
  data() {
    return {
      pending: false,
      form: {
        title: "",
        rhythm: "-",
        artists: [],
        genres: [],
        chords: {
          keySignature: "",
          list: [],
          vocalNote: {},
        },
        sections: [],
        image: null,
        melodies: [],
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
  },
  methods: {
    update() {
      this.pending = true;
      dataProvider
        .updateOne({
          database: "tab",
          collection: "song",
          query: { _id: this.id },
          update: this.form,
        })
        // .then(() => this.$router.push('/admin/song'))
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
};
</script>

<style scoped>
.float-button {
  position: fixed;
  bottom: 20px;
}
</style>