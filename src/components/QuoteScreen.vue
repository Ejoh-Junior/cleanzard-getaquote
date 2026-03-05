<template>
  <div class="space-y-6">

    <!-- ── Quote header ─────────────────────────────────────────────────────── -->
    <div class="card text-center">
      <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h2 class="font-spartan font-bold text-2xl text-slate-800 mb-1">Your Quote is Ready!</h2>
      <p class="text-slate-500 font-spartan text-sm">
        Quote <span class="font-bold text-primary">{{ quoteResponse?.quoteId }}</span> has been created.
      </p>
      <p class="text-xs text-slate-400 font-spartan mt-1">Check your email — a copy was sent to {{ fd.email }}</p>

      <!-- V2: "Quote Saved" badge for returning users -->
      <div v-if="isReturningUser" class="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-spartan font-semibold">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Quote Saved — Welcome back!
      </div>
    </div>

    <!-- ── Quote breakdown card ──────────────────────────────────────────────── -->
    <div class="card">
      <h3 class="font-spartan font-bold text-slate-700 text-base mb-4 flex items-center gap-2">
        <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Pricing Breakdown
      </h3>

      <!-- V2: Returning users won't have a breakdown object (not stored in sheet).
           Show just the total in that case. -->
      <template v-if="hasBreakdown">
        <div class="space-y-2 mb-4">
          <div v-for="(val, key) in breakdown" :key="key" class="flex justify-between text-sm font-spartan">
            <span class="text-slate-500 capitalize font-medium">{{ formatKey(key) }}</span>
            <span class="font-semibold text-slate-700">${{ Number(val).toFixed(2) }}</span>
          </div>
        </div>
      </template>

      <div class="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
        <span class="font-spartan font-bold text-slate-700">Total</span>
        <span class="font-spartan font-bold text-2xl text-primary">${{ Number(quoteResponse?.total || 0).toFixed(2) }}</span>
      </div>

      <p class="text-xs text-slate-400 font-spartan text-center mt-3">Tax is not included and will not be charged.</p>
    </div>

    <!-- ── V2: Returning user – arrival already confirmed, show Pay section ── -->
    <template v-if="isReturningUser && bookingData.arrivalWindow">
      <div class="card border-2 border-primary/30 bg-primary/5">
        <div class="flex items-start gap-3 mb-4">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-spartan font-bold text-slate-700 text-base">Complete Your Payment</h3>
            <p class="text-sm text-slate-500 font-spartan mt-0.5">
              Your booking is confirmed for <span class="font-semibold text-slate-700">{{ bookingData.arrivalWindow }}</span> on <span class="font-semibold text-slate-700">{{ formattedDate }}</span>.
              One step left — complete your payment to lock it in.
            </p>
          </div>
        </div>

        <ButtonPrimary
          size="lg"
          class="w-full"
          @click="$emit('pay-now')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Pay Now – ${{ Number(quoteResponse?.total || 0).toFixed(2) }}
        </ButtonPrimary>

        <p class="text-xs text-slate-400 font-spartan text-center mt-2">Opens secure payment in a new tab.</p>
      </div>
    </template>

    <!-- ── Arrival window selection (new users OR returning without window) ── -->
    <template v-else>
      <div class="card" id="section-arrival">
        <h3 class="font-spartan font-bold text-slate-700 text-base mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Select Arrival Window
        </h3>
        <p class="text-sm text-slate-500 font-spartan mb-3">When should our team arrive on {{ formattedDate }}?</p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            v-for="window in arrivalWindows"
            :key="window"
            type="button"
            @click="bookingData.arrivalWindow = window"
            :class="[
              'px-3 py-3 rounded-xl border-2 text-sm font-spartan font-semibold text-center transition-all duration-150',
              bookingData.arrivalWindow === window
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40'
            ]"
          >{{ window }}</button>
        </div>
        <p v-if="errors.arrivalWindow" class="text-error text-xs font-spartan">{{ errors.arrivalWindow }}</p>
      </div>
    </template>

    <!-- ── Booking summary ───────────────────────────────────────────────────── -->
    <div class="card bg-primary/5 border border-primary/20">
      <h4 class="font-spartan font-bold text-primary text-sm mb-3">Booking Summary</h4>
      <div class="grid grid-cols-2 gap-2 text-sm font-spartan">
        <div>
          <p class="text-slate-400 text-xs font-medium">Property</p>
          <p class="font-semibold text-slate-700 capitalize">{{ fd.propertyType }}</p>
        </div>
        <div>
          <p class="text-slate-400 text-xs font-medium">Service</p>
          <p class="font-semibold text-slate-700">{{ cleaningTypeLabel }}</p>
        </div>
        <div>
          <p class="text-slate-400 text-xs font-medium">Date</p>
          <p class="font-semibold text-slate-700">{{ formattedDate }}</p>
        </div>
        <div>
          <p class="text-slate-400 text-xs font-medium">Frequency</p>
          <p class="font-semibold text-slate-700 capitalize">{{ fd.frequency }}</p>
        </div>
        <div class="col-span-2">
          <p class="text-slate-400 text-xs font-medium">Address</p>
          <p class="font-semibold text-slate-700">{{ fd.address }}</p>
        </div>
      </div>
    </div>

    <!-- ── CTA buttons ───────────────────────────────────────────────────────── -->
    <!-- Only show Confirm & Pay for users who haven't selected arrival yet -->
    <div v-if="!(isReturningUser && bookingData.arrivalWindow)" class="flex flex-col sm:flex-row gap-3">
      <ButtonPrimary
        size="lg"
        class="flex-1"
        :loading="isConfirming"
        :disabled="!bookingData.arrivalWindow"
        @click="$emit('confirm-booking')"
      >
        Confirm & Pay
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      </ButtonPrimary>

      <ButtonPrimary
        size="lg"
        variant="secondary"
        class="flex-1 sm:flex-none"
        @click="$emit('back')"
      >
        Edit Quote
      </ButtonPrimary>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import ButtonPrimary from './ui/ButtonPrimary.vue'
import { useQuoteState } from '../composables/useQuoteState.js'

defineEmits(['confirm-booking', 'pay-now', 'back'])

defineProps({
  isConfirming: { type: Boolean, default: false },
  // V2: true when the user arrived via a ?quoteId= link from their email
  isReturningUser: { type: Boolean, default: false },
})

const { quoteState } = useQuoteState()
const fd = quoteState.formData
const errors = quoteState.errors
const bookingData = quoteState.bookingData
const quoteResponse = computed(() => quoteState.quoteResponse)

const breakdown = computed(() => {
  const br = quoteResponse.value?.breakdown || {}
  // Filter out zero values and internal keys
  return Object.fromEntries(Object.entries(br).filter(([_, v]) => Number(v) > 0))
})

// V2: Only show breakdown table if there are line items (new users only)
const hasBreakdown = computed(() => Object.keys(breakdown.value).length > 0)

const arrivalWindows = [
  '8AM – 10AM',
  '10AM – 12PM',
  '12PM – 2PM',
  '2PM – 4PM',
  '4PM – 6PM',
  '6PM – 8PM',
  'Flexible',
  'Anytime',
]

const formattedDate = computed(() => {
  if (!fd.serviceDate) return ''
  const [y, m, d] = fd.serviceDate.split('-')
  return `${d}/${m}/${y}`
})

const cleaningTypeLabel = computed(() => ({
  regular: 'Regular Cleaning',
  deep: 'Deep Cleaning',
  move: 'Move In/Move Out',
}[fd.cleaningType] || fd.cleaningType))

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
}
</script>
