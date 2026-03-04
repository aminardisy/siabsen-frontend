<script setup>
import Sidebar from './components/layout/Sidebar.vue'
</script>
<template>
  <div class="flex">
    <Sidebar />
    <main class="ml-64 p-8 w-full"> <router-view />
    </main>
  </div>
</template>
