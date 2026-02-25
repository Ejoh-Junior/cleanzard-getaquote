<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-spartan font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    ]"
    v-bind="$attrs"
  >
    <!-- Spinner -->
    <svg v-if="loading" class="animate-spin -ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>

    <slot />
  </button>
</template>

<script setup>
// defineProps({
//   type: { type: String, default: 'button' },
//   disabled: { type: Boolean, default: false },
//   loading: { type: Boolean, default: false },
//   size: { type: String, default: 'md' }, // sm | md | lg
//   variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
// })

import { computed } from 'vue'
const props = defineProps({
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'primary' },
})

const sizeClasses = computed(() => ({
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}[props.size] || 'px-6 py-3 text-base'))

const variantClasses = computed(() => ({
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-md hover:shadow-lg',
  secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary-50 active:scale-[0.98]',
  ghost: 'bg-transparent text-primary hover:bg-primary-50 active:scale-[0.98]',
  danger: 'bg-error text-white hover:bg-red-600 active:scale-[0.98]',
}[props.variant] || ''))
</script>
