<script setup>
import { RouterLink } from 'vue-router';
import { ref } from 'vue';

const isOpen = ref(false);

const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
};

</script>

<template>
    <!-- Hamburger Button (visible on small screens) -->
    <button
        @click="toggleSidebar"
        class="fixed left-4 z-50 md:hidden rounded-lg hover:bg-gray-300 transition"
        aria-label="Toggle sidebar"
    >
        <svg
            v-if="!isOpen"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>

    <!-- Sidebar -->
    <nav
        :class="[
            'fixed md:static md:translate-x-0 transition-transform duration-300 z-40',
            'w-64 h-screen bg-gray-100 shadow-md',
            isOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
    >

        <div class="flex flex-col gap-6 p-6">
            <h2 class="text-xl font-semibold text-gray-800">Admin Panel</h2>

            <ul class="flex flex-col gap-4 text-gray-700">
            <li>
                <RouterLink to="/dashboard" class="flex items-center gap-3 hover:text-blue-600 transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"></path>
                </svg>
                Dashboard
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/users" class="flex items-center gap-3 hover:text-blue-600 transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.121 17.804A4 4 0 0112 14h0a4 4 0 016.879 3.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Users
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/reports" class="flex items-center gap-3 hover:text-blue-600 transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 17h6"></path>
                </svg>
                Reports
                </RouterLink>
            </li>
            <li>
                <a class="flex items-center gap-3 hover:text-red-600 transition">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
                </svg>
                Logout
                </a>
            </li>
            </ul>
        </div>
    </nav>
</template>
