# IFITB MULTIDOMAIN

<img src="https://socialify.git.ci/yogiputrap/multi-domain-management/image?custom_language=Next.js&language=1&name=1&owner=1&stargazers=1&theme=Light" alt="multi-domain-management" width="640" height="320" />

**Multi-Domain Subdomain Management Platform**

A production-grade SaaS platform for managing subdomains across multiple root domains with role-based access control.

## 🚀 Features

- **Multi-Domain Support**: Manage unlimited root domains from a single dashboard
- **User Management**: Create users and assign specific domains to each
- **Role-Based Access**: Admin and User roles with different permissions
- **Subdomain Management**: Create, update, and delete subdomains with A and CNAME records
- **Cloudflare DNS Integration**: Real DNS provisioning via Cloudflare API
- **Mock DNS Fallback**: Automatic fallback to mock DNS when Cloudflare is unavailable
- **Automatic Provider Selection**: Smart switching between Cloudflare and Mock DNS
- **Beautiful UI**: Modern, responsive SaaS-style interface with TailwindCSS
- **Secure**: JWT authentication, rate limiting, input validation

## 📋 Tech Stack

### Backend
- Node.js (LTS)
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt
- Zod validation

### Frontend
- EJS (Server-side rendering)
- TailwindCSS
- Vanilla JavaScript

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+

### Setup

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**:
```bash
npm run setup
```

This will:
- Generate Prisma client
- Push schema to database
- Seed with default data

4. **Build CSS** (in a separate terminal):
```bash
npm run build:css
```

5. **Start the server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔑 Default Credentials

**Admin Account**:
- Email: `admin@ifitb.site`
- Password: `Admin@123`

**User Account**:
- Email: `user@example.com`
- Password: `User@123`

## 📁 Project Structure

```
src/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── routes/                # Route definitions
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── user.routes.js
│   └── api.routes.js
├── controllers/           # Request handlers
│   ├── auth.controller.js
│   ├── admin.controller.js
│   └── user.controller.js
├── services/              # Business logic
│   ├── auth.service.js
│   ├── domain.service.js
│   ├── dns.service.js         # Unified DNS service
│   ├── cloudflare.service.js  # Cloudflare API integration
│   └── dns.mock.service.js    # Mock DNS (fallback)
├── middlewares/           # Express middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
├── utils/                 # Utilities
│   ├── prisma.js
│   └── validators.js
├── views/                 # EJS templates
│   ├── public/
│   ├── admin/
│   ├── user/
│   ├── partials/
│   └── errors/
└── public/                # Static assets
    ├── css/
    └── js/
```

## 🎯 Usage

### Admin Functions

1. **Add Domain**: Navigate to Domains → Add Domain
2. **Create User**: Navigate to Users → Create User
3. **Assign Domain**: Navigate to Assignments → Assign Domain to User
4. **View All Subdomains**: Navigate to All Subdomains

### User Functions

1. **View Assigned Domains**: Check dashboard
2. **Create Subdomain**: 
   - Select domain
   - Enter subdomain name
   - Check availability
   - Choose record type (A or CNAME)
   - Enter target
   - Submit
3. **Manage Subdomains**: View, edit, or delete your subdomains

## 🌐 Cloudflare DNS Integration

The platform now supports **real DNS provisioning** via Cloudflare API!

### Setup Cloudflare

1. **Get API Token**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Create token with "Edit zone DNS" permissions

2. **Get Zone ID**:
   - Go to your domain's overview page
   - Copy Zone ID from the right sidebar

3. **Add Domain with Credentials**:
   - Login as Admin
   - Go to Domains → Add Domain
   - Enter root domain, API token, and Zone ID

4. **Create Subdomains**:
   - Users can now create subdomains
   - System automatically uses Cloudflare if credentials exist
   - Falls back to Mock DNS if Cloudflare fails

### How It Works

- **With Cloudflare**: Real DNS records created via API
- **Without Cloudflare**: Mock DNS (database only)
- **Automatic Selection**: Based on domain configuration
- **Graceful Fallback**: Mock DNS if Cloudflare fails

See [CLOUDFLARE_INTEGRATION.md](./CLOUDFLARE_INTEGRATION.md) for detailed documentation.

## 🔒 Security Features

- HTTP-only JWT cookies
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection protection (Prisma ORM)
- XSS protection (Helmet.js)

## 📝 API Endpoints

### Authentication
- `POST /login` - User login
- `GET /logout` - User logout

### Admin API
- `POST /api/admin/domains` - Create domain
- `PUT /api/admin/domains/:id/status` - Update domain status
- `DELETE /api/admin/domains/:id` - Delete domain
- `POST /api/admin/users` - Create user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/assignments` - Assign domain to user
- `DELETE /api/admin/assignments` - Remove assignment

### User API
- `GET /api/user/domains` - Get user's domains
- `GET /api/user/subdomains` - Get user's subdomains
- `POST /api/user/subdomains/check` - Check subdomain availability
- `POST /api/user/subdomains` - Create subdomain
- `PUT /api/user/subdomains/:id` - Update subdomain
- `DELETE /api/user/subdomains/:id` - Delete subdomain

## 🧪 Development

```bash
# Run in development mode with auto-reload
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Build Tailwind CSS
npm run build:css
```

## 📄 License

MIT

## 👥 Author
**Built with ❤️**
