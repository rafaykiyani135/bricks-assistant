<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-brick-dark to-gray-900 light:from-brick-offwhite light:to-white">
    <div class="w-full max-w-md p-8 space-y-8 rounded-xl shadow-xl bg-brick-dark light:bg-white ring-1 ring-brick-orange/20 light:ring-gray-200 backdrop-blur-sm">
      <div class="text-center space-y-1">
        <h1 class="typography-h1 text-brick-orange light:text-brick-orange">Brickcode</h1>
        <p class="typography-caption text-brick-offwhite/70 light:text-gray-600">Job Costing Platform</p>
      </div>
      <form class="space-y-6" @submit.prevent="onLogin">
        <div class="space-y-1">
          <label for="email" class="block typography-caption uppercase tracking-wide text-brick-offwhite/80 light:text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="username"
            required
            class="w-full px-3 py-2 mt-1 typography-body text-brick-offwhite light:text-gray-900 placeholder:text-brick-offwhite/40 light:placeholder:text-gray-500 bg-brick-dark/40 light:bg-white border border-brick-orange/40 light:border-gray-300 focus:border-brick-orange focus:ring-1 focus:ring-brick-orange rounded-md shadow-sm transition"
          />
        </div>
        <div class="space-y-1">
          <label for="password" class="block typography-caption uppercase tracking-wide text-brick-offwhite/80 light:text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full px-3 py-2 mt-1 typography-body text-brick-offwhite light:text-gray-900 placeholder:text-brick-offwhite/40 light:placeholder:text-gray-500 bg-brick-dark/40 light:bg-white border border-brick-orange/40 light:border-gray-300 focus:border-brick-orange focus:ring-1 focus:ring-brick-orange rounded-md shadow-sm transition"
          />
        </div>
        <div class="space-y-3 pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 typography-body font-semibold tracking-wide text-brick-offwhite bg-gradient-to-r from-brick-orange to-brick-red hover:from-brick-orange/90 hover:to-brick-red/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brick-yellow focus:ring-offset-2 focus:ring-offset-brick-dark transition"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Log in</span>
          </button>

          <!-- Demo Login Button -->
          <button
            id="demo-credentials-btn"
            type="button"
            @click="fillDemoCredentials"
            class="w-full px-4 py-2 typography-caption font-medium text-brick-orange dark:text-brick-orange bg-brick-orange/10 dark:bg-brick-orange/20 hover:bg-brick-orange/20 dark:hover:bg-brick-orange/30 border border-brick-orange/30 dark:border-brick-orange/40 rounded-md transition"
          >
            Use demo credentials
          </button>
        </div>

        <!-- Show error if exists -->
        <div v-if="error" class="p-3 typography-caption text-brick-red bg-brick-red-100 dark:text-brick-red-200 dark:bg-brick-red/20 rounded-md">
          Login error. Please check your credentials.
        </div>
      </form>
      
      <div class="text-center space-y-2">
        <p class="typography-caption text-gray-500 dark:text-brick-offwhite/40">
          Demo: <span class="font-mono text-brick-orange">juan.admin@brickcode.com / admin123</span>
        </p>
        <p class="typography-caption text-gray-500 dark:text-brick-offwhite/40">© {{ new Date().getFullYear() }} Brickcode</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const { login, loading, error } = useAuth();

const onLogin = async () => {
  await login(email.value, password.value);
};

const fillDemoCredentials = () => {
  email.value = 'juan.admin@brickcode.com';
  password.value = 'admin123';
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
