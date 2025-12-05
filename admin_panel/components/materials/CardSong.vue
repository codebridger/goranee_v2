<template>
  <vs-card type="3" class="card-song" @click="push">
    <template #title>
      <NuxtLink :to="to">
        <h2 class="text-right">{{ "آکورد " + song.title }}</h2>
      </NuxtLink>
    </template>
    <template #text>
      <div
        class="flex flex-col items-end justify-between h-32 w-32 md:w-40 lg:w-48 xl:w-48"
      >
        <div class="flex flex-wrap">
          <span v-for="(artist, i) in song.artists" :key="i">{{
            artist.name
          }}</span>
        </div>
        <div class="flex flex-wrap">
          <span v-for="(genre, i) in song.genres" :key="i">{{
            genre.title
          }}</span>
        </div>
      </div>
    </template>
    <template #img>
      <div class="w-full w-56" :style="{ background: getRandomColor() }">
        <img v-if="song.image" :src="thumbnailLink" />
      </div>
    </template>
    <template #interactions>
      <vs-button
        v-if="allowRemove"
        icon
        danger
        tranparent
        @click="$emit('remove')"
      >
        <i class="bx bx-trash-alt"></i>
      </vs-button>
    </template>
  </vs-card>
</template>

<script>
import { fileProvider } from "@modular-rest/client";
import { BASE_URL_ON_ClIENT } from "~/config";

export default {
  name: "card-song",
  props: {
    song: Object,
    allowRemove: Boolean,
    to: String,
  },
  computed: {
    thumbnailLink() {
      return fileProvider.getFileLink(this.song.image, BASE_URL_ON_ClIENT);
    },
  },
  methods: {
    getRandomColor() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    push() {
      if (this.to) this.$router.push(this.to);
    },
  },
};
</script>

<style lang="scss">
.card-song {
  /* width: 250px; */
  // margin: 10px;
}
</style>
