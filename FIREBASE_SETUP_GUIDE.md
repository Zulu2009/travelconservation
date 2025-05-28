# 🔧 Firebase Authentication & Firestore Setup Guide

## 🔐 **Fix Google Sign-In Authentication**

### **Step 1: Enable Google Sign-In Provider**
In the Firebase Console (Authentication > Sign-in method):

1. **Click on "Google"** in the Sign-in providers list
2. **Enable the toggle** at the top right
3. **Set Project support email** (use your email)
4. **Add Authorized Domains**:
   - `travelconservation-b4f04.web.app` (your live domain)
   - `travelconservation-b4f04.firebaseapp.com` (Firebase default)
   - `localhost` (for local development)
5. **Click "Save"**

### **Step 2: Configure OAuth Consent Screen**
If prompted, you may need to configure the OAuth consent screen in Google Cloud Console:
1. Go to Google Cloud Console > APIs & Credentials > OAuth consent screen
2. Set up the consent screen with your app details
3. Add your domain to authorized domains

## 🗄️ **Fix Firestore Database**

### **Step 1: Create Firestore Database**
In the Firebase Console (Firestore Database):

1. **Click "Create database"**
2. **Choose "Start in production mode"** (we have security rules)
3. **Select location**: Choose closest to your users (e.g., `us-central1`)
4. **Click "Done"**

### **Step 2: Deploy Security Rules**
Run this command to deploy our security rules:
```bash
firebase deploy --only firestore:rules
```

### **Step 3: Create Initial Collections**
The app will automatically create these collections when used:
- `users` - User profiles and preferences
- `conversations` - AI chat conversations
- `tripPlans` - Generated travel plans
- `listings` - Conservation travel listings

## 🚀 **Deploy All Firebase Services**

Run this command to deploy everything:
```bash
firebase deploy
```

This will deploy:
- ✅ Hosting (frontend app)
- ✅ Functions (AI chat backend)
- ✅ Firestore rules (database security)
- ✅ Storage rules (file security)

## 🧪 **Test the Fixes**

### **Test Google Sign-In**
1. Visit: https://travelconservation-b4f04.web.app
2. Click "Sign In" in the header
3. Choose "Sign in with Google"
4. Complete the OAuth flow
5. Verify you're signed in (profile shows in header)

### **Test Firestore Database**
1. Sign in to the app
2. Go to "Persona Planner"
3. Select a persona and start a conversation
4. Check Firebase Console > Firestore to see data being created

## 🔒 **Security Rules Explained**

Our Firestore rules ensure:
- **Users can only access their own data**
- **Authenticated users can read/write their conversations**
- **Public listings are readable by all**
- **Admin-only access for sensitive operations**

## 🛠️ **Troubleshooting**

### **Google Sign-In Issues**
- **Domain not authorized**: Add your domain to authorized domains
- **OAuth consent needed**: Configure consent screen in Google Cloud
- **API not enabled**: Enable Google Sign-In API in Google Cloud Console

### **Firestore Issues**
- **Permission denied**: Check security rules are deployed
- **Database not created**: Create database in Firebase Console
- **Wrong region**: Ensure consistent region selection

## 📋 **Quick Checklist**

- [ ] Google Sign-In provider enabled in Firebase Console
- [ ] Authorized domains added (including your live domain)
- [ ] Firestore database created in production mode
- [ ] Security rules deployed with `firebase deploy --only firestore:rules`
- [ ] All services deployed with `firebase deploy`
- [ ] Google Sign-In tested on live app
- [ ] Firestore data creation tested

## 🎯 **Expected Results**

After completing these steps:
- ✅ **Google Sign-In works** on your live app
- ✅ **User profiles are created** in Firestore
- ✅ **AI conversations are saved** to database
- ✅ **Security rules protect** user data
- ✅ **App is fully functional** with authentication and data persistence

## 🆘 **Need Help?**

If you encounter issues:
1. Check Firebase Console for error messages
2. Look at browser developer tools console
3. Verify all domains are properly configured
4. Ensure all Firebase services are enabled

**Once these fixes are complete, your TravelConservation.com app will have full authentication and database functionality! 🌍✈️🌿**
