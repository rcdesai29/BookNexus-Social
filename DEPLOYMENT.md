# BookNexus Social - Deployment Guide

## 🚀 CI/CD Pipeline Overview

This project uses GitHub Actions for automated building, testing, and deployment to Docker Hub.

## 📋 Prerequisites

### GitHub Repository Secrets (Required)

These secrets are already configured in your repository:

```bash
✅ DOCKERHUB_USERNAME     # Your Docker Hub username
✅ DOCKERHUB_TOKEN        # Your Docker Hub access token
✅ DB_USERNAME            # Production database username
✅ DB_PASSWORD            # Production database password
✅ EMAIL_USERNAME         # booknexus.bookworms@gmail.com
✅ EMAIL_PASSWORD         # Gmail app password (xmlahhfratfkvjzr)
✅ JWT_SECURITY           # JWT secret key for token signing
```

## 🔄 CI/CD Pipeline Workflow

### Trigger Events
- **Push to `main`**: Full CI/CD pipeline (build → test → deploy)
- **Push to `develop`**: Build and test only
- **Pull Request to `main`**: Build and test only

### Pipeline Stages

1. **Build & Test**
   - ✅ Backend: Maven tests with JDK 21
   - ✅ Frontend: npm tests with Node.js 18
   - ✅ Security scanning with Trivy

2. **Build & Push Images**
   - ✅ Backend: `booknexus-social-api:latest`
   - ✅ Frontend: `booknexus-social-frontend:latest`
   - ✅ Multi-platform support (amd64, arm64)
   - ✅ Pushed to Docker Hub

3. **Deploy**
   - ✅ Creates deployment artifacts
   - ✅ Generates production environment file
   - ✅ Ready for server deployment

## 🐳 Docker Images

Your images are built and pushed to:
- `[YOUR_DOCKERHUB_USERNAME]/booknexus-social-api:latest`
- `[YOUR_DOCKERHUB_USERNAME]/booknexus-social-frontend:latest`

## 🚀 Deployment Options

### Option 1: Local Production Testing

```bash
# Test production configuration locally
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Server Deployment

1. **Download deployment artifacts** from GitHub Actions
2. **Copy to your server**:
   ```bash
   scp deployment/* user@server:/path/to/app/
   ```
3. **Deploy on server**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 3: Automated Server Deployment

To enable automatic deployment to your server, uncomment and configure the deploy step in `.github/workflows/ci-cd.yml`:

```yaml
# Add these secrets to GitHub:
HOST: your-server-ip
USERNAME: your-server-username
SSH_KEY: your-private-ssh-key
```

## 🔧 Environment Configuration

### Development (Local)
- Uses `.env` file in backend folder
- Fallback defaults in docker-compose.yml

### Production
- Uses GitHub Secrets
- Configured in docker-compose.prod.yml

### Environment Variable Mapping

| GitHub Secret | Environment Variable | Purpose |
|---------------|---------------------|---------|
| `EMAIL_USERNAME` | `MAIL_USERNAME` | Gmail account for notifications |
| `EMAIL_PASSWORD` | `MAIL_PASSWORD` | Gmail app password |
| `JWT_SECURITY` | `JWT_SECRET_KEY` | JWT token signing |
| `DB_USERNAME` | `DB_USERNAME` | Database user |
| `DB_PASSWORD` | `DB_PASSWORD` | Database password |

## 🛡️ Security Features

- ✅ **No secrets in code**: All sensitive data in GitHub Secrets
- ✅ **Security scanning**: Trivy vulnerability scanner
- ✅ **Multi-stage builds**: Optimized Docker images
- ✅ **Production environment**: Separate prod configuration

## 📊 Monitoring & Logs

### Check deployment status:
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View logs:
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs booknexus_social-api
```

### Health checks:
- **Frontend**: http://your-domain:3000
- **Backend API**: http://your-domain:8001
- **Database**: Internal only (port 5432)

## 🚨 Troubleshooting

### Common Issues

1. **Email not working**: Check `EMAIL_USERNAME` and `EMAIL_PASSWORD` secrets
2. **Database connection failed**: Verify `DB_USERNAME` and `DB_PASSWORD`
3. **JWT errors**: Ensure `JWT_SECURITY` secret is set
4. **Build failures**: Check Docker Hub credentials

### Debug Commands

```bash
# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View detailed logs
docker-compose -f docker-compose.prod.yml logs --follow
```

## 🔄 Update Deployment

1. **Push to main branch** - triggers automatic rebuild
2. **Pull latest images** on server:
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📞 Support

- **Email**: booknexus.bookworms@gmail.com
- **GitHub Issues**: Create an issue in the repository
- **Logs**: Always check Docker logs first

---

✅ **Your CI/CD pipeline is fully configured and ready to deploy!**