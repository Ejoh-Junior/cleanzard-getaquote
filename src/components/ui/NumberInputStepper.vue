<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      @click="decrement"
      :disabled="modelValue <= min"
      class="w-9 h-9 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-lg
             hover:border-primary hover:text-primary hover:bg-primary-50
             disabled:opacity-40 disabled:cursor-not-allowed
             transition-all duration-150 flex items-center justify-center flex-shrink-0"
      :aria-label="`Decrease ${label}`"
    >−</button>

    <div class="w-14 h-9 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center">
      <span class="font-spartan font-bold text-slate-800 text-base">{{ modelValue }}</span>
    </div>

    <button
      type="button"
      @click="increment"
      :disabled="modelValue >= max"
      class="w-9 h-9 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-lg
             hover:border-primary hover:text-primary hover:bg-primary-50
             disabled:opacity-40 disabled:cursor-not-allowed
             transition-all duration-150 flex items-center justify-center flex-shrink-0"
      :aria-label="`Increase ${label}`"
    >+</button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 8 },
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function increment() {
  if (props.modelValue < props.max) emit('update:modelValue', props.modelValue + 1)
}
function decrement() {
  if (props.modelValue > props.min) emit('update:modelValue', props.modelValue - 1)
}
</script>
