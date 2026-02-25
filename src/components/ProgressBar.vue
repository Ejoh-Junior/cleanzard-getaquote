<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-1.5">
      <span class="text-xs font-semibold text-slate-500 font-spartan">
        Progress
      </span>
      <span class="text-xs font-bold text-primary font-spartan">
        {{ done }}/{{ total }} Sections Completed
      </span>
    </div>
    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-primary to-accent rounded-full progress-bar-fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  done: { type: Number, default: 0 },
  total: { type: Number, default: 1 },
})

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.done / props.total) * 100) : 0
)
</script>
