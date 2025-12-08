<template>
  <div>
    <section dir="rtl">
      <span class="font-bold text-lg">{{ $t("melody-uploader.title") }}</span>
    </section>
    <section :key="compKey">
      <div
        v-for="(melody, i) in tempMelodies"
        :key="i"
        class="border-2 my-2 p-4"
      >
        <div class="flex items-end justify-between">
          <vs-button :loading="melody._pending" @click="onRemoveMelody(i)">{{
            $t("melody-uploader.remove")
          }}</vs-button>
          <vs-input
            class="mt-4"
            :label="$t('title')"
            v-model="melody.title"
            outlined
          />
        </div>
        <!-- Upload -->
        <div
          class="upload-row mt-4 flex justify-between items-center"
          v-if="melody.file == null"
        >
          <input
            type="file"
            accept=".gp,.gp5"
            @change="onInputChanged($event.target.files, i)"
          />
          <vs-button v-if="melody._file" icon flat :loading="melody._pending">
            <i class="bx bx-trash-alt" />
          </vs-button>
        </div>
        <!-- Uloaded -->
        <div class="uploaded-row flex justify-between items-center" v-else>
          <a :href="getFileLink(melody.file)"
            ><span>{{ melody.file.originalName }}</span></a
          >
          <vs-button
            icon
            flat
            :loading="melody._pending"
            @click="onRemoveFile(i)"
          >
            <i class="bx bx-trash-alt" />
          </vs-button>
        </div>
      </div>
    </section>
    <section>
      <vs-button rounded @click="addNewMelody">{{
        $t("melody-uploader.add")
      }}</vs-button>
    </section>
  </div>
</template>

<script>
import { fileProvider } from "@modular-rest/client";
import notifier from "../../utilities/notifier";
import { BASE_URL_ON_ClIENT } from "~/config";

export default {
  model: {
    prop: "melodies",
  },
  props: {
    // { title: 'string', file: file }
    melodies: { type: Array, require: true, default: () => [] },
    tag: { type: String, require: true },
  },
  data() {
    return {
      tempMelodies: [],
      compKey: new Date().getTime(),
    };
  },
  watch: {
    melodies: {
      immediate: true,
      deep: true,
      handler(list) {
        this.tempMelodies = list || [];
      },
    },
  },
  methods: {
    getFileLink(file) {
      return fileProvider.getFileLink(file, BASE_URL_ON_ClIENT);
    },
    addNewMelody() {
      this.tempMelodies.push({
        title: "New melody",
        // uploaded file doc
        file: null,
        // input file
        _file: null,
        // upload status
        _pending: false,
      });
      this.update();
    },

    async onInputChanged(files, melodyIndex) {
      this.tempMelodies[melodyIndex]._file = files[0];
      this.tempMelodies[melodyIndex]._pending = true;

      this.generateCompKey();

      await fileProvider
        .uploadFile(files[0], (value) => {}, this.tag)
        .then((uploaded) => {
          this.tempMelodies[melodyIndex].file = uploaded;
          this.tempMelodies[melodyIndex]._file = null;
          this.update();
        })
        .catch((error) => {
          this.tempMelodies[melodyIndex]._file = null;
          notifier.toast({
            label: "upload error",
            description: error.message,
          });
        });

      this.tempMelodies[melodyIndex]._pending = false;
      this.generateCompKey();
    },

    async onRemoveMelody(melodyIndex) {
      if (this.tempMelodies[melodyIndex].file) {
        await this.onRemoveFile(melodyIndex);
      }

      this.tempMelodies.splice(melodyIndex, 1);
      this.generateCompKey();
      this.update();
    },

    async onRemoveFile(melodyIndex) {
      let uploadedFile = this.tempMelodies[melodyIndex].file;
      this.tempMelodies[melodyIndex]._pending = true;

      this.generateCompKey();

      await fileProvider
        .removeFile(uploadedFile._id)
        .then((_) => {
          this.tempMelodies[melodyIndex].file = null;
          this.update();
        })

        .catch((error) => {
          this.tempMelodies[melodyIndex]._file = null;
          notifier.toast({
            label: "upload error",
            description: error.message,
          });
        });

      this.tempMelodies[melodyIndex]._pending = false;
      this.generateCompKey();
    },

    update() {
      this.$emit("input", this.tempMelodies);
      this.$emit("changed");
    },

    generateCompKey() {
      this.compKey = new Date().getTime();
    },
  },
};
</script>

<style></style>
