<script setup lang="ts">
const modelValue = defineModel<string>()

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <div class="relative w-full max-w-md">
    <span class="absolute left-3 top-2.5 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </span>

    <input
      v-model="modelValue"
      type="text"
      :placeholder="placeholder || 'Cari data...'"
      class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#26A69A] focus:border-transparent transition-all font-inter text-sm shadow-sm"
    />
  </div>
</template>
