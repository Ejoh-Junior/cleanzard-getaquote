<template>
  <div class="space-y-6">

    <!-- Section: Business Info -->
    <div class="card">
      <h2 class="section-label">
        <span class="section-number">2</span>
        Business Information
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Business Name -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Business Name <span class="text-error">*</span>
          </label>
          <input
            v-model="fd.businessName"
            type="text"
            placeholder="Acme Corp"
            :class="['input-base', errors.businessName && 'input-error']"
            ref="businessNameRef"
          />
          <p v-if="errors.businessName" class="text-error text-xs mt-1 font-spartan">{{ errors.businessName }}</p>
        </div>

        <!-- Preferred Language -->
        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Preferred Language
          </label>
          <select v-model="fd.preferredLanguage" class="input-base">
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Preferred Callback Time -->
        <div>
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Preferred Callback Time <span class="text-error">*</span>
          </label>
          <select
            v-model="fd.preferredCallbackTime"
            :class="['input-base', errors.preferredCallbackTime && 'input-error']"
          >
            <option value="" disabled>Select a time...</option>
            <option value="morning">Morning (8AM – 12PM)</option>
            <option value="afternoon">Afternoon (12PM – 5PM)</option>
            <option value="evening">Evening (5PM – 8PM)</option>
            <option value="anytime">Anytime</option>
          </select>
          <p v-if="errors.preferredCallbackTime" class="text-error text-xs mt-1 font-spartan">{{ errors.preferredCallbackTime }}</p>
        </div>
      </div>
    </div>

    <!-- Section: Contact Info -->
    <div class="card">
      <h2 class="section-label">
        <span class="section-number">3</span>
        Contact Information
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="jane@company.com"
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

        <!-- Notes -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Notes / Additional Details
          </label>
          <textarea
            v-model="fd.notes"
            rows="3"
            placeholder="Describe your space, frequency needs, or any special requirements..."
            class="input-base resize-none"
          />
        </div>

        <!-- File Attachment -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 font-spartan mb-1.5">
            Attachment (Optional)
          </label>
          <div
            class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            @click="$refs.fileInput.click()"
          >
            <input type="file" ref="fileInput" class="hidden" @change="handleFile" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
            <div v-if="!fd.attachmentFile">
              <svg class="w-6 h-6 text-slate-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-xs text-slate-400 font-spartan">Click to attach a file (PDF, Word, Image)</p>
            </div>
            <div v-else class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              <span class="text-sm text-primary font-semibold font-spartan">{{ fd.attachmentFile.name }}</span>
              <button type="button" @click.stop="fd.attachmentFile = null" class="text-slate-400 hover:text-error ml-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuoteState } from "../composables/useQuoteState.js"

const { quoteState } = useQuoteState()
const fd = quoteState.formData
const errors = quoteState.errors

function handleFile(e) {
  const file = e.target.files[0]
  if (file) fd.attachmentFile = file
}
</script>
