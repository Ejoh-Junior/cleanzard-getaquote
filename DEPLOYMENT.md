# Cleanzard Quote SPA – Deployment Guide

## Overview
This project has two parts:
1. **Frontend** – Vue 3 SPA deployed on Netlify
2. **Backend** – Google Apps Script deployed as a Web App

---

## 1. Backend Setup (Google Apps Script)

### Step 1: Open the Script Editor
1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1mRWP7HL5szAx7rbE6pf4j-pyqSwM8scfKZNklXgvkHI
2. Click **Extensions → Apps Script**

### Step 2: Paste the Code
1. Delete any existing code in `Code.gs`
2. Paste the entire contents of `backend/Code.gs`
3. Click **Save** (💾)

### Step 3: Deploy as Web App
1. Click **Deploy → New Deployment**
2. Click the ⚙️ gear next to "Select type" → choose **Web App**
3. Set:
   - **Description**: `Cleanzard API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. **IMPORTANT**: Copy the Web App URL — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

### Step 4: Update Allowed Origins
In `Code.gs`, update the `ALLOWED_ORIGINS` array to include your Netlify domain after deployment.

### Step 5: Test the API
Open the Web App URL in a browser — you should see:
```json
{"success":true,"message":"Cleanzard API is running."}
```

---

## 2. Frontend Setup (Netlify)

### Step 1: Install Dependencies
```bash
cd cleanzard-quote
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace `YOUR_SCRIPT_ID` with the ID from the Web App URL.

### Step 3: Test Locally
```bash
npm run dev
```

Open http://localhost:3000

### Step 4: Build for Production
```bash
npm run build
```

This creates a `dist/` folder.

### Step 5: Deploy to Netlify
**Option A – Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

**Option B – Netlify Dashboard:**
1. Go to https://app.netlify.com
2. Drag and drop the `dist/` folder onto the Netlify dashboard
3. Note your Netlify URL (e.g. `https://cleanzard-quote.netlify.app`)

### Step 6: Update CORS
1. Go back to your Google Apps Script
2. Add your Netlify URL to `CONFIG.ALLOWED_ORIGINS`
3. Redeploy the script: **Deploy → Manage Deployments → Edit**

---

## 3. Embed in GoDaddy Website

In GoDaddy Website Builder, add an **HTML** or **Embed Code** block:

```html
<iframe
  src="https://your-netlify-url.netlify.app"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="Get a Cleaning Quote"
  loading="lazy"
></iframe>
```

Adjust height as needed (recommend 900–1100px for desktop).

---

## 4. Payment Redirect Configuration

After the customer pays via GoDaddy Pay, they should be redirected to:
```
https://your-netlify-url.netlify.app/?payment=success&reference=Q-XXXXXX
```

Configure this return URL in your GoDaddy Pay settings panel.

---

## 5. Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Google Apps Script Web App URL |

---

## 6. Google Sheet Columns

| Column | Field |
|---|---|
| A | Quote ID |
| B | Timestamp |
| C | Property Type |
| D | First Name |
| E | Last Name |
| F | Email |
| G | Phone |
| H | Address |
| I | Bedrooms |
| J | Bathrooms |
| K | Pets |
| L | Cleaning Type |
| M | Addons |
| N | Frequency |
| O | Service Date |
| P | Total |
| Q | Arrival Window |
| R | Paid |
| S | Business Name |
| T | Language |
| U | Callback Time |
| V | Notes |

---

## 7. Future Updates (V2+)

- Add rate limiting in Google Apps Script
- Set up Google Sheets pricing override (column to override frontend config)
- Integrate Sentry for error tracking
- Add quote expiration logic
- Add automated follow-up emails via Apps Script triggers
