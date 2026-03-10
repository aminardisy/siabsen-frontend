<template>
  <router-link
    :to="to"
    :class="[
      'flex items-center my-1 transition-all duration-200 group rounded-xl relative',
      isCollapsed ? 'mx-3 px-0 justify-center py-3' : 'mx-4 px-4 py-3',
      active ? 'bg-[#26A69A] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-slate-800'
    ]"
    :title="isCollapsed ? label : ''"
  >
    <span :class="['flex-shrink-0 transition-all duration-300', isCollapsed ? '' : 'mr-3']">
      <slot name="icon"></slot>
    </span>

    <span
      v-if="!isCollapsed"
      class="font-medium text-sm tracking-wide font-inter whitespace-nowrap overflow-hidden transition-all duration-300"
    >
      {{ label }}
    </span>

    <div v-if="isCollapsed && active" class="absolute right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  active: boolean;
  isCollapsed: boolean;
}>()
</script>
