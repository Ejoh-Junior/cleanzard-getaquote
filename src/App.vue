<template>
  <div class="min-h-screen font-spartan">
    <!-- App Header removed
    <header class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
         
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div>
            <p class="font-spartan font-bold text-primary text-base leading-none">Cleanzard</p>
            <p class="text-xs text-slate-400 font-medium leading-none mt-0.5">Cleaning Services</p>
          </div>
        </div>

         
        <div class="flex items-center gap-2">
          <span
            v-if="quoteState.appState !== 'FORM'"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-spartan bg-primary/10 text-primary"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {{ stateBadge }}
          </span>
          <span class="text-sm font-spartan font-semibold text-primary">Get a Quote</span>
        </div>
      </div>
    </header> -->

    <!-- Error Banner -->
    <Transition name="fade">
      <div v-if="globalError" class="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div class="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-error">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="font-spartan text-sm font-semibold">{{ globalError }}</p>
          <button @click="globalError = ''" class="ml-auto text-red-400 hover:text-error">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main Layout -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6">

      <!-- ── FORM state ── -->
      <div v-if="isFormState" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Form (2/3 width) -->
        <div class="lg:col-span-2">
          <QuoteForm />

          <!-- Mobile-only submit button (below form, above summary) -->
          <div class="lg:hidden mt-6">
            <SummaryPanel
              :can-submit="canSubmit"
              :is-submitting="isSubmitting"
              @submit="handleSubmit"
            />
          </div>
        </div>

        <!-- Right: Summary Panel (1/3 width, sticky) – desktop only -->
        <div class="hidden lg:block">
          <SummaryPanel
            :can-submit="canSubmit"
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
          />
        </div>
      </div>

      <!-- ── SUBMITTING state ── -->
      <div v-else-if="quoteState.appState === 'SUBMITTING'" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p class="font-spartan font-semibold text-slate-600">Calculating your quote…</p>
      </div>

      <!-- ── V2: LOADING state – hydrating a returning quote ── -->
      <div v-else-if="quoteState.appState === 'LOADING'" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p class="font-spartan font-semibold text-slate-600">Loading your quote…</p>
        <p class="text-sm text-slate-400 font-spartan mt-1">Just a moment.</p>
      </div>

      <!-- ── QUOTE_READY state ── -->
      <div v-else-if="quoteState.appState === 'QUOTE_READY'" class="max-w-2xl mx-auto">
        <QuoteScreen
          :is-confirming="isConfirming"
          :is-returning-user="isReturningUser"
          @confirm-booking="handleConfirmBooking"
          @pay-now="handlePayNow"
          @back="goBackToForm"
        />
      </div>

      <!-- ── PAYMENT_REDIRECT state ── -->
      <div v-else-if="quoteState.appState === 'PAYMENT_REDIRECT'" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p class="font-spartan font-semibold text-slate-600">Redirecting to payment…</p>
        <p class="text-sm text-slate-400 font-spartan mt-1">You'll be taken to our secure payment page.</p>
      </div>

      <!-- ── V2: WAITING_FOR_PAYMENT state – polling heartbeat active ── -->
      <div v-else-if="quoteState.appState === 'WAITING_FOR_PAYMENT'" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="relative w-20 h-20 mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div class="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <h3 class="font-spartan font-bold text-slate-700 text-lg mb-2">Waiting for payment…</h3>
        <p class="text-sm text-slate-400 font-spartan mb-1">Complete your payment in the tab that just opened.</p>
        <p class="text-xs text-slate-400 font-spartan">This page will update automatically once payment is confirmed.</p>

        <!-- Manual cancel / back option -->
        <button
          @click="cancelPolling"
          class="mt-6 text-sm text-slate-400 hover:text-primary font-spartan underline underline-offset-2 transition-colors"
        >
          ← Back to quote
        </button>
      </div>

      <!-- ── PAYMENT_SUCCESS state ── -->
      <div v-else-if="quoteState.appState === 'PAYMENT_SUCCESS'" class="max-w-2xl mx-auto">
        <SuccessScreen @new-quote="handleNewQuote" />
      </div>

      <!-- ── COMMERCIAL_SUBMITTED state ── -->
      <div v-else-if="quoteState.appState === 'COMMERCIAL_SUBMITTED'" class="max-w-2xl mx-auto">
        <CommercialSubmitted @new-quote="handleNewQuote" />
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import QuoteForm from './components/QuoteForm.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import QuoteScreen from './components/QuoteScreen.vue'
import SuccessScreen from './components/SuccessScreen.vue'
import CommercialSubmitted from './components/CommercialSubmitted.vue'

import { useQuoteState } from './composables/useQuoteState.js'
import { usePricing } from './composables/usePricing.js'
import { createQuote, confirmBooking, markPaid, submitCommercialLead, buildPaymentUrl, fetchQuote, checkStatus } from './services/api.js'

const { quoteState, setState, resetForm } = useQuoteState()
const { estimate } = usePricing()

const globalError = ref('')
const isSubmitting = ref(false)
const isConfirming = ref(false)

// ── V2: Returning user flag – set during quote hydration ──────────────────────
// true when the user arrived via a ?quoteId= link (e.g. from their email)
const isReturningUser = ref(false)

// ── V2: Polling interval reference ───────────────────────────────────────────
let pollInterval = null
const POLL_INTERVAL_MS = 4000 // 4 seconds

// ─── Derived state flags ──────────────────────────────────────────────────────
const isFormState = computed(() =>
  quoteState.appState === 'FORM' || quoteState.appState === 'SUBMITTING'
    ? quoteState.appState === 'FORM'
    : false
)

const stateBadge = computed(() => ({
  QUOTE_READY: 'Quote Ready',
  BOOKING_CONFIRM: 'Confirming…',
  PAYMENT_REDIRECT: 'Redirecting…',
  PAYMENT_SUCCESS: 'Paid ✓',
  COMMERCIAL_SUBMITTED: 'Request Sent',
  WAITING_FOR_PAYMENT: 'Awaiting Payment…',
  LOADING: 'Loading…',
}[quoteState.appState] || ''))

// Send height for autoadjustment of iframe implementation

const currentStep = ref(1)

function sendHeight() {
  const height = document.documentElement.scrollHeight
  parent.postMessage({ type: 'resize', height }, '*')
}

// window.addEventListener("load", sendHeight);
// window.addEventListener("resize", sendHeight);

// ─── Validation ───────────────────────────────────────────────────────────────
function validate() {
  const errors = {}
  const fd = quoteState.formData

  if (!fd.propertyType) {
    errors.propertyType = 'Please select a property type.'
  }

  if (fd.propertyType === 'commercial') {
    if (!fd.businessName?.trim()) errors.businessName = 'Business name is required.'
    if (!fd.preferredCallbackTime) errors.preferredCallbackTime = 'Please select a callback time.'
    if (!fd.firstName?.trim()) errors.firstName = 'First name is required.'
    if (!fd.lastName?.trim()) errors.lastName = 'Last name is required.'
    if (!fd.email?.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)) errors.email = 'Please enter a valid email.'
    if (!fd.phone?.trim()) errors.phone = 'Phone number is required.'
    else if (fd.phone.replace(/\D/g, '').length < 10) errors.phone = 'Please enter a valid phone number.'
  } else if (fd.propertyType === 'house' || fd.propertyType === 'condo') {
    if (!fd.serviceDate) errors.serviceDate = 'Please select a service date.'
    if (!fd.address?.trim()) errors.address = 'Service address is required.'
    if (!fd.firstName?.trim()) errors.firstName = 'First name is required.'
    if (!fd.lastName?.trim()) errors.lastName = 'Last name is required.'
    if (!fd.email?.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)) errors.email = 'Please enter a valid email.'
    if (!fd.phone?.trim()) errors.phone = 'Phone number is required.'
    else if (fd.phone.replace(/\D/g, '').length < 10) errors.phone = 'Please enter a valid phone number.'
  }

  quoteState.errors = errors
  return Object.keys(errors).length === 0
}

const canSubmit = computed(() => {
  const fd = quoteState.formData
  if (!fd.propertyType) return false
  if (fd.propertyType === 'commercial') {
    return !!(fd.businessName && fd.preferredCallbackTime && fd.firstName && fd.lastName && fd.email && fd.phone)
  }
  return !!(fd.serviceDate && fd.address && fd.firstName && fd.lastName && fd.email && fd.phone)
})

// ─── Scroll to first error ────────────────────────────────────────────────────
function scrollToFirstError() {
  const firstErrorEl = document.querySelector('.input-error, [data-error]')
  if (firstErrorEl) {
    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    firstErrorEl.focus?.()
  }
}

// ─── Form Submit Handler ──────────────────────────────────────────────────────
async function handleSubmit() {
  globalError.value = ''

  if (!validate()) {
    scrollToFirstError()
    return
  }

  isSubmitting.value = true
  setState('SUBMITTING')

  try {
    const fd = quoteState.formData

    if (fd.propertyType === 'commercial') {
      // Commercial: just submit lead, no pricing
      await submitCommercialLead({
        propertyType: 'commercial',
        businessName: fd.businessName,
        preferredLanguage: fd.preferredLanguage,
        preferredCallbackTime: fd.preferredCallbackTime,
        firstName: fd.firstName,
        lastName: fd.lastName,
        email: fd.email,
        phone: fd.phone,
        notes: fd.notes,
        attachmentFile: fd.attachmentFile,
      })
      setState('COMMERCIAL_SUBMITTED')
    } else {
      // Residential: create quote and get pricing from backend
      const response = await createQuote({
        propertyType: fd.propertyType,
        bedrooms: fd.bedrooms,
        bathrooms: fd.bathrooms,
        pets: fd.pets,
        cleaningType: fd.cleaningType,
        addons: fd.addons,
        frequency: fd.frequency,
        serviceDate: fd.serviceDate,
        address: fd.address,
        firstName: fd.firstName,
        lastName: fd.lastName,
        email: fd.email,
        phone: fd.phone,
        notes: fd.notes,
      })

      // Store backend-authoritative response
      quoteState.quoteResponse = {
        quoteId: response.quoteId,
        total: response.total,
        breakdown: response.breakdown,
      }

      setState('QUOTE_READY')
    }
  } catch (err) {
    globalError.value = err.message || 'Something went wrong. Please try again.'
    setState('FORM')
  } finally {
    isSubmitting.value = false
  }
}

// ─── Confirm Booking ──────────────────────────────────────────────────────────
// Called for NEW users who haven't selected arrival window yet
async function handleConfirmBooking() {
  if (!quoteState.bookingData.arrivalWindow) {
    quoteState.errors.arrivalWindow = 'Please select an arrival window.'
    return
  }

  globalError.value = ''
  isConfirming.value = true
  setState('BOOKING_CONFIRM')

  try {
    const { quoteId } = quoteState.quoteResponse
    await confirmBooking(quoteId, quoteState.bookingData.arrivalWindow)

    // V2: Open payment in new tab + start polling instead of redirecting
    const fd = quoteState.formData
    const payUrl = buildPaymentUrl(fd.firstName, fd.lastName, fd.email, quoteId)

    window.open(payUrl, '_blank')
    startPolling(quoteId)
    setState('WAITING_FOR_PAYMENT')
  } catch (err) {
    globalError.value = err.message || 'Could not confirm booking. Please try again.'
    setState('QUOTE_READY')
  } finally {
    isConfirming.value = false
  }
}

// ── V2: Pay Now – for returning users who already have an arrival window ──────
// Called from QuoteScreen when the user is returning and arrival is already set
function handlePayNow() {
  const fd = quoteState.formData
  const { quoteId } = quoteState.quoteResponse

  const payUrl = buildPaymentUrl(fd.firstName, fd.lastName, fd.email, quoteId)
  window.open(payUrl, '_blank')

  startPolling(quoteId)
  setState('WAITING_FOR_PAYMENT')
}

// ── V2: Polling heartbeat ─────────────────────────────────────────────────────
function startPolling(quoteId) {
  stopPolling() // clear any existing interval first

  pollInterval = setInterval(async () => {
    try {
      const result = await checkStatus(quoteId)
      if (result.paid === 'Yes') {
        stopPolling()
        setState('PAYMENT_SUCCESS')
        await nextTick()
        sendHeight()
      }
    } catch (err) {
      // Non-fatal – keep polling silently
      console.warn('Poll check failed (retrying):', err.message)
    }
  }, POLL_INTERVAL_MS)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function cancelPolling() {
  stopPolling()
  setState('QUOTE_READY')
}

// Ensure polling is cleaned up if the component unmounts
onUnmounted(() => stopPolling())

function goBackToForm() {
  quoteState.quoteResponse = null
  isReturningUser.value = false
  setState('FORM')
}

function handleNewQuote() {
  isReturningUser.value = false
  resetForm()
}

// ─── On Mount ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Dynamic height section
  const observer = new ResizeObserver(() => {
    sendHeight()
  })

  observer.observe(document.documentElement)
  sendHeight()
  // End of Dynamic height section

  const params = new URLSearchParams(window.location.search)

  // ── V2: Hydrate from ?quoteId= (returning user via email link) ────────────
  if (params.get('quoteId')) {
    const quoteId = params.get('quoteId')
    setState('LOADING')

    try {
      const data = await fetchQuote(quoteId)

      // Hydrate formData so QuoteScreen / SuccessScreen render correctly
      quoteState.formData.firstName    = data.firstName || ''
      quoteState.formData.lastName     = data.lastName || ''
      quoteState.formData.email        = data.email || ''
      quoteState.formData.phone        = data.phone || ''
      quoteState.formData.address      = data.address || ''
      quoteState.formData.propertyType = data.propertyType || ''
      quoteState.formData.cleaningType = data.cleaningType || 'regular'
      quoteState.formData.frequency    = data.frequency || 'one-time'
      quoteState.formData.serviceDate  = data.serviceDate || ''
      quoteState.formData.pets         = data.pets === 'Yes'
      // addons come back as a comma-separated string from the sheet
      quoteState.formData.addons       = data.addons
        ? data.addons.split(',').map(a => a.trim()).filter(Boolean)
        : []

      // Hydrate quote response (backend-authoritative total)
      quoteState.quoteResponse = {
        quoteId: data.quoteId,
        total: data.total,
        breakdown: {},  // breakdown not stored in sheet; display total only for returning users
      }

      // Restore arrival window if already confirmed
      if (data.arrivalWindow) {
        quoteState.bookingData.arrivalWindow = data.arrivalWindow
      }

      // Mark as returning so QuoteScreen can show the right UI
      isReturningUser.value = true

      // Route to correct screen based on current quote state
      if (data.paid === 'Yes') {
        setState('PAYMENT_SUCCESS')
      } else {
        // Whether arrivalWindow is set or not, go to QUOTE_READY
        // QuoteScreen will show the right section based on isReturningUser + arrivalWindow
        setState('QUOTE_READY')
      }

      // Clean the URL so refreshing doesn't re-trigger hydration
      window.history.replaceState({}, document.title, window.location.pathname)

      await nextTick()
      sendHeight()
    } catch (err) {
      globalError.value = 'Could not load quote ' + quoteId + '. ' + (err.message || '')
      setState('FORM')
    }
    return // skip the payment=success check below
  }

  // ── V1: Legacy payment=success redirect (kept for backwards compatibility) ──
  if (params.get('payment') === 'success') {
    const reference = params.get('reference')
    if (reference) {
      try {
        await markPaid(reference)
        quoteState.quoteResponse = { quoteId: reference, total: 0, breakdown: {} }
        setState('PAYMENT_SUCCESS')
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.error('markPaid failed:', err)
        // Still show success screen — payment went through
        quoteState.quoteResponse = { quoteId: reference, total: 0, breakdown: {} }
        setState('PAYMENT_SUCCESS')
      }
    }
  }
})
</script>
