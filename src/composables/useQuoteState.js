/**
 * useQuoteState.js
 * Centralized reactive state for the entire Cleanzard quote flow.
 * Single source of truth for form data, estimate, and app state.
 */
import { reactive, computed } from 'vue'

// ─── App State Machine ───────────────────────────────────────────────────────
// Valid states: FORM | SUBMITTING | QUOTE_READY | BOOKING_CONFIRM |
//               PAYMENT_REDIRECT | PAYMENT_SUCCESS | COMMERCIAL_SUBMITTED

const quoteState = reactive({
  appState: 'FORM',

  formData: {
    // Step 1 – Property Type
    propertyType: '', // 'house' | 'condo' | 'commercial'

    // Residential fields
    bedrooms: 1,
    bathrooms: 1,
    pets: false,
    cleaningType: 'regular', // 'regular' | 'deep' | 'move'
    addons: [],              // ['oven', 'laundry', 'fridge', 'steamSofa']
    frequency: 'one-time',   // 'weekly' | 'bi-weekly' | 'monthly' | 'one-time'
    serviceDate: '',

    // Contact info (shared)
    address: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',

    // Commercial-only fields
    businessName: '',
    preferredLanguage: 'english',
    preferredCallbackTime: '',
    attachmentFile: null,
  },

  estimate: {
    basePrice: 0,
    addonsTotal: 0,
    petsTotal: 0,
    discount: 0,
    total: 0,
    estimatedHours: 0,
  },

  // Backend-authoritative response after quote submission
  quoteResponse: null,

  // Validation errors keyed by field name
  errors: {},

  // Confirmation booking data
  bookingData: {
    arrivalWindow: '',
  },
})

// ─── State Transition Helpers ─────────────────────────────────────────────────

function setState(newState) {
  quoteState.appState = newState
}

function resetForm() {
  quoteState.appState = 'FORM'
  quoteState.quoteResponse = null
  quoteState.errors = {}
  quoteState.bookingData.arrivalWindow = ''
  Object.assign(quoteState.formData, {
    propertyType: '',
    bedrooms: 1,
    bathrooms: 1,
    pets: false,
    cleaningType: 'regular',
    addons: [],
    frequency: 'one-time',
    serviceDate: '',
    address: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    businessName: '',
    preferredLanguage: 'english',
    preferredCallbackTime: '',
    attachmentFile: null,
  })
}

// ─── Progress Computation ─────────────────────────────────────────────────────

const residentialSections = [
  'propertyType',
  'details',      // bedrooms + bathrooms + pets
  'cleaningType',
  'addons',       // optional but counts as complete if at least visited
  'frequency',
  'serviceDate',
  'contactInfo',
]

const commercialSections = [
  'propertyType',
  'businessInfo',
  'contactInfo',
]

const progress = computed(() => {
  const fd = quoteState.formData

  if (fd.propertyType === 'commercial') {
    let done = 0
    if (fd.propertyType) done++
    if (fd.businessName) done++
    if (fd.firstName && fd.lastName && fd.email && fd.phone) done++
    return { done, total: commercialSections.length }
  }

  if (fd.propertyType === 'house' || fd.propertyType === 'condo') {
    let done = 0
    if (fd.propertyType) done++
    if (fd.bedrooms !== null && fd.bathrooms !== null) done++
    if (fd.cleaningType) done++
    done++ // addons always count (optional section)
    if (fd.frequency) done++
    if (fd.serviceDate) done++
    if (fd.firstName && fd.lastName && fd.email && fd.phone && fd.address) done++
    return { done, total: residentialSections.length }
  }

  return { done: 0, total: 1 }
})

export function useQuoteState() {
  return {
    quoteState,
    progress,
    setState,
    resetForm,
  }
}
