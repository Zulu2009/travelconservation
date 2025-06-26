# 🔑 Firebase API Key Renewal Guide

## Problem
Your Firebase API key may be expired, restricted, or invalid, causing connection issues with Firestore and other Firebase services.

## Current API Key
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDrgW4eEblv_meou81pCJ1VcpiaB_llt4g
```

## Steps to Get a New API Key

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **travelconservation-b4f04**

### 2. Navigate to Project Settings
1. Click the **⚙️ gear icon** (Settings) in the left sidebar
2. Select **Project settings**

### 3. Get Web App Configuration
1. Scroll down to the **"Your apps"** section
2. Look for your web app (should show a **</> Web** icon)
3. Click on your web app to expand it
4. Click **"Config"** radio button (not "CDN")
5. You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "NEW_API_KEY_HERE",
  authDomain: "travelconservation-b4f04.firebaseapp.com",
  projectId: "travelconservation-b4f04",
  storageBucket: "travelconservation-b4f04.firebasestorage.app",
  messagingSenderId: "1076018123076",
  appId: "1:1076018123076:web:8cf0799de2408810a50711",
  measurementId: "G-SLYS2Z3JSM"
};
```

### 4. Update Your .env File
Replace the old API key in your `.env` file:

```env
# OLD (replace this)
REACT_APP_FIREBASE_API_KEY=AIzaSyDrgW4eEblv_meou81pCJ1VcpiaB_llt4g

# NEW (use the new apiKey from Firebase Console)
REACT_APP_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
```

### 5. Alternative: Create New Web App (if needed)
If you don't see a web app in your Firebase project:

1. In Project Settings, scroll to **"Your apps"** 
2. Click **"Add app"** button
3. Select **Web** (</> icon)
4. Give it a name like "Travel Conservation Web"
5. **✅ Check "Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. Copy the configuration from the next screen

### 6. Check API Key Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project **travelconservation-b4f04**
3. Navigate to **APIs & Services > Credentials**
4. Find your API key (Browser key)
5. Click **Edit** (pencil icon)
6. Under **API restrictions**:
   - Select **"Don't restrict key"** for testing
   - OR ensure these APIs are enabled:
     - Cloud Firestore API
     - Firebase Authentication API
     - Cloud Storage API
     - Cloud Functions API

### 7. Restart Development Server
After updating the `.env` file:
```bash
# Stop your development server (Ctrl+C)
npm start
# OR
yarn start
```

## 🧪 Test the New API Key

Use the Enhanced Seeding System in Admin Dashboard:
1. Go to Admin Dashboard → "🌱 Database Seeding" tab
2. Check if connection status shows "✅ Connected"
3. Try the "🧪 Test Connection" button
4. If successful, proceed with seeding

## 🔍 Common Issues & Solutions

### Issue: "Project not found" or "Permission denied"
**Solution:** Verify you're using the correct project ID in all config

### Issue: "API key not valid"
**Solution:** 
1. Double-check you copied the full API key
2. Ensure no extra spaces in .env file
3. Restart development server

### Issue: "Quota exceeded"
**Solution:**
1. Check [Firebase Usage](https://console.firebase.google.com/project/travelconservation-b4f04/usage)
2. Upgrade to Blaze plan if needed for higher quotas

### Issue: "API key restrictions"
**Solution:**
1. Temporarily disable API restrictions in Google Cloud Console
2. Re-enable with proper Firebase APIs after testing

## 📞 Need Help?
If you continue having issues:
1. Check Firebase project billing status
2. Verify project is active (not suspended)
3. Try creating a completely new Firebase project for testing

## 🔒 Security Note
After getting seeding working:
1. Re-enable API restrictions in Google Cloud Console
2. Revert Firestore rules to require admin authentication
3. Don't commit real API keys to version control
