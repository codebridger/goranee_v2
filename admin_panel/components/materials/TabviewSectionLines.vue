<template>
  <div class="lines whitespace-pre-wrap">
    <p v-for="(line, i) in lines" :key="i" :style="{'text-align':align}">
      <span class="chord" dir="ltr">{{ line.chords }}</span>
      <br />
      <span :dir="direction">{{ line.text }}</span>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    lines: Array,
    direction: String,
  },
  computed: {
    align() {
      return this.direction == 'rtl' ? 'right' : 'left'
    }
  }
}
</script>

<style scoped>
.lines {
  font-family: dana;
}

.chord {
  color: red;
}
</style>