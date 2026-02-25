<template>
  <div class="card sticky top-4">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
      <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
        </svg>
      </div>
      <h3 class="font-spartan font-bold text-slate-800 text-base">Estimate Summary</h3>
    </div>

    <!-- Progress Bar -->
    <div class="mb-5">
      <ProgressBar :done="progress.done" :total="progress.total" />
    </div>

    <!-- Breakdown (residential only) -->
    <template v-if="isResidential">
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-500 font-medium">Base Cleaning</span>
          <span class="font-semibold text-slate-700">${{ fmt(estimate.basePrice) }}</span>
        </div>
        <div v-if="(estimate.bedroomCost || 0) > 0" class="flex justify-between text-sm font-spartan">
          <span class="text-slate-500 font-medium">Extra Bedrooms</span>
          <span class="font-semibold text-slate-700">+${{ fmt(estimate.bedroomCost) }}</span>
        </div>
        <div v-if="(estimate.bathroomCost || 0) > 0" class="flex justify-between text-sm font-spartan">
          <span class="text-slate-500 font-medium">Extra Bathrooms</span>
          <span class="font-semibold text-slate-700">+${{ fmt(estimate.bathroomCost) }}</span>
        </div>
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-500 font-medium">Extras</span>
          <span class="font-semibold text-slate-700">
            {{ estimate.addonsTotal > 0 || estimate.petsTotal > 0 ? `+$${fmt((estimate.addonsTotal || 0) + (estimate.petsTotal || 0))}` : '$0.00' }}
          </span>
        </div>
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-500 font-medium">Discount</span>
          <span class="font-semibold text-slate-700">-$0.00</span>
        </div>
      </div>

      <div class="border-t border-dashed border-slate-200 pt-4 mb-4">
        <div class="flex justify-between items-end">
          <div>
            <p class="text-xs text-slate-400 font-spartan font-medium">Total Estimate</p>
            <p class="text-3xl font-bold text-primary font-spartan">${{ fmt(estimate.total) }}</p>
          </div>
          <div v-if="(estimate.estimatedHours || 0) > 0" class="text-right">
            <p class="text-xs text-slate-400 font-spartan">~{{ estimate.estimatedHours }}h</p>
          </div>
        </div>
      </div>

      <!-- Tax notice -->
      <p class="text-xs text-slate-400 font-spartan text-center mb-4 px-2 leading-relaxed">
        Tax is not included and will not be charged.
      </p>

      <!-- CTA Button -->
      <ButtonPrimary
        size="lg"
        class="w-full"
        :disabled="!canSubmit"
        :loading="isSubmitting"
        @click="$emit('submit')"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        Get My Quote
      </ButtonPrimary>
    </template>

    <!-- Commercial placeholder -->
    <template v-else-if="isCommercial">
      <div class="text-center py-4">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <p class="font-spartan font-semibold text-slate-700 text-sm mb-1">Commercial Cleaning</p>
        <p class="text-xs text-slate-400 font-spartan">Custom pricing — we'll contact you with a tailored quote.</p>
      </div>

      <ButtonPrimary
        size="lg"
        class="w-full mt-4"
        :disabled="!canSubmit"
        :loading="isSubmitting"
        @click="$emit('submit')"
      >
        Submit Request
      </ButtonPrimary>
    </template>

    <!-- No property selected yet -->
    <template v-else>
      <div class="text-center py-6">
        <p class="text-sm text-slate-400 font-spartan">Select a property type to see your estimate.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import ProgressBar from './ProgressBar.vue'
import ButtonPrimary from './ui/ButtonPrimary.vue'
import { computed } from 'vue'
import { useQuoteState } from '../composables/useQuoteState.js'
import { usePricing } from '../composables/usePricing.js'

defineEmits(['submit'])

const props = defineProps({
  canSubmit: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
})

const { quoteState, progress } = useQuoteState()
const { estimate } = usePricing()

const isResidential = computed(() =>
  quoteState.formData.propertyType === 'house' || quoteState.formData.propertyType === 'condo'
)
const isCommercial = computed(() => quoteState.formData.propertyType === 'commercial')

function fmt(val) {
  return (val || 0).toFixed(2)
}
</script>
