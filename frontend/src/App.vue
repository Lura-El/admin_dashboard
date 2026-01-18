<script setup>
    import { RouterView } from 'vue-router';
    import { useAuthStore } from './stores/authStore';
    import { onMounted } from 'vue';

    const auth = useAuthStore();
    
    onMounted(() => {
        // Restore user from localStorage first
        auth.restoreUser();
        // Then fetch fresh user data from server to verify session
        auth.fetchUser();
    });
</script>

<template>
    <div>
        <RouterView />  
    </div>
</template>


