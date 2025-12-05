<template>
  <div class="auto-scroll">
    <span class="label">Auto Scroll</span>
    <div class="card flex">
      <div class="range flex">
        <vs-button transparent size="mini" @click="changeSpeed(-1)">
          <i class="bx bx-minus" />
        </vs-button>
        <input :value="speed" disabled />
        <vs-button transparent size="mini" @click="changeSpeed(1)">
          <i class="bx bx-plus" />
        </vs-button>
      </div>
      <vs-button circle color="warn" gradient @click="togglePlay()">
        <i v-if="!isPlaying" class="bx bx-play" />
        <i v-if="isPlaying" class="bx bx-pause" />
      </vs-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      window: {
        width: 100,
      },
      isPlaying: false,
      speed: 10,
      currentPos: 0,
    };
  },

  computed: {
    bodyStyle() {
      return {
        width: this.window.width + "px",
      };
    },
  },

  beforeDestroy() {
    this.isPlaying = false;
  },

  watch: {
    isPlaying(value) {
      if (value == true) window.requestAnimationFrame(this.scroll);
    },
  },

  mounted() {
    window.addEventListener("resize", this.reportWindowSize);
    window.addEventListener("scroll", this.getScrollOffset);
    this.reportWindowSize();
    this.window;
  },

  destroyed() {
    window.removeEventListener("resize", this.reportWindowSize);
  },

  methods: {
    togglePlay() {
      this.isPlaying = !this.isPlaying;

      this.$gtag("event", "auto scroll", {
        value: this.isPlaying ? 1 : 0,
      });
    },

    changeSpeed(value = 1) {
      let tempChange = this.speed + value;
      if (tempChange > 0 && tempChange < 41) this.speed += value;
    },

    reportWindowSize() {
      this.window.width = window.document.body.offsetWidth * 0.9;
    },

    getScrollOffset() {
      this.currentPos = window.pageYOffset;
    },

    scroll() {
      this.currentPos += this.speed / 50;

      let nextPos = this.currentPos;
      window.scrollTo(0, nextPos);

      if (
        nextPos < window.document.body.scrollHeight &&
        this.isPlaying == true
      ) {
        window.requestAnimationFrame(this.scroll);
      } else {
        this.isPlaying = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.auto-scroll {
  position: fixed;
  bottom: 10px;
  left: 20px;

  .label {
    font-size: 9px;
    position: relative;
    top: 10px;
    left: 75px;
    color: gray;
    background: white;
    padding: 3px;
  }
}

.bx {
  font-size: 20px;
}

.card {
  border: 1px solid rgb(228, 228, 228);
  border-radius: 10px;
  background: white;
}

.flex {
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.range {
  margin-right: 20px;
  font-size: 15px;
}

input {
  // margin: 1px;
  border-radius: 5px;
  text-align: center;
  background-color: rgb(234, 245, 255);
  width: 30px;
}
</style>