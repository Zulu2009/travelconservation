# 🔧 AI Persona Chat Debugging Guide

## Quick Debug Steps

### 1. Test AI Integration
Visit: `http://localhost:3000/debug/gemini` (or your deployed URL + `/debug/gemini`)

This debug page will show you:
- ✅ Environment variables status
- ✅ API key presence/format
- ✅ Connection test results
- ✅ Live AI response testing

### 2. Check Console Logs
Open browser DevTools (F12) and look for:
```
[Gemini AI Debug] API Key check: Key present (AIzaSyCHL2...)
[Gemini AI Debug] Gemini AI initialized successfully
[PersonaChat] Initialized with persona: Dr. Marina Torres
```

### 3. Test Persona Chat
1. Go to `/persona-planner`
2. Click any persona card
3. In development mode, click the 🐛 debug icon
4. Try sending a message
5. Look for AI/Error badges on responses

## Common Issues & Solutions

### Issue 1: "API Key Missing"
**Symptoms:** Debug page shows "API Key: Missing"
**Solution:** 
```bash
# Check your .env file has:
REACT_APP_GEMINI_API_KEY=AIzaSyCHL26mplYnLSabHMc-ye8ct2DDljBcHEU

# Restart your development server:
npm start
```

### Issue 2: "API Key Invalid"
**Symptoms:** Connection test fails with "Invalid API key"
**Solutions:**
1. Verify API key in Google AI Studio: https://makersuite.google.com/app/apikey
2. Check API key has Gemini API access enabled
3. Ensure no extra spaces/characters in .env file

### Issue 3: "Quota Exceeded"
**Symptoms:** AI responses fail with quota error
**Solutions:**
1. Check your Google AI Studio usage limits
2. Wait for quota reset (usually daily)
3. Upgrade your API plan if needed

### Issue 4: "CORS Errors"
**Symptoms:** Network errors in browser console
**Solutions:**
1. Gemini API should work from browser - no CORS issues expected
2. Check if you're using the correct API endpoint
3. Verify API key permissions

### Issue 5: "Fallback Responses Only"
**Symptoms:** All responses show persona-specific fallbacks, no AI badge
**Solutions:**
1. Check debug console for error messages
2. Test connection on debug page
3. Verify API key is working
4. Check browser network tab for failed requests

## Debug Console Features

### Environment Information
- Shows current environment (development/production)
- Displays API key status (present/missing)
- Shows partial API key for verification

### Connection Test
- Tests basic API connectivity
- Validates API key format
- Shows specific error messages

### Response Generation Test
- Test custom prompts
- See full AI responses
- Quick test prompts for common scenarios

### Chat Debug Mode
- Toggle with 🐛 icon in persona chat
- Shows API key status in chat
- Displays last error message
- AI/Error badges on messages

## Testing Checklist

### ✅ Basic Setup
- [ ] API key present in .env
- [ ] Development server restarted after .env changes
- [ ] Debug page loads without errors
- [ ] Environment shows "development"

### ✅ API Connection
- [ ] Connection test passes
- [ ] Test response generation works
- [ ] No CORS errors in console
- [ ] API key format correct (starts with AIzaSy...)

### ✅ Persona Chat
- [ ] Persona cards clickable
- [ ] Chat dialog opens
- [ ] Debug mode toggles
- [ ] Quick questions work
- [ ] Messages send successfully

### ✅ AI Responses
- [ ] Messages show "AI" badge when successful
- [ ] Fallback responses when API fails
- [ ] Error messages clear and helpful
- [ ] Conversation context maintained

## Advanced Debugging

### Console Commands
Open browser console and run:
```javascript
// Check environment variables
console.log('API Key:', process.env.REACT_APP_GEMINI_API_KEY);

// Test AI service directly
import { testGeminiConnection } from './services/googleAI';
testGeminiConnection().then(console.log);

// Debug setup info
import { debugGeminiSetup } from './services/googleAI';
debugGeminiSetup();
```

### Network Tab Analysis
1. Open DevTools → Network tab
2. Send a chat message
3. Look for requests to `generativelanguage.googleapis.com`
4. Check request/response details
5. Verify API key in request headers

### Error Message Meanings
- **"Gemini model not initialized"** → API key issue
- **"Response blocked"** → Content safety filters triggered
- **"Permission denied"** → API key lacks permissions
- **"Network error"** → Internet connectivity issue

## Production Deployment Notes

### Environment Variables
- API key must be set in production environment
- Use Firebase hosting environment variables or build-time variables
- Never commit API keys to git

### Error Handling
- Fallback responses ensure chat always works
- Users see helpful error messages
- Debug features disabled in production

### Performance
- API calls cached where appropriate
- Conversation context limited to prevent large requests
- Graceful degradation when API unavailable

## Support Resources

### Google AI Studio
- API key management: https://makersuite.google.com/app/apikey
- Usage monitoring: https://makersuite.google.com/app/usage
- Documentation: https://ai.google.dev/docs

### Debugging Tools
- Debug page: `/debug/gemini`
- Browser DevTools console
- Network tab for API requests
- React DevTools for component state

### Common Solutions
1. **Restart development server** after .env changes
2. **Clear browser cache** if seeing old behavior
3. **Check API quotas** in Google AI Studio
4. **Verify API key permissions** for Gemini API
5. **Test with simple prompts** first

---

## Quick Fix Commands

```bash
# Restart development server
npm start

# Check environment variables
echo $REACT_APP_GEMINI_API_KEY

# Build and test
npm run build
npm run start

# Deploy with debugging
firebase deploy --only hosting
```

Your AI persona chat system is now equipped with comprehensive debugging tools! 🚀
