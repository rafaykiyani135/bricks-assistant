<template>
  <div class="min-h-screen flex flex-col bg-brick-dark light:bg-brick-offwhite typography-body text-brick-offwhite light:text-gray-900">
    <ArkHeader v-if="$route.path !== '/login'" />
    <div class="flex-1 overflow-x-hidden">
      <slot />
    </div>
  </div>
</template>

<style>
/* Mobile-specific optimizations */
@media (max-width: 640px) {
  /* Prevent horizontal scroll on small screens */
  html, body {
    overflow-x: hidden;
  }
  
  /* Ensure text doesn't break layout */
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Better touch targets */
  button, select, input {
    min-height: 44px;
  }
  
  /* Prevent zoom on input focus (iOS) */
  input, select, textarea {
    font-size: 16px;
  }
}

/* Print optimizations */
@media print {
  .print:hidden {
    display: none !important;
  }
  
  body {
    background: white !important;
    color: black !important;
  }
}
</style>
