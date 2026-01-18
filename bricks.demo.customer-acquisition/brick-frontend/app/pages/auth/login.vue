<template>
  <div class="flex min-h-[inherit] items-center justify-center px-4">
    <div class="w-full max-w-sm space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Brickcode
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Sign in to continue</p>
      </div>

      <UButton
        block
        size="lg"
        icon="i-simple-icons-google"
        label="Sign in with Google"
        @click="login"
      />
    </div>
  </div>
</template>

<script setup>
  const login = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };
</script>
