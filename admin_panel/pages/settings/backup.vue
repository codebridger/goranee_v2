<template>
  <div class="page">
    <div class="container">
      <p>
        By tapping opposit button a new backup will be generate, then will be
        shown on the table.
      </p>
      <vs-button :loading="pendingBackup" @click="createBackup">Create new Backup</vs-button>
    </div>

    <div class="container w-full">
      <BackupUploader @uploaded="getList" />
    </div>

    <vs-table :loading="loadingList">
      <template #thead>
        <vs-tr>
          <vs-th> Title </vs-th>
          <vs-th> Size </vs-th>
          <vs-th> options </vs-th>
        </vs-tr>
      </template>
      <template #tbody>
        <vs-tr :key="i" v-for="(file, i) in list">
          <vs-td>
            <a :href="getLink(file.title)">
              {{ file.title }}
            </a>
          </vs-td>
          <vs-td>
            {{ file.size }}
          </vs-td>
          <vs-td class="flex">
            <vs-button @click="restore(file.title)">Restore</vs-button>
            <vs-button color="red" @click="removeBackup(file.title)" danger>Remove</vs-button>
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>
  </div>
</template>

<script>
import { BASE_URL } from "@/config";
import notifier from "~/utilities/notifier";

export default {
  middleware: ["auth"],
  data() {
    return {
      loadingList: false,
      pendingBackup: false,
    };
  },
  computed: {
    list() {
      return this.$store.getters["backup/list"];
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    getLink(title) {
      return BASE_URL + "/backup-files/" + title;
    },
    getList() {
      this.loadingList = true;
      this.$store
        .dispatch("backup/getList")
        .catch((error) => {
          const message = error?.message || error || "Failed to load backup list";
          notifier.toast({
            label: "Failed to load backups",
            description: message,
            type: "error",
          });
        })
        .finally((_) => {
          this.loadingList = false;
        });
    },
    createBackup() {
      this.pendingBackup = true;
      this.$store
        .dispatch("backup/createNewBackup")
        .then((_) => {
          notifier.toast({
            label: "Backup created successfully",
            description: "A new backup has been generated",
            type: "success",
          });
          this.getList();
        })
        .catch((error) => {
          const message = error?.message || error || "Failed to create backup";
          notifier.toast({
            label: "Failed to create backup",
            description: message,
            type: "error",
          });
        })
        .finally((_) => {
          this.pendingBackup = false;
        });
    },
    removeBackup(title) {
      const isAllowed = confirm(`Do you want to remove ${title} backup file?`);
      if (!isAllowed) return;

      this.$store
        .dispatch("backup/removeBackupfile", title)
        .then((_) => {
          notifier.toast({
            label: "Backup removed",
            description: title,
            type: "success",
          });
          this.getList();
        })
        .catch((error) => {
          const message = error?.message || error || "Failed to remove backup";
          notifier.toast({
            label: "Failed to remove backup",
            description: message,
            type: "error",
          });
        });
    },
    restore(title) {
      const isAllowed = confirm(
        `Do you want to restore ${title} file? it will emove current data on database.`
      );
      if (!isAllowed) return;

      this.$store
        .dispatch("backup/restoreBackupFile", title)
        .then((_) => {
          notifier.toast({
            label: `Backup file restored`,
            description: title,
            type: "info",
          });
        })
        .catch((error) => {
          const message = error?.message || error || "Failed to restore backup";
          notifier.toast({
            label: "Restore failed",
            description: message,
            type: "error",
          });
        });
    },
  },
};
</script>

<style lang="scss">
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
