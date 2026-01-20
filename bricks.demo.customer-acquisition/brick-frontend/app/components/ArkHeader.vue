<style>
    :root {
        --ui-border: var(--ui-color-primary-500);
    }
</style>

<template>
    <UHeader title="Brickcode">
        <template #right>
            <nav class="flex items-center gap-2 sm:gap-4">
                <NuxtLink 
                    to="/dashboard" 
                    class="px-2 py-1 sm:px-0 sm:py-0 typography-caption font-medium text-gray-700 hover:text-brick-orange dark:text-brick-offwhite/80 dark:hover:text-brick-orange transition-colors rounded sm:rounded-none hover:bg-gray-100 dark:hover:bg-brick-orange/10 sm:hover:bg-transparent"
                >
                    Dashboard
                </NuxtLink>
                <NuxtLink
                    to="/projects"
                    class="px-2 py-1 sm:px-0 sm:py-0 typography-caption font-medium text-gray-700 hover:text-brick-orange dark:text-brick-offwhite/80 dark:hover:text-brick-orange transition-colors rounded sm:rounded-none hover:bg-gray-100 dark:hover:bg-brick-orange/10 sm:hover:bg-transparent"
                >
                    Projects
                </NuxtLink>
                <!-- Toggle de tema -->
                <ThemeToggle />
                
                <!-- Información del usuario -->
                <ClientOnly>
                    <div v-if="!userLoading && currentUser" class="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <div class="flex flex-col text-right">
                            <span class="text-xs font-medium text-gray-800 dark:text-gray-200">
                                {{ getUserDisplayName() }}
                            </span>
                            <span class="text-xs text-gray-600 dark:text-gray-400">
                                {{ getUserRole() }}
                            </span>
                        </div>
                        <div class="w-8 h-8 bg-brick-orange rounded-full flex items-center justify-center">
                            <span class="text-xs font-bold text-white">
                                {{ getUserDisplayName().charAt(0).toUpperCase() }}
                            </span>
                        </div>
                    </div>

                    <!-- Versión móvil - solo iniciales -->
                    <div v-if="!userLoading && currentUser" class="sm:hidden flex items-center">
                        <div class="w-7 h-7 bg-brick-orange rounded-full flex items-center justify-center">
                            <span class="text-xs font-bold text-white">
                                {{ getUserDisplayName().charAt(0).toUpperCase() }}
                            </span>
                        </div>
                    </div>
                </ClientOnly>
                
                <!-- Sign Out Button -->
                <button
                    @click="handleLogout"
                    class="px-2 py-1 sm:px-3 sm:py-1.5 typography-caption font-medium text-brick-offwhite bg-brick-red hover:bg-brick-red-400 dark:bg-brick-red dark:hover:bg-brick-red-400 transition-colors rounded-md flex items-center gap-1 sm:gap-2"
                    title="Logout"
                >
                    <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="hidden sm:inline">Logout</span>
                </button>
            </nav>
        </template>
    </UHeader>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { logout, currentUser, userLoading } = useAuth();

const handleLogout = () => {
    logout();
};

const getUserDisplayName = () => {
    if (!currentUser.value) return '';
    return currentUser.value.employee?.name || currentUser.value.username || currentUser.value.email;
};

const getUserRole = () => {
    if (!currentUser.value?.employee?.role) return '';
    const role = currentUser.value.employee.role;
    const roleMap: Record<string, string> = {
        'ADMIN': 'Administrator',
        'MANAGER': 'Manager',
        'EMPLOYEE': 'Employee'
    };
    return roleMap[role] || role;
};
</script>