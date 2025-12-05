<template>
  <div class="flex flex-col">
    <div class="lg:flex lg:space-x-5">
      <select-chord-type
        class="mt-6 lg:w-1/2"
        block
        :label="$t('chord.select-type')"
        v-model="form.type"
      />
      <select-key-signature
        class="mt-6 lg:w-1/2"
        block
        :label="$t('chord.select-keySignature')"
        v-model="form.keySignature"
      />
    </div>

    <!-- Regular table -->
    <vs-table class="mt-6">
      <template #header>
        <span>Regular Chords</span>
      </template>
      <!-- THead -->
      <template slot="thead">
        <vs-tr>
          <vs-th> Vocal Note </vs-th>
          <vs-th v-for="(column, i) in columns" :key="i">
            {{ column }}
          </vs-th>
        </vs-tr>
      </template>

      <!-- TBody -->
      <template slot="tbody">
        <vs-tr v-for="(fieldsRow, rowIndex) in form.rows" :key="rowIndex">
          <!-- Notes -->
          <vs-td>
            <select-note
              :pending="chordPending"
              v-model="form.vocalRows[rowIndex]"
            />
          </vs-td>
          <!-- Chords -->
          <vs-td v-for="(column, columnIndex) in columns" :key="columnIndex">
            <select-chord
              :list="chords"
              :pending="chordPending"
              v-model="form.rows[rowIndex][column]"
            />
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>

    <!-- Chromatic table -->
    <vs-table class="mt-6">
      <template #header>
        <span>Chromatic Chords</span>
      </template>
      <!-- THead -->
      <template slot="thead">
        <vs-tr>
          <vs-th>01</vs-th>
          <vs-th>02</vs-th>
          <vs-th>03</vs-th>
          <vs-th>04</vs-th>
        </vs-tr>
      </template>

      <!-- TBody -->
      <template slot="tbody">
        <vs-tr
          v-for="(fieldsRow, rowIndex) in form.chromaticRows"
          :key="rowIndex"
        >
          <vs-td
            v-for="(column, columnIndex) in chromaticColumns"
            :key="columnIndex"
          >
            <select-chord
              :list="chords"
              :pending="chordPending"
              :value="form.chromaticRows[rowIndex][column] || ''"
              @input="form.chromaticRows[rowIndex][column] = $event"
            />
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>

    <div class="mt-4">
      <vs-button v-if="!edit" @click="create" :loading="pending">{{
        $t('create')
      }}</vs-button>
      <vs-button v-else @click="update" :loading="pending">{{
        $t('update')
      }}</vs-button>
    </div>
  </div>
</template>

<script>
import { dataProvider } from '@modular-rest/client'
import notifier from '../../utilities/notifier'

export default {
  props: {
    database: { type: String, required: true },
    collection: { type: String, required: true },
    /**
     * Define wheather or not this form
     * is an edit form.
     */
    edit: Boolean,
    /**
     * The document to edit it
     * when edit is true.
     */
    id: String,
  },

  data() {
    return {
      form: {
        type: '',
        keySignature: '',
        rows: this.createTableArray(),
        vocalRows: ['-', '-', '-', '-', '-', '-', '-'],
        chromaticRows: this.createChromaticTableArray(),
      },
      chords: [],
      chordPending: false,
      columns: ['major', 'naturalMinor', 'harmonicMinor', 'melodicMinor'],
      chromaticColumns: ['one', 'two', 'three', 'four'],
      pending: false,
    }
  },

  watch: {
    id: {
      immediate: true,
      handler(value) {
        if (this.edit) {
          this.pending = true
          dataProvider
            .findOne({
              database: this.database,
              collection: this.collection,
              query: { _id: value },
            })
            .then((doc) => {
              delete doc._id
              this.form = doc

              if (!doc.rows.length) {
                this.form.rows = this.createTableArray()
              }
              if (!doc.chromaticRows.length) {
                this.form.chromaticRows = this.createChromaticTableArray()
              }
            })
            .finally(() => (this.pending = false))
        }
      },
    },
  },

  created() {
    this.getChordList()
  },

  methods: {
    createTableArray(y = 7) {
      let lines = []
      for (let i = 0; i < y; i++) {
        lines.push({
          major: '',
          naturalMinor: '',
          harmonicMinor: '',
          melodicMinor: '',
        })
      }
      return lines
    },

    createChromaticTableArray(y = 7) {
      let lines = []
      for (let i = 0; i < y; i++) {
        lines.push({
          one: null,
          two: null,
          three: null,
          four: null,
        })
      }
      return lines
    },

    create() {
      this.pending = true
      dataProvider
        .insertOne({
          database: this.database,
          collection: this.collection,
          doc: this.form,
        })
        .then(() => {
          this.$emit('created')
          this.$emit('close')
        })
        .catch((result) => {
          notifier.toast({
            label: `Create ${this.collection} error`,
            description: result.error,
            type: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },

    update() {
      this.pending = true

      dataProvider
        .updateOne({
          database: this.database,
          collection: this.collection,
          query: { _id: this.id },
          update: this.form,
        })
        .then(() => {
          this.$emit('updated')
          this.$emit('close')
        })
        .catch((result) => {
          notifier.toast({
            label: `Update ${this.collection} error`,
            description: result.error,
            type: 'error',
          })
        })
        .finally(() => (this.pending = false))
    },

    getChordList() {
      this.chordPending = true
      dataProvider
        .find({
          database: 'chord',
          collection: 'chord',
          query: {},
          options: {
            sort: 'title',
          },
        })
        .then((list) => (this.chords = list))
        .finally(() => (this.chordPending = false))
    },
  },
}
</script>

<style>
</style>