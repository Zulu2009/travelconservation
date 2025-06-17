# 🔑 Google Gemini API Setup Guide

## The connection test failed - here's how to fix it:

### Step 1: Get a New API Key

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Select "Create API key in new project"** (recommended)
5. **Copy the new API key** (starts with `AIzaSy...`)

### Step 2: Update Your Environment

**Local Development (.env file):**
```bash
# Replace the existing key with your new one
REACT_APP_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

**After updating .env:**
```bash
# Restart your development server
npm start
```

### Step 3: Test the New Key

1. Visit: http://localhost:3000/debug/gemini
2. Check that "API Key: Present" shows
3. Click "Test Connection"
4. Should show "Connected" status

### Step 4: Update Production Environment

**For Firebase Hosting:**
The API key is built into the app during build time, so you need to:

1. Update your local .env file with the new key
2. Rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

## Common Issues & Solutions

### Issue 1: "API_KEY_INVALID"
**Cause:** API key is wrong or expired
**Solution:** Generate a new API key from Google AI Studio

### Issue 2: "PERMISSION_DENIED" 
**Cause:** API key doesn't have Gemini API access
**Solution:** 
1. Go to Google Cloud Console
2. Enable "Generative Language API"
3. Or create a new API key in Google AI Studio

### Issue 3: "QUOTA_EXCEEDED"
**Cause:** You've hit the free tier limits
**Solution:**
1. Check usage at: https://makersuite.google.com/app/usage
2. Wait for quota reset (daily)
3. Or upgrade to paid tier

### Issue 4: "CORS Error"
**Cause:** API restrictions
**Solution:**
1. In Google Cloud Console, go to APIs & Services > Credentials
2. Edit your API key
3. Under "Application restrictions", select "None"
4. Under "API restrictions", ensure "Generative Language API" is allowed

## Quick Fix Steps

### 1. Generate New API Key
```
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project"
4. Copy the key (starts with AIzaSy...)
```

### 2. Update Local Environment
```bash
# Edit your .env file
REACT_APP_GEMINI_API_KEY=AIzaSyYOUR_NEW_KEY_HERE

# Restart development server
npm start
```

### 3. Test Connection
```
1. Go to: http://localhost:3000/debug/gemini
2. Click "Test Connection"
3. Should show "Connected"
```

### 4. Deploy to Production
```bash
# Build with new API key
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Verification Checklist

- [ ] New API key generated from Google AI Studio
- [ ] API key starts with "AIzaSy"
- [ ] .env file updated with new key
- [ ] Development server restarted
- [ ] Debug page shows "API Key: Present"
- [ ] Connection test passes
- [ ] App rebuilt and redeployed for production

## Alternative: Use a Different API Key Format

If you're still having issues, try this format in your .env:

```bash
# Sometimes this format works better
REACT_APP_GEMINI_API_KEY="AIzaSyYOUR_KEY_HERE"
```

## Test with curl (Advanced)

You can test your API key directly:

```bash
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY'
```

If this returns an error, the issue is with the API key itself.

---

## Most Likely Solution

**The quickest fix is usually:**
1. Generate a completely new API key
2. Update your .env file
3. Restart your development server
4. Test on the debug page

Let me know what error message you see on the debug page and I can provide more specific help!
