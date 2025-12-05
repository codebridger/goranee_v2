<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center flex-row-reverse">
      <h2 class="text-lg">{{ $t('song.new-song') }}</h2>
      <vs-button :loading="pending" @click="create">{{
        $t('create')
      }}</vs-button>
    </div>

    <chord-picker class="mt-4" v-model="form.chords" />

    <card class="p-4 mt-4 flex space-x-4">
      <div class="w-1/3 pr-4">
        <div>
          <vs-input
            class="mt-4"
            block
            :label="$t('song.title')"
            v-model="form.title"
          />
          <vs-input
            class="mt-5"
            block
            :label="$t('song.vocal-from')"
            :value="vocalNote"
            disabled
          />
          <vs-input
            class="mt-4"
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
          <!-- <div class="mt-10">
            <label>{{ $t('image-cover') }}</label>
            <image-field tag="song" v-model="form.image" />
          </div> -->
        </div>
      </div>
      <chord-editor class="w-2/3" v-model="form.sections" />
    </card>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../../utilities/notifier'

export default {
  middleware: ['auth'],
  data() {
    return {
      pending: false,
      form: {
        title: '',
        rhythm: '-',
        artists: [],
        genres: [],
        chords: {
          keySignature: '',
          list: [],
          vocalNote: {},
        },
        sections: [],
      },
    }
  },
  computed: {
    vocalNote() {
      return (this.form.chords.vocalNote || {}).note || ''
    },
  },
  methods: {
    create() {
      this.pending = true
      dataProvider
        .insertOne({
          database: 'tab',
          collection: 'song',
          doc: this.form,
        })
        .then((newSong) => this.$router.push('/admin/song/' + newSong._id))
        .catch(({ error }) => {
          notifier.toast({
            label: 'Create song error',
            description: JSON.stringify(error),
            typr: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },
  },
}
</script>

<style>
</style>