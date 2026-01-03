# 🚀 IFITB MULTIDOMAIN - Quick Reference

## ⚡ Quick Start (Copy & Paste)

```bash
# 1. Setup database (make sure PostgreSQL is running)
./setup.sh

# 2. Start the server
npm run dev

# 3. Open browser
open http://localhost:3000
```

## 🔑 Login Credentials

| Role  | Email              | Password   |
|-------|-------------------|------------|
| Admin | admin@ifitb.site  | Admin@123  |
| User  | user@example.com  | User@123   |

## 📝 Common Commands

```bash
# Development
npm run dev                    # Start dev server with auto-reload
npm run build:css             # Build Tailwind CSS

# Database
npm run db:generate           # Generate Prisma client
npm run db:push              # Push schema to database
npm run db:migrate           # Create migration
npm run db:seed              # Seed database
npm run db:studio            # Open Prisma Studio GUI

# Full setup
npm run setup                # Install + generate + push + seed
```

## 🌐 URLs

| Page              | URL                              |
|-------------------|----------------------------------|
| Landing           | http://localhost:3000            |
| Login             | http://localhost:3000/login      |
| Admin Dashboard   | http://localhost:3000/admin/dashboard |
| User Dashboard    | http://localhost:3000/user/dashboard  |
| Prisma Studio     | http://localhost:5555            |

## 📁 Key Files

| File                          | Purpose                    |
|-------------------------------|----------------------------|
| `src/server.js`               | Server entry point         |
| `src/app.js`                  | Express configuration      |
| `prisma/schema.prisma`        | Database schema            |
| `src/services/dns.mock.service.js` | Mock DNS (swap here!) |
| `.env`                        | Environment config         |

## 🎯 Typical Workflow

### As Admin:
1. Login → Domains → Add Domain (`example.com`)
2. Users → Create User (`newuser@test.com`)
3. Assignments → Assign Domain to User
4. View all subdomains system-wide

### As User:
1. Login → Dashboard (see assigned domains)
2. Create Subdomain → Select domain → Enter name (`api`)
3. Check availability → Choose type (A/CNAME) → Enter target
4. Manage Subdomains → Edit/Delete as needed

## 🔧 Troubleshooting

| Issue                     | Solution                          |
|---------------------------|-----------------------------------|
| Database connection error | Check PostgreSQL is running       |
| Port 3000 in use         | Change PORT in `.env`             |
| CSS not loading          | Run `npm run build:css`           |
| Prisma errors            | Run `npx prisma generate`         |

## 📊 Database Schema Quick View

```
User (email, password, role)
  ↓
DomainUser (assignment table)
  ↓
Domain (rootDomain, status)
  ↓
Subdomain (name, type, target, status)
```

## 🎨 UI Components Available

- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- Cards: `.card`, `.card-header`, `.card-body`
- Forms: `.form-input`, `.form-select`, `.form-label`
- Tables: `.data-table`
- Badges: `.badge-success`, `.badge-warning`, `.badge-danger`
- Modals: Use `UI.showModal(id)` and `UI.hideModal(id)`
- Notifications: Use `UI.showNotification(message, type)`

## 🔐 Security Checklist

- ✅ JWT tokens in HTTP-only cookies
- ✅ Passwords hashed with bcrypt
- ✅ Role-based access control
- ✅ Input validation with Zod
- ✅ Rate limiting on API
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (Helmet)

## 🚀 Deployment Checklist

Before deploying to production:

1. ✅ Change `JWT_SECRET` in `.env` to a strong random string
2. ✅ Update `DATABASE_URL` with production database
3. ✅ Set `NODE_ENV=production`
4. ✅ Change default admin password
5. ✅ Enable HTTPS
6. ✅ Set up proper logging
7. ✅ Configure CORS if needed
8. ✅ Set up monitoring

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT_SUMMARY.md` - Complete feature list
- `QUICK_REFERENCE.md` - This file!

## 🎯 Next Phase (Real DNS Integration)

To swap mock DNS with real provider:

1. Create new service: `src/services/dns.cloudflare.service.js`
2. Implement same interface as `dns.mock.service.js`
3. Update imports in controllers
4. Add API credentials to `.env`
5. Test thoroughly!

The architecture is designed for this swap! 🎉

---

**Need Help?** Check SETUP_GUIDE.md for detailed instructions!
