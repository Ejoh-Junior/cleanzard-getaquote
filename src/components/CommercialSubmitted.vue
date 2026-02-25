<template>
  <div class="min-h-[40vh] flex flex-col items-center justify-center py-12 text-center">
    <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
      <svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>

    <h2 class="font-spartan font-bold text-2xl text-slate-800 mb-2">Request Received!</h2>
    <p class="text-slate-500 font-spartan text-sm mb-2">
      Thanks, <span class="font-bold text-slate-700">{{ fd.firstName }}</span>! We've received your commercial cleaning inquiry.
    </p>
    <p class="text-slate-400 font-spartan text-sm mb-6 max-w-sm">
      Our team will review your request and contact you during your preferred time:
      <span class="font-semibold text-slate-600">{{ callbackLabel }}</span>.
    </p>

    <div class="card max-w-sm w-full text-left mb-6">
      <div class="space-y-2">
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-400">Business</span>
          <span class="font-semibold text-slate-700">{{ fd.businessName }}</span>
        </div>
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-400">Email</span>
          <span class="font-semibold text-slate-700">{{ fd.email }}</span>
        </div>
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-400">Phone</span>
          <span class="font-semibold text-slate-700">{{ fd.phone }}</span>
        </div>
        <div class="flex justify-between text-sm font-spartan">
          <span class="text-slate-400">Language</span>
          <span class="font-semibold text-slate-700 capitalize">{{ fd.preferredLanguage }}</span>
        </div>
      </div>
    </div>

    <ButtonPrimary size="lg" @click="$emit('new-quote')" variant="secondary">
      Start a New Request
    </ButtonPrimary>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ButtonPrimary from './ui/ButtonPrimary.vue'
import { useQuoteState } from '../composables/useQuoteState.js'

defineEmits(['new-quote'])

const { quoteState } = useQuoteState()
const fd = quoteState.formData

const callbackLabel = computed(() => ({
  morning: 'Morning (8AM – 12PM)',
  afternoon: 'Afternoon (12PM – 5PM)',
  evening: 'Evening (5PM – 8PM)',
  anytime: 'Anytime',
}[fd.preferredCallbackTime] || fd.preferredCallbackTime))
</script>
