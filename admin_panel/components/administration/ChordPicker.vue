<template>
  <card class="p-2 flex items-center space-x-1 scroll">
    <!-- loop -->
    <div
      v-for="(chord, i) in chords.list"
      :key="i"
      class="chord-box relative"
      :class="[{ chromatic: chord.type == 'chromatic' }]"
    >
      <span class="text-lg">{{ chord.title }}</span>
      <div v-if="i == 0" class="key-signature">
        <span>{{ chords.keySignature }}</span>
      </div>
    </div>
    <!-- Add -->
    <div class="box box-hover cursor-pointer" @click="showTables">
      <span>Add</span>
    </div>
  </card>
</template>

<script>
import notifier from '../../utilities/notifier'
import ChordPickerDialog from './ChordPickerDialog'

export default {
  props: {
    value: Object,
  },
  data() {
    return {
      chords: {
        keySignature: '',
        list: [],
        vocalNote: {}
      },
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        if (value) this.chords = value
      },
    },
  },
  methods: {
    onSelectChord(chords) {
      this.chords = chords
      this.$emit('input', chords)
    },
    showTables() {
      notifier.showDialog({
        component: ChordPickerDialog,
        props: {
          value: this.chords,
        },
        events: {
          input: this.onSelectChord,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.scroll {
  overflow-x: auto;
}

.box {
  @apply flex items-center justify-center bg-blue-300 text-gray-100 rounded;
  width: 80px;
  height: 80px;
}

.box-hover {
  &:hover {
    @apply bg-blue-400;
  }
}

.chord-box {
  @extend .box;
  @apply bg-orange-300;
}

.chromatic {
  @apply bg-pink-600;
}

.key-signature {
  @apply flex items-center justify-center;
  position: absolute;
  width: 80px;
  bottom: 5px;
  font-size: 13px;
  color: theme('colors.gray.700');
}
</style>