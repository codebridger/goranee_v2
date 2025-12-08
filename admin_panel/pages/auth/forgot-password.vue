<template>
  <div>
    <SequencePresentor :slots="['email', 'code', 'password']" :active="page">
      <card class="p-16" slot="email">
        <div class="text-center text-muted mb-4">
          <small>{{ $t('auth.recover-password') }}</small>
        </div>
        <div>
          <vs-input
            alternative
            class="mb-3"
            addon-left-icon="ni ni-email-83"
            :placeholder="$t('auth.accountID')"
            v-model="accountID"
          >
            <template #icon>
              <i class="bx bx-user" />
            </template>
          </vs-input>
          <div class="mt-4">
            <vs-button block :loading="pending" @click="register">
              {{ $t('auth.submit') }}
            </vs-button>
          </div>
        </div>
      </card>

      <card class="p-16" slot="code">
        <div class="text-center text-muted mb-4">
          <small>{{ $t('auth.verify-code') }}</small>
        </div>
        <div>
          <vs-input
            alternative
            class="mb-3"
            addon-left-icon="ni ni-email-83"
            :placeholder="$t('auth.code')"
            v-model="code"
          />
          <div class="mt-4">
            <vs-button block :loading="pending" @click="verifyID">
              {{ $t('auth.submit') }}
            </vs-button>
          </div>
        </div>
      </card>

      <card class="p-16" slot="password">
        <div class="text-center text-muted mb-4">
          <small>{{ $t('auth.choose-password') }}</small>
        </div>
        <div>
          <vs-input
            alternative
            type="password"
            addon-left-icon="ni ni-lock-circle-open"
            :placeholder="$t('auth.password')"
            v-model="password"
          >
            <template #icon>
              <i class="bx bx-lock-open-alt"></i>
            </template>
          </vs-input>
          <div class="mt-4">
            <vs-button block :loading="pending" @click="changePassword">
              {{ $t('auth.submit') }}
            </vs-button>
          </div>
        </div>
      </card>
    </SequencePresentor>

    <div class="flex flex-row-reverse justify-between items-end mt-2 px-2">
      <div>
        <NuxtLink to="/">
          <small>{{ $t('auth.forgot-password') }}</small>
        </NuxtLink>
      </div>
      <div>
        <NuxtLink to="/auth/login">
          <small>{{ $t('auth.sign-in') }}</small>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
  layout: 'hero',
  data() {
    return {
      accountID: '',
      code: '',
      password: '',
      page: 'email',
      pending: false,
      rememberMe: false,
    }
  },
  methods: {
    register() {
      this.pending = true

      this.$store
        .dispatch('auth/submitIdentity', {
          idType: 'email',
          id: this.accountID,
        })
        .then(() => {
          this.page = 'code'
        })
        .finally(() => (this.pending = false))
    },

    verifyID() {
      this.pending = true

      this.$store
        .dispatch('auth/verifyId', {
          id: this.accountID,
          code: this.code,
        })
        .then(() => {
          this.page = 'password'
        })
        .finally(() => (this.pending = false))
    },

    changePassword() {
      this.pending = true

      this.$store
        .dispatch('auth/changePassword', {
          id: this.accountID,
          code: this.code,
          password: this.password,
        })
        .then(() => {
          this.$router.push('/auth/login')
        })
        .finally(() => (this.pending = false))
    },
  },
}
</script>

<style>
</style>