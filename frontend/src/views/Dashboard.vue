<script setup>
    import HeadNavbar from '@/components/Header.vue';
    import Sidebar from '@/components/Sidebar.vue';
    import { RouterView } from 'vue-router'

</script>

<template>
    <HeadNavbar/>
    <div class="flex">
        <Sidebar/>
        <main>
            
            <RouterView/>
        </main>

    </div>
</template>


