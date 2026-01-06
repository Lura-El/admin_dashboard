<script setup>
    import { RouterView } from 'vue-router';
</script>

<template>
   <div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div>
    <h1 class="text-3xl font-semibold text-gray-800 mb-6">
      Welcome to <span class="text-green-700">My Company</span> Admin Page
    </h1>
    <RouterView />
  </div>
</div>


    
</template>


