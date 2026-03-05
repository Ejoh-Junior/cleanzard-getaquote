/**
 * Cleanzard – Google Apps Script Backend (Code.gs) – V2
 * 
 * Deploy as Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone (anonymous)
 * 
 * CORS is handled in doPost/doGet by checking Origin header.
 * 
 * Sheet structure (Sheet1):
 * A: Quote ID | B: Timestamp | C: Property Type | D: First Name | E: Last Name |
 * F: Email | G: Phone | H: Address | I: Bedrooms | J: Bathrooms | K: Pets |
 * L: Cleaning Type | M: Addons | N: Frequency | O: Service Date |
 * P: Total | Q: Arrival Window | R: Paid | S: Business Name | T: Language |
 * U: Callback Time | V: Notes
 */

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
  SPREADSHEET_ID: '1mRWP7HL5szAx7rbE6pf4j-pyqSwM8scfKZNklXgvkHI',
  SHEET_NAME: 'Sheet1',
  BUSINESS_EMAIL: 'jrbison2@gmail.com',
  // V2: Frontend URL used for return-to-quote links in emails
  FRONTEND_URL: 'https://cleanzard-get-a-quote.netlify.app',
  ALLOWED_ORIGINS: [
    'https://cleanzard.ca',
    'https://solutioncleanzard.godaddysites.com',
    'https://www.cleanzard.ca',
    // 'https://cleanzard-get-a-quote.netlify.app',
  ],
}

// ─── Pricing Config (Server-authoritative) ────────────────────────────────────
const PRICING = {
  regular: {
    basePrice: 112.5,
    additionalBedroom: 22,
    additionalBathroom: 22,
  },
  deep: {
    basePrice: 225,
    additionalBedroom: 24,
    additionalBathroom: 48,
  },
  move: {
    basePrice: 347,
    additionalBedroom: 24,
    additionalBathroom: 48,
  },
  addons: {
    oven: 40,
    laundry: 20,
    fridge: 40,
    steamSofa: 40,
    pets: 20,
  },
}

// ─── HTTP Entry Points ────────────────────────────────────────────────────────

/**
 * Handle all POST requests.
 * Route by ?action= query parameter.
 */
function doPost(e) {
  try {
    const action = e.parameter && e.parameter.action ? e.parameter.action : ''

    let body = {}
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents)
      } catch (parseErr) {
        // Try form data
        body = e.parameter || {}
      }
    } else {
      body = e.parameter || {}
    }

    let result
    switch (action) {
      case 'createQuote':
        result = handleCreateQuote(body)
        break
      case 'confirmBooking':
        result = handleConfirmBooking(body)
        break
      case 'markPaid':
        result = handleMarkPaid(body)
        break
      // ── V2: GoDaddy Payment Webhook ──────────────────────────────────────
      // GoDaddy Pay will POST a JSON payload when a payment is completed.
      // Configure this Web App URL as the webhook endpoint in your GoDaddy Pay settings.
      // Expected payload: { "reference": "Q-XXXXXX", ... }
      case 'paymentWebhook':
        result = handlePaymentWebhook(body)
        break
      default:
        result = { success: false, error: 'Unknown action: ' + action }
    }

    return buildResponse(result)
  } catch (err) {
    Logger.log('doPost error: ' + err.message)
    return buildResponse({ success: false, error: 'Internal server error.' })
  }
}

/**
 * V2: GET requests handle read-only operations (getQuote, checkStatus).
 * Using GET avoids the OPTIONS preflight issue entirely for polling.
 */
function doGet(e) {
  const action = e.parameter && e.parameter.action ? e.parameter.action : ''

  // ── V2: Get full quote by ID ─────────────────────────────────────────────
  if (action === 'getQuote') {
    const quoteId = sanitize(e.parameter.quoteId || '')
    if (!quoteId) return buildResponse({ success: false, error: 'quoteId is required.' })
    return buildResponse(handleGetQuote({ quoteId }))
  }

  // ── V2: Lightweight paid status check (used by polling heartbeat) ────────
  if (action === 'checkStatus') {
    const quoteId = sanitize(e.parameter.quoteId || '')
    if (!quoteId) return buildResponse({ success: false, error: 'quoteId is required.' })
    return buildResponse(handleCheckStatus({ quoteId }))
  }

  // Health check
  return buildResponse({ success: true, message: 'Cleanzard API V2 is running.' })
}

// ─── CORS / Response Builder ──────────────────────────────────────────────────

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ─── Action Handlers ──────────────────────────────────────────────────────────

/**
 * Create a new quote (residential or commercial lead).
 * Recalculates pricing server-side.
 */
function handleCreateQuote(body) {
  // Sanitize
  const propertyType = sanitize(body.propertyType)
  const firstName    = sanitize(body.firstName)
  const lastName     = sanitize(body.lastName)
  const email        = sanitize(body.email)
  const phone        = sanitize(body.phone)

  if (!propertyType || !firstName || !lastName || !email || !phone) {
    return { success: false, error: 'Missing required fields.' }
  }

  // Validate email
  if (!isValidEmail(email)) {
    return { success: false, error: 'Invalid email address.' }
  }

  // Generate unique quote ID
  const quoteId = generateQuoteId()
  const timestamp = new Date().toISOString()

  // Row data
  const row = [
    quoteId,           // A
    timestamp,         // B
    propertyType,      // C
    firstName,         // D
    lastName,          // E
    email,             // F
    phone,             // G
    sanitize(body.address) || '',           // H
    sanitize(body.bedrooms) || '',          // I
    sanitize(body.bathrooms) || '',         // J
    body.pets === true || body.pets === 'true' ? 'Yes' : 'No', // K
    sanitize(body.cleaningType) || '',      // L
    Array.isArray(body.addons) ? body.addons.join(', ') : (sanitize(body.addons) || ''), // M
    sanitize(body.frequency) || '',         // N
    sanitize(body.serviceDate) || '',       // O
    0,                 // P – total, calculated below
    '',                // Q – arrival window (filled on confirmBooking)
    'No',              // R – paid
    sanitize(body.businessName) || '',      // S
    sanitize(body.preferredLanguage) || '', // T
    sanitize(body.preferredCallbackTime) || '', // U
    sanitize(body.notes) || '',             // V
  ]

  let total = 0
  let breakdown = {}

  // Calculate pricing for residential only
  if (propertyType === 'house' || propertyType === 'condo') {
    const cleaningType = sanitize(body.cleaningType) || 'regular'
    const config = PRICING[cleaningType] || PRICING.regular

    const bedrooms  = Math.min(8, Math.max(0, parseInt(body.bedrooms, 10) || 1))
    const bathrooms = Math.min(8, Math.max(0, parseInt(body.bathrooms, 10) || 1))
    const hasPets   = body.pets === true || body.pets === 'true'

    const basePrice     = config.basePrice
    const bedroomCost   = Math.max(0, bedrooms - 1) * config.additionalBedroom
    const bathroomCost  = Math.max(0, bathrooms - 1) * config.additionalBathroom

    let addonsTotal = 0
    const addons = Array.isArray(body.addons) ? body.addons : []
    addons.forEach(addon => {
      const addonKey = addon.trim()
      if (PRICING.addons[addonKey]) {
        addonsTotal += PRICING.addons[addonKey]
      }
    })

    const petsTotal = hasPets ? PRICING.addons.pets : 0
    const discount  = 0

    total = basePrice + bedroomCost + bathroomCost + addonsTotal + petsTotal - discount

    breakdown = {
      basePrice,
      bedroomCost,
      bathroomCost,
      addonsTotal,
      petsTotal,
      discount,
    }

    row[15] = total // Update total in row
  }

  // Write to Google Sheet
  try {
    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME)

    // Add headers if first row is empty
    ensureHeaders(sheet)

    sheet.appendRow(row)
    Logger.log('Quote saved: ' + quoteId)
  } catch (sheetErr) {
    Logger.log('Sheet write error: ' + sheetErr.message)
    return { success: false, error: 'Could not save quote. Please try again.' }
  }

  // Send confirmation email to customer
  try {
    sendCustomerEmail(email, firstName, quoteId, propertyType, total, breakdown, body)
  } catch (emailErr) {
    Logger.log('Email error (non-fatal): ' + emailErr.message)
    // Non-fatal – quote is saved, just email failed
  }

  // Notify business
  try {
    sendBusinessNotification(quoteId, propertyType, firstName, lastName, email, phone, body)
  } catch (notifyErr) {
    Logger.log('Business notification error (non-fatal): ' + notifyErr.message)
  }

  return {
    success: true,
    quoteId,
    total,
    breakdown,
  }
}

/**
 * Confirm booking – update arrival window in sheet.
 */
function handleConfirmBooking(body) {
  const quoteId       = sanitize(body.quoteId)
  const arrivalWindow = sanitize(body.arrivalWindow)

  if (!quoteId || !arrivalWindow) {
    return { success: false, error: 'quoteId and arrivalWindow are required.' }
  }

  try {
    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME)

    const row = findRowByQuoteId(sheet, quoteId)
    if (!row) {
      return { success: false, error: 'Quote not found: ' + quoteId }
    }

    // Column Q (index 17, 1-based) = arrival window
    sheet.getRange(row, 17).setValue(arrivalWindow)
    Logger.log('Booking confirmed: ' + quoteId + ' | ' + arrivalWindow)
  } catch (err) {
    Logger.log('confirmBooking error: ' + err.message)
    return { success: false, error: 'Could not confirm booking.' }
  }

  return { success: true, quoteId, arrivalWindow }
}

/**
 * Mark a quote as paid and send receipt email.
 */
function handleMarkPaid(body) {
  const quoteId = sanitize(body.quoteId)

  if (!quoteId) {
    return { success: false, error: 'quoteId is required.' }
  }

  let customerEmail = ''
  let customerFirstName = ''
  let total = 0

  try {
    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME)

    const rowNum = findRowByQuoteId(sheet, quoteId)
    if (!rowNum) {
      return { success: false, error: 'Quote not found: ' + quoteId }
    }

    // Column R (index 18) = paid
    sheet.getRange(rowNum, 18).setValue('Yes')

    // Read row data for receipt
    const rowData = sheet.getRange(rowNum, 1, 1, 22).getValues()[0]
    customerEmail     = rowData[5]  // F = email
    customerFirstName = rowData[3]  // D = first name
    total             = rowData[15] // P = total

    Logger.log('Payment marked: ' + quoteId)
  } catch (err) {
    Logger.log('markPaid error: ' + err.message)
    return { success: false, error: 'Could not mark payment.' }
  }

  // Send receipt
  try {
    sendReceiptEmail(customerEmail, customerFirstName, quoteId, total)
  } catch (emailErr) {
    Logger.log('Receipt email error (non-fatal): ' + emailErr.message)
  }

  return { success: true, quoteId }
}

// ── V2: New Handlers ──────────────────────────────────────────────────────────

/**
 * V2: Get full quote data by quoteId.
 * Used by the frontend to hydrate state when a returning user lands with ?quoteId=
 * Returns all fields needed to reconstruct the QuoteScreen or SuccessScreen.
 */
function handleGetQuote(body) {
  const quoteId = sanitize(body.quoteId)

  if (!quoteId) {
    return { success: false, error: 'quoteId is required.' }
  }

  try {
    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME)

    const rowNum = findRowByQuoteId(sheet, quoteId)
    if (!rowNum) {
      return { success: false, error: 'Quote not found: ' + quoteId }
    }

    // Read all 22 columns
    const row = sheet.getRange(rowNum, 1, 1, 22).getValues()[0]

    // Map columns back to named fields (preserving exact sheet column order)
    return {
      success: true,
      quoteId:       row[0],   // A
      timestamp:     row[1],   // B
      propertyType:  row[2],   // C
      firstName:     row[3],   // D
      lastName:      row[4],   // E
      email:         row[5],   // F
      phone:         row[6],   // G
      address:       row[7],   // H
      bedrooms:      row[8],   // I
      bathrooms:     row[9],   // J
      pets:          row[10],  // K – 'Yes'/'No' string
      cleaningType:  row[11],  // L
      addons:        row[12],  // M – comma-separated string
      frequency:     row[13],  // N
      serviceDate:   row[14],  // O
      total:         row[15],  // P
      arrivalWindow: row[16],  // Q
      paid:          row[17],  // R – 'Yes'/'No'
      businessName:  row[18],  // S
      language:      row[19],  // T
      callbackTime:  row[20],  // U
      notes:         row[21],  // V
    }
  } catch (err) {
    Logger.log('getQuote error: ' + err.message)
    return { success: false, error: 'Could not retrieve quote.' }
  }
}

/**
 * V2: Lightweight status check – only returns paid status.
 * Called every 4 seconds by the polling heartbeat while user is on payment page.
 */
function handleCheckStatus(body) {
  const quoteId = sanitize(body.quoteId)

  if (!quoteId) {
    return { success: false, error: 'quoteId is required.' }
  }

  try {
    const sheet = SpreadsheetApp
      .openById(CONFIG.SPREADSHEET_ID)
      .getSheetByName(CONFIG.SHEET_NAME)

    const rowNum = findRowByQuoteId(sheet, quoteId)
    if (!rowNum) {
      return { success: false, error: 'Quote not found.' }
    }

    // Only read column R (paid) – minimal sheet access for speed
    const paid = sheet.getRange(rowNum, 18).getValue()

    return {
      success: true,
      quoteId,
      paid: paid === 'Yes' ? 'Yes' : 'No',
    }
  } catch (err) {
    Logger.log('checkStatus error: ' + err.message)
    return { success: false, error: 'Could not check status.' }
  }
}

/**
 * V2: GoDaddy Payment Webhook handler.
 * 
 * HOW TO CONFIGURE:
 *   In your GoDaddy Pay dashboard → Settings → Webhooks
 *   Set the endpoint to this Web App URL with ?action=paymentWebhook
 *   e.g. https://script.google.com/macros/s/YOUR_ID/exec?action=paymentWebhook
 * 
 * GoDaddy sends a JSON payload on payment completion.
 * We look for the "reference" field which should match your Quote ID (Q-XXXXXX).
 * 
 * NOTE: GoDaddy Pay webhook payload structure may vary.
 * Inspect actual payloads in Apps Script logs and adjust field names as needed.
 */
function handlePaymentWebhook(body) {
  Logger.log('Webhook received: ' + JSON.stringify(body))

  // GoDaddy Pay typically sends the reference in one of these fields.
  // Adjust based on actual payload – check logs after first real payment.
  const reference = sanitize(
    body.reference ||
    body.orderReference ||
    body.customReference ||
    body.metadata?.reference ||
    ''
  )

  if (!reference) {
    Logger.log('Webhook: no reference field found in payload.')
    return { success: false, error: 'No reference found in webhook payload.' }
  }

  // Only process if it looks like our Quote ID format
  if (!reference.startsWith('Q-')) {
    Logger.log('Webhook: reference does not match Q-XXXXX format: ' + reference)
    return { success: false, error: 'Reference format unrecognized.' }
  }

  Logger.log('Webhook: marking paid for ' + reference)
  return handleMarkPaid({ quoteId: reference })
}

// ─── Email Helpers ────────────────────────────────────────────────────────────

function sendCustomerEmail(email, firstName, quoteId, propertyType, total, breakdown, formData) {
  const isCommercial = propertyType === 'commercial'
  const subject = isCommercial
    ? `[Cleanzard] Commercial Inquiry Received – ${quoteId}`
    : `[Cleanzard] Your Quote is Ready – ${quoteId}`

  // V2: Build return-to-quote link so customer can come back and pay later
  const returnLink = `${CONFIG.FRONTEND_URL}/?quoteId=${quoteId}`

  const body = isCommercial
    ? `Hi ${firstName},\n\nThank you for your commercial cleaning inquiry!\n\nWe've received your request and our team will contact you at your preferred time.\n\nReference: ${quoteId}\n\nBest regards,\nThe Cleanzard Team\ncontact@cleanzard.ca`
    : `Hi ${firstName},\n\nYour cleaning quote is ready!\n\nQuote ID: ${quoteId}\nService: ${formatCleaningType(formData.cleaningType)}\nDate: ${formData.serviceDate || 'TBD'}\nFrequency: ${formData.frequency || 'One-Time'}\n\nEstimated Total: $${Number(total).toFixed(2)}\n\nBreakdown:\n${formatBreakdown(breakdown)}\n\nTax is not included and will not be charged.\n\n────────────────────────\nReady to book? Return to your quote anytime:\n${returnLink}\n────────────────────────\n\nBest regards,\nThe Cleanzard Team\ncontact@cleanzard.ca`

  GmailApp.sendEmail(email, subject, body, {
    // from: CONFIG.BUSINESS_EMAIL,
    name: 'Cleanzard',
    replyTo: CONFIG.BUSINESS_EMAIL,
  })
}

function sendReceiptEmail(email, firstName, quoteId, total) {
  const subject = `[Cleanzard] Payment Confirmed – ${quoteId}`
  const body = `Hi ${firstName},\n\nYour payment has been received. Thank you!\n\nQuote ID: ${quoteId}\nAmount Paid: $${Number(total).toFixed(2)}\n\nWe look forward to serving you.\n\nBest regards,\nThe Cleanzard Team\ncontact@cleanzard.ca`

  GmailApp.sendEmail(email, subject, body, {
    // from: CONFIG.BUSINESS_EMAIL,
    name: 'Cleanzard',
    replyTo: CONFIG.BUSINESS_EMAIL,
  })
}

function sendBusinessNotification(quoteId, propertyType, firstName, lastName, email, phone, formData) {
  const subject = `[Cleanzard] New ${propertyType === 'commercial' ? 'Commercial Lead' : 'Quote'} – ${quoteId}`
  const body = `New ${propertyType === 'commercial' ? 'commercial inquiry' : 'quote request'} received.\n\nQuote ID: ${quoteId}\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nProperty: ${propertyType}\n${formData.businessName ? 'Business: ' + formData.businessName + '\n' : ''}${formData.cleaningType ? 'Cleaning Type: ' + formData.cleaningType + '\n' : ''}${formData.serviceDate ? 'Date: ' + formData.serviceDate + '\n' : ''}Notes: ${formData.notes || 'None'}`

  GmailApp.sendEmail(CONFIG.BUSINESS_EMAIL, subject, body, {
    name: 'Cleanzard System',
  })
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateQuoteId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'Q-'
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function sanitize(val) {
  if (val === null || val === undefined) return ''
  return String(val).trim().substring(0, 500) // max 500 chars per field
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function findRowByQuoteId(sheet, quoteId) {
  const data = sheet.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) { // skip header row
    if (data[i][0] === quoteId) return i + 1 // 1-indexed
  }
  return null
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Quote ID', 'Timestamp', 'Property Type', 'First Name', 'Last Name',
      'Email', 'Phone', 'Address', 'Bedrooms', 'Bathrooms', 'Pets',
      'Cleaning Type', 'Addons', 'Frequency', 'Service Date',
      'Total', 'Arrival Window', 'Paid', 'Business Name', 'Language',
      'Callback Time', 'Notes',
    ])
  }
}

function formatCleaningType(type) {
  return { regular: 'Regular Cleaning', deep: 'Deep Cleaning', move: 'Move In/Move Out' }[type] || type
}

function formatBreakdown(breakdown) {
  if (!breakdown) return ''
  return Object.entries(breakdown)
    .filter(([_, v]) => Number(v) > 0)
    .map(([k, v]) => `  ${k}: $${Number(v).toFixed(2)}`)
    .join('\n')
}


// Test section

// function testCreateQuote() {
//   const fakeRequest = {
//     propertyType: 'house',
//     bedrooms: 2,
//     bathrooms: 1,
//     pets: false,
//     cleaningType: 'regular',
//     addons: ['oven'],
//     frequency: 'one-time',
//     serviceDate: '2025-04-01',
//     address: '123 Main St, Montreal, QC',
//     firstName: 'Jane',
//     lastName: 'Doe',
//     email: 'jr.ejohaje@gmail.com', // ← use a real email to test delivery
//     phone: '5145550100',
//     notes: 'Test booking',
//   }

//   const result = handleCreateQuote(fakeRequest)
//   Logger.log(JSON.stringify(result, null, 2))
// }

// function testGetQuote() {
//   const result = handleGetQuote({ quoteId: 'Q-XXXXXX' }) // ← replace with real ID
//   Logger.log(JSON.stringify(result, null, 2))
// }

// function testCheckStatus() {
//   const result = handleCheckStatus({ quoteId: 'Q-XXXXXX' }) // ← replace with real ID
//   Logger.log(JSON.stringify(result, null, 2))
// }
