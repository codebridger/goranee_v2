<template>
  <card class="p-2 flex items-center space-x-1 scroll">
    <!-- loop -->
    <div
      class="chord-box box-hover relative"
      v-for="(table, i) in tables"
      :key="i"
      :class="{ selected: i == currentTableIndex }"
      @click="currentTableIndex = i"
    >
      <span class="text-lg">{{ table.keySignature[chords.keySignature] }}</span>
    </div>
  </card>
</template>

<script>
import _ from "lodash";

function generateSpace(total) {
  let text = "";
  for (let index = 0; index < total; index++) {
    text += " ";
  }
  return text;
}

/**
 * @param string word the string you want find its positions.
 * @param string text the text you want to find word positions in it.
 */
function findWordPosition(word, text, lastLength = 0) {
  let positions = [];
  let textLength = text.length;

  let from = text.indexOf(word);

  // is not valid if from is -1
  if (from == -1) {
    return positions;
  }

  let to = from + word.length - 1;
  let position = {
    from: from + (lastLength > 0 ? lastLength : 0),
    to: to + (lastLength > 0 ? lastLength : 0),
    word: word,
  };

  /**
   * Check valid [from] position
   */

  // is not valid if after [from] posed another character
  let charAfterToPositiontext = text.charAt(position.to + 1);
  if (charAfterToPositiontext.length && charAfterToPositiontext != " ") {
    return positions;
  }

  // is not valid if before [from] posed another character
  let charBeforeFromPosition = text.charAt(position.from - 1);
  if (charBeforeFromPosition.length && charBeforeFromPosition != " ") {
    return positions;
  }

  positions.push(position);

  let rest = text.slice(to + 1, text.length);
  let restPositions = [];

  if (rest.length) {
    lastLength = to + lastLength - 1;
    restPositions = findWordPosition(word, rest, lastLength);
  }

  return [...positions, ...restPositions];
}

export default {
  props: {
    sections: { type: Array, required: true },
    // {keySignature, list}
    chords: { type: Object, required: true },
  },

  model: {
    prop: "sections",
    event: "transposed",
  },

  data() {
    return {
      currentTableIndex: null,
      tempSections: [],
      tempChords: {
        keySignature: "",
        list: [],
        vocalNote: {},
      },
    };
  },

  watch: {
    sections: {
      immediate: true,
      deep: true,
      handler(value) {
        if (value) this.tempSections = value;
      },
    },

    chords: {
      immediate: true,
      deep: true,
      handler({ keySignature, list }) {
        // this.chords = { keySignature, list }
        this.findMainTable(this.chords);
      },
    },

    currentTableIndex(index, old) {
      if (old == null) return;

      this.changeChordOffset(index);
      this.changeVocalNote(index);
      this.putTempChordsIntoTempSections();
      this.key01 = new Date().getUTCMilliseconds();
      /**
       * Stream the song HtmlContent to upper level
       */
      this.$emit("transposed", {
        sections: this.tempSections,
        vocalNote: this.tempChords.vocalNote,
      });

      this.$gtag("event", "transpose");
    },
  },

  computed: {
    tables() {
      return this.$store.state.chords.tables;
    },
  },

  created() {
    this.$store.dispatch("chords/getTables").then(() => {
      this.findMainTable(this.chords);
    });
  },

  methods: {
    /**
     * The table index of first chord
     */
    getKeySignatureOffset() {
      let firstChord = this.chords.list[0];
      return this.getChordOffset(firstChord);
    },

    findMainTable({ keySignature, list }) {
      if (!keySignature || !list) return;

      this.currentTableIndex = this.getKeySignatureOffset();
    },

    changeVocalNote(offset) {
      let originalNote = this.chords.vocalNote;
      let table = this.tables[offset];
      this.tempChords.vocalNote = {
        table: table._id,
        index: originalNote.index,
        note: table.vocalRows[originalNote.index],
      };
    },

    /**
     * Return the table index of given chord
     */
    getChordOffset(chord) {
      let offset = null;

      this.tables.forEach((table, i) => {
        if (chord.table == table._id) offset = i;
      });

      return offset;
    },

    changeChordOffset(newOffset) {
      // let keySignatureOffset = this.getKeySignatureOffset()
      this.tempChords = _.cloneDeep(this.chords);

      this.chords.list.forEach((chord, chordIndex) => {
        /**
         * Find new offset for chord
         */
        // let offset = this.getChordOffset(chord)

        /**
         * Chand chord to new offset
         */
        let table = this.tables[newOffset];
        let rowIndex = chord.rowIndex;
        let column = chord.column;

        let tableChords = [];

        if (chord.type == "regular") tableChords = table.rows;
        else if (chord.type == "chromatic") tableChords = table.chromaticRows;

        let newChord = {
          ...chord,
          title: tableChords[rowIndex][column].title,
          table: table._id,
          chord: tableChords[rowIndex][column]._id,
          keySignature: table.keySignature._id,
        };

        this.tempChords.list[chordIndex] = newChord;
      });
    },

    seperateChords(chordsLine) {
      /**
       * Separate chords in this line
       */
      let list = [];
      let sparatedBySpace = chordsLine
        .split(" ")
        .filter((item) => item != " " && item != "");

      // remove repetitiv chords
      for (let i = 0; i < sparatedBySpace.length; i++) {
        const chord = sparatedBySpace[i];
        if (list.indexOf(chord) == -1) list.push(chord);
      }

      /**
       * Extract chord positions as a list
       */
      let positions = [];
      list.forEach((chordTitle) => {
        positions = positions.concat(findWordPosition(chordTitle, chordsLine));
      });

      positions.sort((a, b) => a.from - b.from);

      return positions;
    },

    injectSpace({
      before,
      current,
      index,
      newPositionListWithSpaces,
      totalPositions,
      lineLength,
    }) {
      // Add start spaces
      if (index == 1 && before.from > 0) {
        newPositionListWithSpaces.push({
          from: 0,
          to: before.to - 1,
          word: generateSpace(0 - before.to),
        });
      }

      newPositionListWithSpaces.push(before);

      let currentLengthDifference =
        current.word.length - (current.newWord || "").length;
      let beforeLengthDifference =
        before.word.length - (before.newWord || "").length;

      let totalSpace = current.from - (before.to + 1);

      if (index == totalPositions - 2) {
        totalSpace +=
          currentLengthDifference < 0
            ? currentLengthDifference * 2
            : currentLengthDifference;
      } else {
        totalSpace +=
          beforeLengthDifference < 0
            ? beforeLengthDifference * 2
            : beforeLengthDifference;
      }

      let spacePosition = {
        from: before.to + 1,
        to: current.from - 1,
        word: generateSpace(totalSpace > 0 ? totalSpace : 1),
      };

      newPositionListWithSpaces.push(spacePosition);

      if (index == totalPositions - 1) newPositionListWithSpaces.push(current);

      // Add end spaces
      if (totalPositions - 1 == index && current.to < lineLength) {
        newPositionListWithSpaces.push({
          from: current.to + 1,
          to: lineLength,
          word: generateSpace(lineLength - current.to),
        });
      }
    },

    injectSpaceBetweenChords(positions = [], lineLength = 0) {
      /**
       * Generate spaces between chords
       * and inject both chords and spaces into a new list
       */
      let newPositionListWithSpaces = [];

      if (positions.length == 1) {
        let position = positions[0];

        // before space
        // this.injectSpace({
        //   before: { from: 0, to: position.from - 1, word: '', newWord: '' },
        //   current: position,
        //   index: 0,
        //   newPositionListWithSpaces: newPositionListWithSpaces,
        //   totalPositions: positions.length,
        // })

        // after space
        if (position.to < lineLength) {
          this.injectSpace({
            before: position,
            current: {
              from: lineLength,
              to: lineLength,
              word: "",
              newWord: "",
            },
            index: 0,
            newPositionListWithSpaces: newPositionListWithSpaces,
            totalPositions: positions.length,
            lineLength: lineLength,
          });
        }
      } else if (positions.length) {
        positions.reduce((before, current, index) => {
          this.injectSpace({
            before: before,
            current: current,
            index: index,
            newPositionListWithSpaces: newPositionListWithSpaces,
            totalPositions: positions.length,
            lineLength: lineLength,
          });

          return current;
        });

        // after space
        // let lastIndex = positions.length - 1
        // let lastPosition = positions[lastIndex];
        // if (lastPosition.to < lineLength) {
        //   this.injectSpace({
        //     before: lastPosition,
        //     current: {
        //       from: lineLength,
        //       to: lineLength,
        //       word: '',
        //       newWord: '',
        //     },
        //     index: lastIndex,
        //     newPositionListWithSpaces: newPositionListWithSpaces,
        //     totalPositions: positions.length,
        //   })
        // }
      }

      return newPositionListWithSpaces;
    },

    putTempChordsIntoTempSections() {
      this.tempSections = _.cloneDeep(this.sections);

      this.sections.forEach((section, sectionIndex) => {
        for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex++) {
          const line = section.lines[lineIndex];

          // seperate chords and spaces
          let speratedChordsFromLine = this.seperateChords(line.chords);

          /**
           * Put transposed chord as a new property
           * for each member of the list
           */
          for (
            let chordIndex = 0;
            chordIndex < this.chords.list.length;
            chordIndex++
          ) {
            const chord = this.chords.list[chordIndex];

            speratedChordsFromLine.forEach((position) => {
              if (position.word == chord.title)
                position.newWord = this.tempChords.list[chordIndex].title;
            });
          }

          let normalizedList = this.injectSpaceBetweenChords(
            speratedChordsFromLine,
            line.chords.length
          );

          /**
           * Join normalized array into one single line
           */
          let transposeChordLine = "";
          normalizedList.forEach((position) => {
            if (position.newWord) transposeChordLine += position.newWord;
            else transposeChordLine += position.word;
          });

          if (transposeChordLine.length) {
            this.tempSections[sectionIndex].lines[lineIndex].chords =
              transposeChordLine;
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.scroll {
  overflow-x: auto !important;
}

.box {
  @apply flex items-center justify-center bg-blue-300 text-gray-100 rounded;
  width: 80px;
  height: 80px;
}

.box-hover {
  &:hover {
    @apply bg-blue-400;
    cursor: pointer;
  }
}

.selected {
  background-color: theme("colors.blue.500") !important;
}

.chord-box {
  @extend .box;
  @apply bg-orange-300;
}
</style>