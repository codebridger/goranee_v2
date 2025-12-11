<template>
  <div class="rtl">
    <!-- NAVBAR -->
    <vs-navbar>
      <vs-button slot="left" flat v-if="!isLogin" :loading="pending" to="/auth/login">
        {{ $t("auth.sign-in") }}
      </vs-button>

      <vs-button slot="left" v-if="isLogin" @click="activeSidebar = !activeSidebar" flat icon>
        <i class="bx bx-menu"></i>
      </vs-button>

      <NuxtLink to="/search" class="mx-2">
        {{ $t("search.label") }}
      </NuxtLink>

      <NuxtLink to="/about-us" class="mx-2">
        {{ $t("aboutus") }}
      </NuxtLink>

      <NuxtLink to="/artist/all" class="mx-2">
        {{ $t("artist.artists") }}
      </NuxtLink>

      <NuxtLink to="/" class="mx-2">
        {{ $t("navbar.home") }}
      </NuxtLink>
    </vs-navbar>

    <!-- SIDEBAR -->
    <vs-sidebar :open.sync="activeSidebar" absolute>
      <!-- Admin section -->
      <vs-sidebar-group v-if="user && user.permissionGroup.title === 'administrator'">
        <template #header>
          <vs-sidebar-item arrow>
            <template #icon>
              <i class="bx bx-terminal"></i>
            </template>
            {{ $t("navbar.admin.title") }}
          </vs-sidebar-item>
        </template>

        <vs-sidebar-item to="/admin/artists">
          {{ $t("navbar.admin.artists") }}
        </vs-sidebar-item>

        <vs-sidebar-item to="/admin/genres">
          {{ $t("navbar.admin.genres") }}
        </vs-sidebar-item>

        <vs-sidebar-item to="/admin/rhythms">
          {{ $t("navbar.admin.rhythms") }}
        </vs-sidebar-item>

        <vs-sidebar-item to="/admin/song/list">
          {{ $t("navbar.admin.songs") }}
        </vs-sidebar-item>

        <!-- Chord Settings -->
        <vs-sidebar-item to="/admin/chords">
          {{ $t("navbar.admin.chords") }}
        </vs-sidebar-item>
      </vs-sidebar-group>

      <!-- Settings -->
      <vs-sidebar-group v-if="user && user.permissionGroup.title === 'administrator'">
        <template #header>
          <vs-sidebar-item arrow>
            <template #icon>
              <i class="bx bx-terminal"></i>
            </template>
            {{ $t("navbar.settings.title") }}
          </vs-sidebar-item>
        </template>

        <!-- Backup -->
        <vs-sidebar-item to="/settings/backup">
          {{ $t("navbar.settings.backup") }}
        </vs-sidebar-item>
      </vs-sidebar-group>

      <vs-sidebar-item to="/about-us">
        {{ $t("aboutus") }}
      </vs-sidebar-item>
    </vs-sidebar>

    <!-- CONTENT -->
    <div class="page-content">
      <Nuxt />
    </div>

    <dialog-presentor />
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeSidebar: false,
      pending: false,
    };
  },
  created() {
    // Skip API calls during static generation
    if (process.server) {
      return;
    }

    if (!this.isLogin) {
      this.pending = true;
      this.$store.dispatch("auth/loginWithLastSession").finally((_) => {
        this.pending = false;
      });
    }
  },
  computed: {
    isLogin() {
      // return authService.isLogin
      return this.$store.getters["auth/isLogin"];
    },
    user() {
      return this.$store.state.auth.user;
    },
  },
};
</script>

<style lang="scss">
.page-content {
  @apply px-4 pt-16;
}
</style>
