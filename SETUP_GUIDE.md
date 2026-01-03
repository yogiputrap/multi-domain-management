# IFITB MULTIDOMAIN - Setup Guide

## 🎯 Quick Start (3 Steps)

### Step 1: Install PostgreSQL

**macOS (using Homebrew)**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Create Database**:
```bash
createdb ifitb_multidomain
```

### Step 2: Configure Environment

The `.env` file is already created with default settings:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ifitb_multidomain?schema=public"
```

**If your PostgreSQL has different credentials**, edit `.env`:
```bash
# Update with your PostgreSQL username and password
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/ifitb_multidomain?schema=public"
```

### Step 3: Initialize Database

Run the setup script:
```bash
./setup.sh
```

Or manually:
```bash
npx prisma db push
node prisma/seed.js
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### Build CSS (if needed)
In a separate terminal:
```bash
npm run build:css
```

## 🔑 Login Credentials

### Admin Account
- **Email**: `admin@ifitb.site`
- **Password**: `Admin@123`

### Test User Account
- **Email**: `user@example.com`
- **Password**: `User@123`

## 📱 Testing the Platform

### As Admin:

1. **Login** at http://localhost:3000/login with admin credentials
2. **Add a Domain**:
   - Go to "Domains" → Click "Add Domain"
   - Enter: `test.local` or `myapp.dev`
   - Click "Add Domain"

3. **Create a User**:
   - Go to "Users" → Click "Create User"
   - Email: `testuser@example.com`
   - Password: `Test@123`
   - Click "Create User"

4. **Assign Domain to User**:
   - Go to "Assignments" → Click "Assign Domain"
   - Select the user and domain
   - Click "Assign Domain"

### As User:

1. **Logout** and **Login** with user credentials
2. **Create a Subdomain**:
   - Go to "Create Subdomain"
   - Select your assigned domain
   - Enter subdomain name: `api`
   - Click "Check" to verify availability
   - Select record type: `A Record`
   - Enter target: `192.168.1.100`
   - Click "Create Subdomain"

3. **View Your Subdomains**:
   - Go to "My Subdomains"
   - See all your created subdomains
   - Edit or delete as needed

## 🗄️ Database Management

### View Database in Prisma Studio
```bash
npm run db:studio
```

Opens a GUI at http://localhost:5555 to browse your database

### Reset Database
```bash
npx prisma db push --force-reset
node prisma/seed.js
```

### Create Migration
```bash
npm run db:migrate
```

## 🔧 Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   brew services list
   ```

2. Verify database exists:
   ```bash
   psql -l | grep ifitb_multidomain
   ```

3. Test connection:
   ```bash
   psql -U postgres -d ifitb_multidomain
   ```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
1. Change port in `.env`:
   ```
   PORT=3001
   ```

2. Or kill the process using port 3000:
   ```bash
   lsof -ti:3000 | xargs kill
   ```

### CSS Not Loading

**Solution**:
```bash
npx tailwindcss -i ./src/public/css/input.css -o ./src/public/css/output.css --minify
```

## 📊 Project Structure Overview

```
multi-domain/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express configuration
│   ├── routes/                # API & page routes
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   │   └── dns.mock.service.js  # Mock DNS (swappable!)
│   ├── middlewares/           # Auth, validation, errors
│   ├── views/                 # EJS templates
│   │   ├── public/            # Landing & login
│   │   ├── admin/             # Admin panel
│   │   └── user/              # User dashboard
│   └── public/                # Static files
│       ├── css/
│       └── js/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed data
└── package.json
```

## 🎨 UI Features

- ✅ Beautiful SaaS-style interface
- ✅ Responsive design (mobile-friendly)
- ✅ Real-time availability checking
- ✅ Live subdomain preview
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Loading states
- ✅ Error handling

## 🔐 Security Features

- ✅ JWT authentication (HTTP-only cookies)
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (Helmet)

## 🚀 Next Steps (Phase 2)

To integrate with real DNS providers:

1. **Cloudflare Example**:
   - Create `src/services/dns.cloudflare.service.js`
   - Implement the same interface as mock service
   - Add Cloudflare API credentials to `.env`
   - Swap the service in controllers

2. **Other Providers**:
   - AWS Route53
   - Google Cloud DNS
   - DigitalOcean DNS
   - Custom DNS API

The architecture is designed to make this swap seamless!

## 📞 Support

For issues or questions:
1. Check this guide
2. Review the README.md
3. Check the code comments
4. Review Prisma documentation: https://www.prisma.io/docs

---

**Happy Coding! 🎉**
