# 🔧 Google Authentication Fix Guide

## 🚨 **Issue**: Google Sign-In Broken After Deployment

The Google authentication works locally but fails in the deployed/hosted version. This is a common issue related to OAuth configuration.

## 🔍 **Root Causes:**
1. **Authorized Domains** not configured in Firebase Console
2. **OAuth Consent Screen** missing authorized domains
3. **Production URLs** not whitelisted in Google Cloud Console

## ✅ **Step-by-Step Fix:**

### **Step 1: Fix Firebase Console - Authorized Domains**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: `travelconservation-b4f04`

2. **Navigate to Authentication:**
   - Click **"Authentication"** in left sidebar
   - Click **"Settings"** tab
   - Click **"Authorized domains"**

3. **Add Your Domains:**
   ```
   localhost (should already exist)
   travelconservation-b4f04.web.app
   travelconservation-b4f04.firebaseapp.com
   ```
   
   **If you have a custom domain, add it too:**
   ```
   yourdomain.com
   www.yourdomain.com
   ```

4. **Click "Add domain"** for each one

### **Step 2: Fix Google Cloud Console - OAuth Consent Screen**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select project: `travelconservation-b4f04`

2. **Navigate to OAuth Consent Screen:**
   - Go to **APIs & Services** → **OAuth consent screen**

3. **Add Authorized Domains:**
   ```
   travelconservation-b4f04.web.app
   travelconservation-b4f04.firebaseapp.com
   ```
   
   **If you have a custom domain:**
   ```
   yourdomain.com
   ```

4. **Click "Save and Continue"**

### **Step 3: Update OAuth Client (If Needed)**

1. **Go to Credentials:**
   - In Google Cloud Console: **APIs & Services** → **Credentials**

2. **Find your Web Client:**
   - Look for "Web client (auto created by Google Service)"

3. **Add Authorized JavaScript Origins:**
   ```
   https://travelconservation-b4f04.web.app
   https://travelconservation-b4f04.firebaseapp.com
   ```

4. **Add Authorized Redirect URIs:**
   ```
   https://travelconservation-b4f04.web.app/__/auth/handler
   https://travelconservation-b4f04.firebaseapp.com/__/auth/handler
   ```

5. **Click "Save"**

### **Step 4: Re-deploy Your App**

1. **Build and Deploy:**
   ```bash
   cd travelconservation
   npm run build
   firebase deploy --only hosting
   ```

2. **Wait 5-10 minutes** for changes to propagate

### **Step 5: Test Authentication**

1. **Visit your deployed app:**
   - https://travelconservation-b4f04.web.app

2. **Try Google Sign-In:**
   - Should work without popup blocking or domain errors

## 🎯 **Quick Fix Commands:**

**If you have Firebase CLI setup correctly:**

```bash
# Deploy hosting with latest changes
cd travelconservation
firebase deploy --only hosting

# Check current auth config
firebase auth:export current-auth.json
```

## 🚀 **Alternative: Temporary Bypass for Development**

**Add this to your signin component for testing:**

```typescript
// Add to SignIn.tsx temporarily
const handleGoogleSignIn = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Configure Google Auth Provider with additional settings
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    await signInWithGoogle();
    navigate('/');
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'auth/unauthorized-domain') {
      setError('This domain is not authorized. Please contact support.');
    } else {
      setError(error.message || 'Failed to sign in with Google');
    }
  } finally {
    setLoading(false);
  }
};
```

## 🔧 **Common Error Codes & Fixes:**

### **Error: `auth/unauthorized-domain`**
- **Fix:** Add your domain to Firebase authorized domains (Step 1)

### **Error: `auth/popup-blocked`**
- **Fix:** Use redirect instead of popup (update auth service)

### **Error: `auth/network-request-failed`**
- **Fix:** Check CORS settings and authorized origins (Step 3)

### **Error: OAuth consent screen issues**
- **Fix:** Complete OAuth consent screen setup (Step 2)

## 📱 **Mobile/PWA Considerations:**

**If building for mobile, also add:**
```
yourapp://
http://localhost
http://localhost:3000
```

## ✅ **Verification Checklist:**

- [ ] Firebase authorized domains updated
- [ ] Google Cloud OAuth consent screen configured
- [ ] OAuth client credentials updated
- [ ] App re-deployed
- [ ] 10 minutes waited for propagation
- [ ] Tested on actual deployed URL

---

## 🆘 **Still Not Working?**

**Enable detailed error logging:**

```typescript
// Add to your AuthService.signInWithGoogle method
import { getAdditionalUserInfo } from 'firebase/auth';

try {
  const result = await signInWithPopup(auth, provider);
  const additionalInfo = getAdditionalUserInfo(result);
  console.log('Auth success:', {
    user: result.user,
    isNewUser: additionalInfo?.isNewUser,
    providerId: additionalInfo?.providerId
  });
} catch (error) {
  console.error('Full error object:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    customData: error.customData
  });
}
```

**This will show exactly what's failing in the browser console.**
