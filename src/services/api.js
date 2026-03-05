/**
 * api.js
 * API service layer for Cleanzard backend (Google Apps Script).
 * All pricing totals returned by backend are authoritative.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Generic POST helper
 * Google Apps Script web apps require specific handling:
 *  - CORS is handled server-side
 *  - Responses come back as JSON
 */
async function post(action, payload) {
  const url = `${API_BASE}?action=${action}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'An unexpected error occurred.')
  }

  return data
}

/**
 * V2: Generic GET helper.
 * Used for read-only operations (getQuote, checkStatus) – avoids OPTIONS preflight.
 */
async function get(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString()
  const url = `${API_BASE}?${qs}`

  const response = await fetch(url, { method: 'GET' })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'An unexpected error occurred.')
  }

  return data
}

// ─── Endpoint 1: Create Quote ─────────────────────────────────────────────────
/**
 * @param {Object} formData – residential or commercial form data
 * @returns {Promise<{ quoteId: string, total: number, breakdown: object }>}
 */
export async function createQuote(formData) {
  return post('createQuote', formData)
}

// ─── Endpoint 2: Confirm Booking ──────────────────────────────────────────────
/**
 * @param {string} quoteId
 * @param {string} arrivalWindow – e.g. "9:00 AM – 11:00 AM"
 */
export async function confirmBooking(quoteId, arrivalWindow) {
  return post('confirmBooking', { quoteId, arrivalWindow })
}

// ─── Endpoint 3: Mark Paid ────────────────────────────────────────────────────
/**
 * Called after GoDaddy payment redirect with ?payment=success
 * @param {string} quoteId
 */
export async function markPaid(quoteId) {
  return post('markPaid', { quoteId })
}

// ─── Commercial Lead Submission ───────────────────────────────────────────────
/**
 * @param {Object} formData – commercial form data (with optional file)
 * Uses multipart/form-data for file attachment support
 */
export async function submitCommercialLead(formData) {
  // If there's a file, use FormData (multipart)
  if (formData.attachmentFile) {
    const fd = new FormData()
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'attachmentFile' && val) {
        fd.append('file', val)
      } else if (val !== null && val !== undefined) {
        fd.append(key, String(val))
      }
    })

    const url = `${API_BASE}?action=createQuote`
    const response = await fetch(url, { method: 'POST', body: fd })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Submission failed.')
    return data
  }

  return post('createQuote', formData)
}

// ── V2: New Endpoints ─────────────────────────────────────────────────────────

/**
 * V2: Fetch full quote data by ID.
 * Called on mount when ?quoteId= is present in the URL.
 * Returns all fields needed to hydrate the app state.
 * @param {string} quoteId
 */
export async function fetchQuote(quoteId) {
  return get('getQuote', { quoteId })
}

/**
 * V2: Lightweight paid-status check.
 * Called every 4 seconds by the polling heartbeat while user is on payment page.
 * @param {string} quoteId
 * @returns {Promise<{ success: boolean, quoteId: string, paid: 'Yes'|'No' }>}
 */
export async function checkStatus(quoteId) {
  return get('checkStatus', { quoteId })
}

// ─── Payment URL Builder ──────────────────────────────────────────────────────
const PAY_BASE = 'https://pay.cleanzard.ca/Booking-Confirmation'

/**
 * Builds the GoDaddy payment URL with customer info pre-filled
 */
export function buildPaymentUrl(firstName, lastName, email, quoteId) {
  const name = encodeURIComponent(`${firstName} ${lastName}`)
  const em = encodeURIComponent(email)
  const ref = encodeURIComponent(quoteId)
  return `${PAY_BASE}?name=${name}&email=${em}&reference=${ref}`
}
