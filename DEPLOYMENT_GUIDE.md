# 🚀 Deployment Guide - Zeabur

## Overview

This guide will help you deploy IFITB MULTIDOMAIN to Zeabur platform.

---

## 📋 Prerequisites

1. **Zeabur Account**: Sign up at [zeabur.com](https://zeabur.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Use Zeabur's PostgreSQL or SQLite

---

## 🗄️ Database Options

### **Option 1: SQLite (Recommended for Testing)**

SQLite is file-based and works out of the box. Perfect for testing and small deployments.

**Pros:**
- ✅ No external database needed
- ✅ Zero configuration
- ✅ Fast setup
- ✅ Free

**Cons:**
- ❌ Not suitable for high traffic
- ❌ Single file storage
- ❌ Limited concurrent writes

### **Option 2: PostgreSQL (Recommended for Production)**

PostgreSQL is a robust, production-grade database.

**Pros:**
- ✅ Production-ready
- ✅ Handles high traffic
- ✅ Better concurrency
- ✅ Scalable

**Cons:**
- ❌ Requires configuration
- ❌ May have costs

---

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Your Code**

1. **Ensure `.gitignore` is correct**:
```bash
# Check .gitignore includes:
node_modules/
.env
*.db
*.db-journal
prisma/dev.db
```

2. **Commit and push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Create Zeabur Project**

1. Go to [Zeabur Dashboard](https://dash.zeabur.com)
2. Click **"Create Project"**
3. Choose **"Deploy from GitHub"**
4. Select your repository
5. Zeabur will auto-detect Node.js

### **Step 3: Configure Database**

#### **For SQLite (Simple):**

1. In Zeabur dashboard, go to **Environment Variables**
2. Add:
```
DATABASE_URL=file:./prod.db
```

#### **For PostgreSQL (Production):**

1. In Zeabur, click **"Add Service"** → **"PostgreSQL"**
2. Zeabur will create a PostgreSQL instance
3. Copy the connection string
4. Add to Environment Variables:
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

### **Step 4: Set Environment Variables**

In Zeabur dashboard, add these environment variables:

```bash
# Database
DATABASE_URL=file:./prod.db  # or PostgreSQL URL

# JWT Secret (IMPORTANT: Generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration
JWT_EXPIRES_IN=7d

# Server Port (Zeabur auto-assigns, but set default)
PORT=8080

# Node Environment
NODE_ENV=production

# Admin Credentials (Optional - for seed)
ADMIN_EMAIL=admin@ifitb.site
ADMIN_PASSWORD=Admin@123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 5: Configure Build Settings**

Zeabur should auto-detect, but you can customize:

1. **Build Command**:
```bash
npm install && npx prisma generate && npm run build:css
```

2. **Start Command**:
```bash
npm start
```

### **Step 6: Database Initialization**

After first deployment, you need to initialize the database:

#### **Option A: Using Zeabur Console**

1. In Zeabur dashboard, open **Terminal/Console**
2. Run:
```bash
npx prisma db push --accept-data-loss
npx prisma db seed
```

#### **Option B: Automatic on Build**

Create `zeabur.json` in project root:

```json
{
  "build": {
    "commands": [
      "npm install",
      "npx prisma generate",
      "npx prisma db push --accept-data-loss || true",
      "npx prisma db seed || true",
      "npm run build:css"
    ]
  },
  "start": {
    "command": "npm start"
  }
}
```

### **Step 7: Deploy**

1. Click **"Deploy"** in Zeabur
2. Wait for build to complete (2-5 minutes)
3. Zeabur will provide a URL: `https://your-app.zeabur.app`

---

## 🔐 Security Checklist

Before going to production:

- [ ] **Change JWT_SECRET** to a strong random string
- [ ] **Change Admin Password** immediately after first login
- [ ] **Enable HTTPS** (Zeabur provides this automatically)
- [ ] **Set NODE_ENV** to `production`
- [ ] **Review Rate Limits** based on expected traffic
- [ ] **Backup Database** regularly (if using PostgreSQL)
- [ ] **Monitor Logs** in Zeabur dashboard

---

## 🐛 Troubleshooting

### **Error: "Environment variable not found: DATABASE_URL"**

**Solution:**
1. Go to Zeabur dashboard → Your project → **Variables**
2. Add `DATABASE_URL` with value:
   - SQLite: `file:./prod.db`
   - PostgreSQL: Your connection string

### **Error: "Prisma Client not generated"**

**Solution:**
Add to build command:
```bash
npx prisma generate
```

### **Error: "Database does not exist"**

**Solution:**
Run in Zeabur console:
```bash
npx prisma db push
```

### **Error: "Port already in use"**

**Solution:**
Zeabur auto-assigns ports. Make sure your `server.js` uses:
```javascript
const PORT = process.env.PORT || 3000;
```

### **Error: "Cannot find module 'prisma'"**

**Solution:**
Ensure `prisma` is in `dependencies`, not `devDependencies`:
```bash
npm install --save prisma @prisma/client
```

### **Database Connection Timeout**

**Solution:**
If using PostgreSQL, add connection pooling:
```
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=5&pool_timeout=10
```

---

## 📊 Monitoring

### **Check Logs**

In Zeabur dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Monitor for errors

### **Health Check**

Add to your `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

Access: `https://your-app.zeabur.app/health`

---

## 🔄 Updates & Redeployment

### **Automatic Deployment**

Zeabur can auto-deploy on git push:
1. In Zeabur dashboard, enable **"Auto Deploy"**
2. Push to GitHub:
```bash
git push origin main
```
3. Zeabur will automatically rebuild and deploy

### **Manual Deployment**

1. Go to Zeabur dashboard
2. Click **"Redeploy"**

---

## 🗃️ Database Migration

### **For Schema Changes**

1. Update `prisma/schema.prisma`
2. Commit and push
3. In Zeabur console, run:
```bash
npx prisma db push
```

### **For Data Migration**

Create migration scripts in `prisma/migrations/` and run:
```bash
npx prisma migrate deploy
```

---

## 💾 Backup & Restore

### **SQLite Backup**

1. Download `prod.db` from Zeabur file system
2. Store securely

### **PostgreSQL Backup**

Use Zeabur's built-in backup feature or:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### **Restore**

```bash
psql $DATABASE_URL < backup.sql
```

---

## 🌐 Custom Domain

1. In Zeabur dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `app.yourdomain.com`
4. Add DNS records as instructed by Zeabur
5. Wait for SSL certificate (automatic)

---

## 📈 Scaling

### **Vertical Scaling**

Upgrade your Zeabur plan for more resources:
- More CPU
- More RAM
- More storage

### **Horizontal Scaling**

For high traffic:
1. Use PostgreSQL (not SQLite)
2. Enable connection pooling
3. Consider Redis for sessions
4. Use CDN for static assets

---

## 🔧 Environment-Specific Configuration

### **Development**
```bash
NODE_ENV=development
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret
```

### **Production**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=super-secure-random-string-here
```

---

## 📝 Deployment Checklist

Before deploying:

- [ ] All environment variables set in Zeabur
- [ ] `DATABASE_URL` configured
- [ ] `JWT_SECRET` is strong and unique
- [ ] Admin password will be changed after first login
- [ ] `.gitignore` excludes `.env` and `*.db`
- [ ] Code pushed to GitHub
- [ ] Build command includes `prisma generate`
- [ ] Database will be initialized (push + seed)
- [ ] Logs monitored during first deployment

---

## 🎯 Quick Start Commands

```bash
# 1. Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Test locally before deploy
npm run dev

# 3. Build CSS
npm run build:css

# 4. Test production build
NODE_ENV=production npm start

# 5. Initialize database (in Zeabur console)
npx prisma db push && npx prisma db seed
```

---

## 🆘 Support

If you encounter issues:

1. **Check Zeabur Logs**: Dashboard → Logs
2. **Check Database Connection**: Verify `DATABASE_URL`
3. **Check Environment Variables**: All required vars set?
4. **Check Build Logs**: Any errors during build?
5. **Check Prisma**: Run `npx prisma validate`

---

## 📚 Additional Resources

- [Zeabur Documentation](https://zeabur.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Post-Deployment

After successful deployment:

1. **Test Login**: Try admin and user accounts
2. **Create Test Domain**: Verify domain creation works
3. **Create Test Subdomain**: Verify DNS service works
4. **Check Cloudflare**: If using Cloudflare, test DNS provisioning
5. **Monitor Performance**: Check response times
6. **Set Up Monitoring**: Use Zeabur's monitoring tools

---

**Deployment Complete! 🎉**

Your IFITB MULTIDOMAIN platform is now live on Zeabur!

