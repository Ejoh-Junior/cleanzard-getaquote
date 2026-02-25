/**
 * usePricing.js
 * Frontend pricing logic – for live estimate display ONLY.
 * Backend recalculates and is the authoritative source of truth.
 */
import { computed, watchEffect } from 'vue'
import { useQuoteState } from './useQuoteState.js'

// ─── Pricing Config (V1) ──────────────────────────────────────────────────────
export const pricingConfig = {
  regular: {
    basePrice: 112.5,
    additionalBedroom: 22,
    additionalBathroom: 22,
    baseHours: 3,
    hourBedroom: 0.5,
    hourBathroom: 1,
  },
  deep: {
    basePrice: 225,
    additionalBedroom: 24,
    additionalBathroom: 48,
    baseHours: 6,
    hourBedroom: 1,
    hourBathroom: 1.5,
  },
  move: {
    basePrice: 347,
    additionalBedroom: 24,
    additionalBathroom: 48,
    baseHours: 8,
    hourBedroom: 1,
    hourBathroom: 1.5,
  },
  addons: {
    oven: 40,
    laundry: 20,
    fridge: 40,
    steamSofa: 40,
    pets: 20,
  },
}

// Base bedroom/bathroom counts (included in base price)
const BASE_BEDROOMS = 1
const BASE_BATHROOMS = 1

export function usePricing() {
  const { quoteState } = useQuoteState()

  const estimate = computed(() => {
    const fd = quoteState.formData

    // Only calculate for residential
    if (fd.propertyType === 'commercial' || !fd.propertyType) {
      return { basePrice: 0, addonsTotal: 0, petsTotal: 0, discount: 0, total: 0, estimatedHours: 0 }
    }

    const config = pricingConfig[fd.cleaningType] || pricingConfig.regular

    // Base price
    const basePrice = config.basePrice

    // Additional bedrooms/bathrooms beyond the base 1
    const extraBedrooms = Math.max(0, (fd.bedrooms || 1) - BASE_BEDROOMS)
    const extraBathrooms = Math.max(0, (fd.bathrooms || 1) - BASE_BATHROOMS)
    const bedroomCost = extraBedrooms * config.additionalBedroom
    const bathroomCost = extraBathrooms * config.additionalBathroom

    // Addons
    const addonsTotal = (fd.addons || []).reduce((sum, addon) => {
      return sum + (pricingConfig.addons[addon] || 0)
    }, 0)

    // Pets
    const petsTotal = fd.pets ? pricingConfig.addons.pets : 0

    // Discount (always 0 in V1)
    const discount = 0

    const total = basePrice + bedroomCost + bathroomCost + addonsTotal + petsTotal - discount

    // Estimated hours
    const estimatedHours = config.baseHours
      + (extraBedrooms * config.hourBedroom)
      + (extraBathrooms * config.hourBathroom)

    return {
      basePrice,
      bedroomCost,
      bathroomCost,
      addonsTotal,
      petsTotal,
      discount,
      total,
      estimatedHours,
    }
  })

  // Keep quoteState.estimate in sync
  watchEffect(() => {
    Object.assign(quoteState.estimate, estimate.value)
  })

  return { estimate, pricingConfig }
}
