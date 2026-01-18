<script lang="ts">
    export default {
        props: {
            isLoggedIn: {
                type: Boolean,
                default: false,
                required: true
            },
        }
    }
</script>

<template>
    <UHeader :toggle="false">
        <template #title>
            <img src="/images/k.svg" class="size-6 text hover:opacity-60 transition-opacity ease-in"  />
        </template>
         <BrkLogo kColor="var(--color-brand-primary)" class="h-6" />
        <template #right>
            <button type="button" class="size-5">
                    <UIcon v-if="isLoggedIn" class="size-5" name="i-lucide-log-out" />
                    <UIcon v-else class="size-5" name="i-lucide-log-in" />
            </button>
        </template>
    </UHeader>
</template>

<style>
    :root {
        .border-b {
            border-bottom-width: 3px;
        }
    }
</style>