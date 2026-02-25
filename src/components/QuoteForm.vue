<template>
  <div>
    <!-- Section 1: Property Type (always visible) -->
    <div class="card mb-6" id="section-property-type">
      <h2 class="section-label">
        <span class="section-number">1</span>
        Property Type
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="pt in propertyTypes"
          :key="pt.value"
          type="button"
          @click="selectPropertyType(pt.value)"
          :class="[
            'relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 font-spartan font-bold text-sm transition-all duration-150',
            fd.propertyType === pt.value
              ? 'border-primary bg-primary text-white shadow-md'
              : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:shadow-sm',
          ]"
        >
          <span class="text-3xl">{{ pt.icon }}</span>
          <span>{{ pt.label }}</span>
          <div
            v-if="fd.propertyType === pt.value"
            class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </button>
      </div>
      <p v-if="errors.propertyType" class="text-error text-xs mt-2 font-spartan">{{ errors.propertyType }}</p>
    </div>

    <!-- Dynamic form based on property type -->
    <Transition name="fade" mode="out-in">
      <CommercialForm v-if="isCommercial" key="commercial" />
      <ResidentialForm v-else-if="isResidential" key="residential" />
    </Transition>

    <!-- Mobile-only submit CTA (summary panel is below on mobile) -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CommercialForm from './CommercialForm.vue'
import ResidentialForm from './ResidentialForm.vue'
import { useQuoteState } from '../composables/useQuoteState.js'

const { quoteState } = useQuoteState()
const fd = quoteState.formData
const errors = quoteState.errors

const propertyTypes = [
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'condo', label: 'Condo / Apartment', icon: '🏢' },
  { value: 'commercial', label: 'Commercial Building', icon: '🏬' },
]

const isCommercial = computed(() => fd.propertyType === 'commercial')
const isResidential = computed(() => fd.propertyType === 'house' || fd.propertyType === 'condo')

function selectPropertyType(value) {
  fd.propertyType = value
  // Reset form-specific errors when switching
  quoteState.errors = {}
}
</script>
