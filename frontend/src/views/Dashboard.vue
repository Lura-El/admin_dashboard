<script setup>
    import HeadNavbar from '@/components/Header.vue';
    import Sidebar from '@/components/Sidebar.vue';
    import { RouterView } from 'vue-router'

</script>

<template>
    <HeadNavbar/>
    <div class="flex h-[calc(100vh-64px)]">
        <Sidebar/>
        <main class="flex-1 w-full overflow-auto pt-16 md:pt-0">  
           hello
        </main>
    </div>
</template>


