<template>
    <header class="flex items-center justify-between bg-white shadow px-6 py-4">
        <!-- Left: Company Logo -->
        <div class="flex items-center gap-3">
            <img src="@/assets/logo.svg" alt="Company Logo" class="w-10 h-10 rounded" />
            <span class="text-lg font-semibold text-gray-800">MyCompany</span>
        </div>

        <!-- Right: User Info -->
        <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium">Admin</span>
            <img src="@/assets/profile_avatar.png" alt="User Avatar" class="w-10 h-10 rounded-full border" />
        </div>
    </header>
</template>