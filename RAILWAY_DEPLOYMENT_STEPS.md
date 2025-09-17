# 🚂 Railway Deployment Steps - BookNexus Social

## ✅ **Pre-Flight Check**

Your app is ready to deploy! You have:
- ✅ Docker configurations for backend and frontend
- ✅ Railway configuration files
- ✅ GitHub repository with CI/CD pipeline
- ✅ Environment variables configured

---

## 🚀 **Step-by-Step Deployment**

### **STEP 1: Push Your Code to GitHub**

```bash
# Make sure all changes are committed and pushed
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

**✅ This triggers your CI/CD pipeline and builds Docker images**

---

### **STEP 2: Create Railway Account & Project**

1. **Go to [railway.app](https://railway.app)**
2. **Click "Login with GitHub"**
3. **Authorize Railway** to access your repositories
4. **Click "New Project"**
5. **Select "Deploy from GitHub repo"**
6. **Choose `booknexus-social` repository**

**🎉 Railway creates your first service automatically!**

---

### **STEP 3: Set Up Backend Service**

Railway should detect your backend automatically, but let's verify:

1. **In Railway Dashboard** → Your Project
2. **Click on the service** (should show Spring Boot/Java)
3. **Go to "Settings" tab**
4. **Verify it's using `docker/backend/Dockerfile`**

**Add Environment Variables:**
1. **Click "Variables" tab**
2. **Add these variables:**

```bash
EMAIL_USERNAME=booknexus.bookworms@gmail.com
EMAIL_PASSWORD=xmlahhfratfkvjzr
JWT_SECURITY=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
SERVER_PORT=8080
ACTIVE_PROFILE=prod
```

3. **Click "Deploy"** to restart with new variables

---

### **STEP 4: Add PostgreSQL Database**

1. **In your Railway project** → **"+ New Service"**
2. **Click "Database"**
3. **Select "PostgreSQL"**
4. **Railway automatically provisions and connects it!**

**✅ Database connection is automatic - no manual configuration needed**

---

### **STEP 5: Add Frontend Service**

1. **In your Railway project** → **"+ New Service"**
2. **Click "Deploy from GitHub repo"**
3. **Select `booknexus-social` again**
4. **Railway should detect frontend configuration**

**Verify Frontend Settings:**
1. **Click on frontend service**
2. **Go to "Settings"**
3. **Ensure it's using `docker/frontend/Dockerfile`**

---

### **STEP 6: Configure Frontend to Connect to Backend**

1. **In Frontend service** → **"Variables" tab**
2. **Add this variable:**

```bash
REACT_APP_API_URL=https://[YOUR-BACKEND-URL].railway.app
```

**To get your backend URL:**
1. **Go to Backend service** → **"Settings"** → **"Domains"**
2. **Copy the Railway-provided URL** (e.g., `backend-production-abc123.up.railway.app`)
3. **Use that URL in the frontend environment variable**

---

### **STEP 7: Test Your Deployment**

1. **Backend Health Check:**
   - Visit: `https://[your-backend-url].railway.app/api/v1/health`
   - Should return 403 (this is correct - means API is running)

2. **Frontend Check:**
   - Visit: `https://[your-frontend-url].railway.app`
   - Should load your React app

3. **Database Connection:**
   - Check backend logs in Railway dashboard
   - Should show successful database connection

---

### **STEP 8: Custom Domain (Optional)**

1. **In Frontend service** → **"Settings"** → **"Domains"**
2. **Click "Custom Domain"**
3. **Add your domain** (e.g., `booknexus.com`)
4. **Update DNS** with provided CNAME record

---

## 🔧 **Configuration Summary**

Your Railway project will have **3 services:**

| Service | Type | URL | Purpose |
|---------|------|-----|---------|
| **Backend** | Spring Boot API | `backend-xxx.railway.app` | API endpoints |
| **Frontend** | React + Nginx | `frontend-xxx.railway.app` | User interface |
| **Database** | PostgreSQL | Internal only | Data storage |

---

## 💰 **Cost Estimation**

- **Backend Service**: ~$3/month
- **Frontend Service**: ~$2/month
- **Database**: Free (included)
- **Total**: ~$5/month (covered by free credit!)

---

## 🐛 **Troubleshooting**

### **Backend Won't Start:**
1. Check environment variables are set correctly
2. View logs in Railway dashboard
3. Ensure DATABASE_URL is automatically provided

### **Frontend Can't Connect to Backend:**
1. Verify REACT_APP_API_URL is set correctly
2. Check CORS settings allow Railway domains
3. Ensure backend is running and accessible

### **Database Connection Issues:**
1. Railway auto-connects PostgreSQL
2. Check backend logs for connection errors
3. Verify DATABASE_URL environment variable exists

---

## 🎯 **Next Steps After Deployment**

1. **Test all functionality:**
   - User registration
   - Email sending
   - Book management
   - Social features

2. **Monitor usage:**
   - Check Railway dashboard for resource usage
   - Monitor within free tier limits

3. **Set up custom domain:**
   - Point your domain to Railway
   - Configure SSL (automatic)

---

## 🚀 **You're Ready to Deploy!**

Follow these steps and your BookNexus Social app will be live and accessible to users worldwide!

**Need help?** Check Railway's excellent documentation or their Discord community.

---

**Total Deployment Time: ~15-20 minutes** ⏱️