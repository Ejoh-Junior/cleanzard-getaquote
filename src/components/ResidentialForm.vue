<template>
  <div class="space-y-6">

    <!-- Section 2: Residential Details -->
    <div class="card" id="section-details">
      <h2 class="section-label">
        <span class="section-number">2</span>
        Residential Details
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
        <!-- Bedrooms -->
        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
            Bedrooms
          </label>
          <NumberInputStepper v-model="fd.bedrooms" :min="0" :max="8" label="bedrooms" />
        </div>

        <!-- Bathrooms -->
        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
            Bathrooms
          </label>
          <NumberInputStepper v-model="fd.bathrooms" :min="0" :max="8" label="bathrooms" />
        </div>

        <!-- Pets toggle -->
        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
            Pets <span class="text-xs text-slate-400 font-normal">(+$20)</span>
          </label>
          <button
            type="button"
            @click="fd.pets = !fd.pets"
            :class="[
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30',
              fd.pets ? 'bg-primary' : 'bg-slate-200'
            ]"
            role="switch"
            :aria-checked="fd.pets"
          >
            <span
              :class="[
                'inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-200',
                fd.pets ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Cleaning Type -->
      <div class="mb-5">
        <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
          Cleaning Type <span class="text-error">*</span>
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            v-for="ct in cleaningTypes"
            :key="ct.value"
            type="button"
            @click="fd.cleaningType = ct.value"
            :class="[
              'relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-150',
              fd.cleaningType === ct.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-200 bg-white hover:border-primary/30'
            ]"
          >
            <span class="text-2xl mb-1">{{ ct.icon }}</span>
            <span class="font-spartan font-bold text-slate-800 text-sm">{{ ct.label }}</span>
            <span class="font-spartan text-xs text-slate-500 mt-0.5">from ${{ ct.from }}</span>
            <!-- Selected indicator -->
            <div v-if="fd.cleaningType === ct.value" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Addons -->
      <div class="mb-5">
        <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
          Add-ons <span class="text-xs text-slate-400 font-normal">(Optional)</span>
        </label>
        <MultiSelect
          v-model="fd.addons"
          :options="addonOptions"
        />
      </div>

      <!-- Frequency -->
      <div>
        <label class="block text-sm font-semibold text-slate-600 font-spartan mb-2">
          Frequency <span class="text-error">*</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="freq in frequencies"
            :key="freq.value"
            type="button"
            @click="fd.frequency = freq.value"
            :class="[
              'px-4 py-2 rounded-xl border-2 font-spartan font-semibold text-sm transition-all duration-150',
              fd.frequency === freq.value
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'
            ]"
          >{{ freq.label }}</button>
        </div>
      </div>
    </div>

    <!-- Section 3: Service Date -->
    <div class="card" id="section-date">
      <h2 class="section-label">
        <span class="section-number">3</span>
        Service Date
      </h2>
      <div>
        <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
          Preferred Date <span class="text-error">*</span>
        </label>
        <input
          v-model="fd.serviceDate"
          type="date"
          :min="minDate"
          :class="['input-base max-w-xs', errors.serviceDate && 'input-error']"
        />
        <p v-if="errors.serviceDate" class="text-error text-xs mt-1 font-spartan">{{ errors.serviceDate }}</p>
        <p class="text-xs text-slate-400 font-spartan mt-1">Displayed as DD/MM/YYYY on confirmation.</p>
      </div>
    </div>

    <!-- Section 4: Address & Contact -->
    <div class="card" id="section-contact">
      <h2 class="section-label">
        <span class="section-number">4</span>
        Your Information
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Address -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Service Address <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.address"
            type="text"
            placeholder="123 Main St, Montreal, QC H1A 1A1"
            :class="['input-base', errors.address && 'input-error']"
          />
          <p v-if="errors.address" class="text-error text-xs mt-1 font-spartan">{{ errors.address }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            First Name <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.firstName"
            type="text"
            placeholder="Jane"
            :class="['input-base', errors.firstName && 'input-error']"
          />
          <p v-if="errors.firstName" class="text-error text-xs mt-1 font-spartan">{{ errors.firstName }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Last Name <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.lastName"
            type="text"
            placeholder="Doe"
            :class="['input-base', errors.lastName && 'input-error']"
          />
          <p v-if="errors.lastName" class="text-error text-xs mt-1 font-spartan">{{ errors.lastName }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Email <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.email"
            type="email"
            placeholder="jane@email.com"
            :class="['input-base', errors.email && 'input-error']"
          />
          <p v-if="errors.email" class="text-error text-xs mt-1 font-spartan">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Phone <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.phone"
            type="tel"
            placeholder="(514) 555-0100"
            :class="['input-base', errors.phone && 'input-error']"
          />
          <p v-if="errors.phone" class="text-error text-xs mt-1 font-spartan">{{ errors.phone }}</p>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Notes <span class="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            v-model="fd.notes"
            rows="3"
            placeholder="Gate code, special instructions, parking info..."
            class="input-base resize-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NumberInputStepper from './ui/NumberInputStepper.vue'
import MultiSelect from './ui/MultiSelect.vue'
import { useQuoteState } from '../composables/useQuoteState.js'

const { quoteState } = useQuoteState()
const fd = quoteState.formData
const errors = quoteState.errors

const cleaningTypes = [
  { value: 'regular', label: 'Regular Cleaning', icon: '🧹', from: '112.50' },
  { value: 'deep', label: 'Deep Cleaning', icon: '✨', from: '225.00' },
  { value: 'move', label: 'Move In/Move Out', icon: '📦', from: '347.00' },
]

const addonOptions = [
  { value: 'oven', label: 'Oven', icon: '🔥', price: 40 },
  { value: 'laundry', label: 'Laundry', icon: '👕', price: 20 },
  { value: 'fridge', label: 'Fridge', icon: '🧊', price: 40 },
  { value: 'steamSofa', label: 'Steam Sofa', icon: '🛋️', price: 40 },
]

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one-time', label: 'One-Time' },
]

// Minimum date: tomorrow
const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})
</script>
