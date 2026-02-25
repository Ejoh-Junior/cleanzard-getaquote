<template>
  <div class="min-h-[50vh] flex flex-col items-center justify-center py-12 text-center">
    <!-- Animated checkmark -->
    <div class="relative w-24 h-24 mb-6">
      <div class="absolute inset-0 rounded-full bg-green-50 animate-ping opacity-20"></div>
      <div class="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
        <svg class="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
    </div>

    <h2 class="font-spartan font-bold text-3xl text-slate-800 mb-2">Booking Confirmed! 🎉</h2>
    <p class="text-slate-500 font-spartan text-base mb-1">
      Thank you, <span class="font-bold text-slate-700">{{ fd.firstName }}</span>!
    </p>
    <p class="text-slate-400 font-spartan text-sm mb-6 max-w-md">
      Your booking <span class="font-bold text-primary">{{ quoteId }}</span> is confirmed.
      A receipt has been sent to <span class="font-semibold">{{ fd.email }}</span>.
    </p>

    <!-- Summary chips -->
    <div class="flex flex-wrap gap-2 justify-center mb-8">
      <div class="px-4 py-2 bg-primary/10 rounded-xl text-primary font-spartan font-semibold text-sm">
        {{ cleaningTypeLabel }}
      </div>
      <div class="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-spartan font-semibold text-sm">
        📅 {{ formattedDate }}
      </div>
      <div class="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-spartan font-semibold text-sm">
        ⏰ {{ bookingData.arrivalWindow }}
      </div>
    </div>

    <!-- What's next -->
    <div class="card max-w-md w-full text-left mb-6">
      <h4 class="font-spartan font-bold text-slate-700 text-sm mb-3">What happens next?</h4>
      <ol class="space-y-2">
        <li v-for="(step, i) in nextSteps" :key="i" class="flex items-start gap-3 text-sm font-spartan text-slate-600">
          <span class="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{{ i + 1 }}</span>
          {{ step }}
        </li>
      </ol>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3">
      <ButtonPrimary size="lg" @click="$emit('new-quote')" variant="secondary">
        Get Another Quote
      </ButtonPrimary>
      <a
        href="https://cleanzard.ca"
        target="_blank"
        class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-spartan font-bold rounded-xl text-base hover:bg-primary-dark transition-colors"
      >
        Visit Cleanzard.ca
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ButtonPrimary from './ui/ButtonPrimary.vue'
import { useQuoteState } from '../composables/useQuoteState.js'

defineEmits(['new-quote'])

const { quoteState } = useQuoteState()
const fd = quoteState.formData
const bookingData = quoteState.bookingData
const quoteId = computed(() => quoteState.quoteResponse?.quoteId || '')

const formattedDate = computed(() => {
  if (!fd.serviceDate) return ''
  const [y, m, d] = fd.serviceDate.split('-')
  return `${d}/${m}/${y}`
})

const cleaningTypeLabel = computed(() => ({
  regular: 'Regular Cleaning',
  deep: 'Deep Cleaning',
  move: 'Move In/Move Out',
}[fd.cleaningType] || fd.cleaningType || 'Cleaning Service'))

const nextSteps = [
  'You\'ll receive a confirmation email with all the details.',
  'Our team will reach out 24h before your appointment.',
  'On the day, your cleaner will arrive in your selected window.',
  'After the service, you\'ll get a satisfaction survey.',
]
</script>
