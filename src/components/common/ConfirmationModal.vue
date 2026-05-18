<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
        @click="$emit('close')"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out transform"
          enter-from-class="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div
            class="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 text-left"
            @click.stop
          >
            <div class="flex items-start gap-4">
              <div
                :class="[
                  'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                  variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                ]"
              >
                <svg v-if="variant === 'danger'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div class="flex-1">
                <h3 class="text-lg font-black text-[#1A2342] leading-6">
                  {{ title }}
                </h3>
                <p class="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                  {{ message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5">
              <button
                type="button"
                @click="$emit('close')"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all focus:outline-none"
              >
                {{ cancelText }}
              </button>

              <button
                type="button"
                @click="$emit('confirm')"
                :class="[
                  'w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md active:scale-95 transition-all focus:outline-none',
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-100'
                    : 'bg-[#1A2342] hover:bg-slate-800 shadow-slate-100'
                ]"
              >
                {{ confirmText }}
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'warning' | 'danger'
  }>(),
  {
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'warning'
  }
)

// Definisi event trigger balik ke komponen induk
defineEmits(['close', 'confirm'])
</script>
