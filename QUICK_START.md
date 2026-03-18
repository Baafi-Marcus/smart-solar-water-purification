# 🚀 Quick Start Guide

## Step 1: Vercel CLI Installed ✅

The Vercel CLI is now installed on your system!

---

## Step 2: Login to Vercel

Run this command to authenticate:

```powershell
vercel login
```

This will:
1. Open your browser
2. Ask you to sign in (or create a free account)
3. Authenticate your CLI

---

## Step 3: Deploy Your Project

Once logged in, deploy with:

```powershell
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → Select your account
- Link to existing project? → **No**
- Project name? → `smart-solar-water-purification` (or your choice)
- In which directory? → `./` (press Enter)
- Want to override settings? → **No**

This creates a **preview deployment** for testing.

---

## Step 4: Deploy to Production

After testing the preview, deploy to production:

```powershell
vercel --prod
```

You'll get a URL like:
```
✅ https://smart-solar-water-purification.vercel.app
```

---

## Step 5: Update Frontend Configuration

After deployment, update your API URL:

**Edit `js/config.js`:**

Change line 7 from:
```javascript
API_BASE_URL: window.ENV?.API_BASE_URL || 'http://localhost:3000',
```

To:
```javascript
API_BASE_URL: window.ENV?.API_BASE_URL || 'https://your-actual-vercel-url.vercel.app',
```

Then redeploy:
```powershell
vercel --prod
```

---

## Step 6: Update ESP32 Code

**Edit `ESP32_INTEGRATION.ino`:**

Line 26:
```cpp
const char* apiBaseUrl = "https://your-actual-vercel-url.vercel.app";
```

Upload to your ESP32!

---

## 🧪 Test Your Deployment

### Test Frontend
Visit your Vercel URL in browser:
```
https://your-project.vercel.app
```

### Test API Endpoints
```powershell
# Test status
curl https://your-project.vercel.app/api/status

# Test command
curl -X POST https://your-project.vercel.app/api/command -H "Content-Type: application/json" -d "{\"command\":\"start\"}"
```

---

## 📱 What You'll See

1. **Dashboard** - System control panel
2. **Monitoring** - Real-time sensor data
3. **Alerts** - Notification history

All pages are:
- ✅ Mobile responsive
- ✅ Auto-refreshing
- ✅ Professionally designed

---

## 🎯 Competition Ready!

Your system is now:
- 🌐 Live on the internet
- 📱 Accessible from any device
- 🔒 Secured with HTTPS
- 🚀 Ready to demo

---

## 🆘 Need Help?

See detailed guides:
- [DEPLOYMENT.md](file:///c:/Users/marcu/Desktop/Smart%20Solar%20APP/DEPLOYMENT.md) - Complete deployment guide
- [API_DOCUMENTATION.md](file:///c:/Users/marcu/Desktop/Smart%20Solar%20APP/API_DOCUMENTATION.md) - API reference
- [README.md](file:///c:/Users/marcu/Desktop/Smart%20Solar%20APP/README.md) - Project overview

---

## 🎓 For Judges

**One-sentence explanation:**
> "A cloud-hosted IoT dashboard for remotely monitoring and controlling a solar-powered water purification system using an ESP32 microcontroller."

**Tech stack:**
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js Serverless (Vercel)
- Hardware: ESP32
- Protocol: HTTP REST APIs

---

**Good luck with your competition! 🏆**
