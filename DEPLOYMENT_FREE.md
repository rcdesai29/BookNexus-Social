# 🆓 Free Deployment Guide - BookNexus Social

## 🚀 Quick Start: Deploy to Railway (Recommended)

### Step 1: Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 2: Deploy Your App
Railway deploys **BOTH** backend and frontend as separate services:

1. **Create New Project** in Railway
2. **Add Backend Service:**
   - "Deploy from GitHub repo"
   - Choose your `booknexus-social` repository
   - Railway detects `railway-backend.json`
3. **Add Frontend Service:**
   - In same project: "+ New Service"
   - "Deploy from GitHub repo"
   - Choose your `booknexus-social` repository again
   - Railway detects `railway-frontend.json`

### Step 3: Add Database
1. In Railway dashboard: **"+ New Service"**
2. **Select "PostgreSQL"**
3. Railway provides the connection details automatically

### Step 4: Set Environment Variables
In Railway dashboard, go to your backend service and add these variables:

```bash
EMAIL_USERNAME=booknexus.bookworms@gmail.com
EMAIL_PASSWORD=xmlahhfratfkvjzr
JWT_SECURITY=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

### Step 5: Deploy! 🎉
- Railway automatically deploys when you push to main
- Your app will be live at: `https://your-app.railway.app`

---

## 🔄 Alternative: Deploy to Render

### Step 1: Setup Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect repository

### Step 2: Create Services
1. **Create Web Service** (Backend)
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/book-nexus-1.0.0.jar`
   - Environment: Add all your secrets

2. **Create Static Site** (Frontend)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

3. **Create PostgreSQL Database**
   - Free for 90 days, then $7/month

---

## 🛠️ Manual Deployment Steps for Any Platform

### For VPS/Server Deployment:

1. **Clone your repository:**
   ```bash
   git clone https://github.com/your-username/booknexus-social.git
   cd booknexus-social
   ```

2. **Set environment variables:**
   ```bash
   export EMAIL_USERNAME=booknexus.bookworms@gmail.com
   export EMAIL_PASSWORD=xmlahhfratfkvjzr
   export JWT_SECURITY=your-jwt-secret
   export DB_USERNAME=your-db-user
   export DB_PASSWORD=your-db-password
   ```

3. **Deploy with Docker:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 🎯 Recommended Deployment Flow

### For Development/Testing:
1. **Railway** - Easiest, free $5 credit monthly
2. **Render** - Good alternative with generous free tier

### For Production:
1. **Railway Pro** - $5/month per service
2. **DigitalOcean** - $4/month droplet
3. **AWS/GCP** - Free tier available

---

## 🔧 GitHub Actions Integration

Your existing CI/CD pipeline works with all platforms:

### Railway Integration:
Add to your GitHub secrets:
```bash
RAILWAY_TOKEN=your-railway-token
```

Then uncomment the deploy section in `.github/workflows/ci-cd.yml`

### Render Integration:
Render automatically deploys on git push - no extra configuration needed!

---

## 💰 Cost Breakdown

### Railway (Recommended):
- **Free**: $5 credit/month (usually sufficient)
- **Paid**: $5/month per service after credits

### Render:
- **Free**: 750 hours/month web service
- **Database**: $7/month PostgreSQL

### Self-hosted VPS:
- **DigitalOcean**: $4/month basic droplet
- **Linode**: $5/month nanode
- **Hetzner**: €3.29/month CX11

---

## 🚨 Important Notes

1. **Database**: Most free tiers don't include persistent databases
2. **Sleep Mode**: Free services may "sleep" after inactivity
3. **Custom Domain**: Usually requires paid plan
4. **HTTPS**: Most platforms provide free SSL certificates

---

## 🎉 Next Steps

1. **Choose your platform** (Railway recommended)
2. **Push your code** to GitHub main branch
3. **Connect repository** to chosen platform
4. **Add environment variables**
5. **Deploy and test!**

Your app will be live and accessible worldwide! 🌍

---

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **This Project**: Check GitHub issues or email booknexus.bookworms@gmail.com