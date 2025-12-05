<template>
  <div>
    <!-- Help -->
    <p class="text-gray-800">
      Press <span class="text-blue-600">F4</span> to switch edit mode.
    </p>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <vs-button flat @click="createNewSection">New Section</vs-button>
      <vs-input
        label="Ruller px"
        type="number"
        min="10"
        max="768"
        v-model="ruller"
      />
    </div>
    <!-- Sections -->
    <div class="sections-container border mt-2" :key="componentKey">
      <div class="ruller" :style="{ right: rullerWidth + 'px' }" />
      <chord-editor-section
        v-for="(section, i) in sections"
        :key="i"
        :index="i"
        :editToggle="editToggle"
        v-model="sections[i]"
        @up="offset('up', i)"
        @down="offset('down', i)"
        @duplicate="duplicateSection(i, $event)"
        @newSection="createNewSection(i)"
        @remove="removeSection(i)"
      />
    </div>
  </div>
</template>

<script>
const _ = require('lodash')
export default {
  props: {
    value: Array,
  },
  data() {
    return {
      sections: [],
      componentKey: '',
      editToggle: true,
      ruller: 344,
    }
  },
  computed:{
    rullerWidth(){
      return this.ruller - 64;
    }
  },
  created() {
    window.addEventListener('keyup', this.onToggleEditMode)
  },
  destroyed() {
    window.removeEventListener('keyup', this.onToggleEditMode)
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        if (value) this.sections = value
        if (!this.sections.length) this.createNewSection()
      },
    },
    sections: {
      deep: true,
      immediate: true,
      handler() {
        this.$emit('input', this.sections)
      },
    },
  },
  methods: {
    duplicateSection(i, where) {
      let newSection = _.cloneDeep(this.sections[i])
      let newIndex

      if (where == 'end') newIndex = this.sections.length
      else newIndex = i

      this.sections.splice(newIndex + 1, 0, newSection)

      // reset index of sections
      for (let index = 0; index < this.sections.length; index++) {
        this.sections[index].index = index
      }

      this.generateNewKey()
    },
    removeSection(index) {
      this.sections.splice(index, 1)
    },
    createNewSection(at) {
      if (at == null) {
        at = this.sections.length
      }

      let newSection = {
        index: at,
        title: 'New Section',
        direction: 'rtl',
        lines: [],
      }

      this.sections.splice(at + 1, 0, newSection)

      // reset index of sections
      for (let index = 0; index < this.sections.length; index++) {
        this.sections[index].index = index
      }

      this.generateNewKey()
    },
    offset(mode, index) {
      let section = this.sections[index]
      this.sections.splice(index, 1)

      if (mode == 'up') {
        this.sections.splice(index - 1, 0, section)
      } else if (mode == 'down') {
        this.sections.splice(index + 1, 0, section)
      }
      this.generateNewKey()
    },
    generateNewKey() {
      this.componentKey = new Date().getTime()
    },
    onToggleEditMode({ code, ctrlKey }) {
      if (code == 'F4') {
        this.editToggle = !this.editToggle
      }
    },
  },
}
</script>

<style lang="scss" scoped>
#editor {
  min-height: 20rem;
  padding: 10px;
  direction: rtl;
}

.sections-container {
  position: relative;
  .ruller {
    width: 2px;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.3);
    position: absolute;
    left: auto;
  }
}
</style>