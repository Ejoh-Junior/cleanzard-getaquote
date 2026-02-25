<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      @click="toggle(option.value)"
      :class="[
        'flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 font-spartan font-semibold text-sm transition-all duration-150',
        isSelected(option.value)
          ? 'bg-primary border-primary text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary',
      ]"
    >
      <!-- Checkmark icon when selected -->
      <svg v-if="isSelected(option.value)" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span v-if="option.icon" class="text-base">{{ option.icon }}</span>
      {{ option.label }}
      <span v-if="option.price" class="opacity-75 text-xs">+${{ option.price }}</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: {
    type: Array,
    required: true,
    // [{ value: string, label: string, price?: number, icon?: string }]
  },
})
const emit = defineEmits(['update:modelValue'])

function isSelected(val) {
  return props.modelValue.includes(val)
}

function toggle(val) {
  const current = [...props.modelValue]
  const idx = current.indexOf(val)
  if (idx === -1) current.push(val)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}
</script>
