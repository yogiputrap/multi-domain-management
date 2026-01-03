# IFITB MULTIDOMAIN - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IFITB MULTIDOMAIN                            │
│                  Multi-Domain Subdomain Management                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Landing    │  │    Login     │  │   Public     │              │
│  │     Page     │  │     Page     │  │    Pages     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              ADMIN PANEL (Role: ADMIN)                     │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Dashboard      • Domain Management                      │     │
│  │  • User Management • Domain Assignments                    │     │
│  │  • All Subdomains View                                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              USER PANEL (Role: USER)                       │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Dashboard      • Create Subdomain                       │     │
│  │  • My Subdomains  • Domain Details                         │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  Technology: EJS Templates + TailwindCSS + Vanilla JS                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ROUTING LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Auth Routes  │  │ Admin Routes │  │ User Routes  │              │
│  │ /login       │  │ /admin/*     │  │ /user/*      │              │
│  │ /logout      │  │ /api/admin/* │  │ /api/user/*  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  Technology: Express.js Router                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MIDDLEWARE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     Auth     │  │  Validation  │  │    Error     │              │
│  │  Middleware  │  │  Middleware  │  │   Handler    │              │
│  │              │  │              │  │              │              │
│  │ • JWT verify │  │ • Zod schema │  │ • Centralized│              │
│  │ • Role check │  │ • Input val  │  │ • Logging    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ Rate Limiter │  │   Security   │                                 │
│  │              │  │   (Helmet)   │                                 │
│  └──────────────┘  └──────────────┘                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     Auth     │  │    Admin     │  │     User     │              │
│  │  Controller  │  │  Controller  │  │  Controller  │              │
│  │              │  │              │  │              │              │
│  │ • Login      │  │ • Domains    │  │ • Subdomains │              │
│  │ • Logout     │  │ • Users      │  │ • Check DNS  │              │
│  │              │  │ • Assignments│  │ • Create     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  Request Handling & Response Formatting                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     Auth     │  │    Domain    │  │  Mock DNS    │              │
│  │   Service    │  │   Service    │  │   Service    │              │
│  │              │  │              │  │              │              │
│  │ • JWT gen    │  │ • CRUD ops   │  │ • Check avail│  ◄─ SWAPPABLE!
│  │ • Password   │  │ • Assignments│  │ • Create rec │              │
│  │ • User mgmt  │  │              │  │ • Mock delay │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  Business Logic & Data Processing                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    PRISMA ORM                              │     │
│  │  • Type-safe queries  • Migrations  • Relations            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                    │                                 │
│                                    ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                  POSTGRESQL DATABASE                       │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │                                                            │     │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────┐ │     │
│  │  │   User   │  │  Domain  │  │ DomainUser │  │Subdomain│ │     │
│  │  ├──────────┤  ├──────────┤  ├────────────┤  ├─────────┤ │     │
│  │  │ id       │  │ id       │  │ id         │  │ id      │ │     │
│  │  │ email    │  │ rootDom  │  │ domainId   │  │ name    │ │     │
│  │  │ password │  │ status   │  │ userId     │  │ type    │ │     │
│  │  │ role     │  │ created  │  │ created    │  │ target  │ │     │
│  │  └──────────┘  └──────────┘  └────────────┘  │ status  │ │     │
│  │                                               │ created │ │     │
│  │                                               └─────────┘ │     │
│  │                                                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW EXAMPLE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USER ACTION: Create Subdomain "api.example.com"                     │
│                                                                       │
│  1. Browser → POST /api/user/subdomains                              │
│                                                                       │
│  2. Middleware:                                                       │
│     ✓ Authenticate (JWT)                                             │
│     ✓ Validate input (Zod)                                           │
│                                                                       │
│  3. Controller:                                                       │
│     • Parse request                                                   │
│     • Check user has access to domain                                │
│                                                                       │
│  4. Service Layer:                                                    │
│     • DNS Service: Check availability (mock delay 300-500ms)         │
│     • DNS Service: Create record (mock success)                      │
│     • Save to database via Prisma                                    │
│                                                                       │
│  5. Database:                                                         │
│     • INSERT INTO subdomains (...)                                   │
│     • Return created record                                          │
│                                                                       │
│  6. Response:                                                         │
│     • JSON: { success: true, subdomain: {...} }                      │
│     • Browser shows success notification                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 1: Network                                                     │
│  ├─ Rate Limiting (100 req/15min per IP)                             │
│  └─ Helmet.js (Security headers)                                     │
│                                                                       │
│  Layer 2: Authentication                                              │
│  ├─ JWT tokens (HTTP-only cookies)                                   │
│  ├─ Password hashing (bcrypt, 12 rounds)                             │
│  └─ Session management                                               │
│                                                                       │
│  Layer 3: Authorization                                               │
│  ├─ Role-based access control                                        │
│  ├─ Resource ownership checks                                        │
│  └─ Domain assignment verification                                   │
│                                                                       │
│  Layer 4: Input Validation                                            │
│  ├─ Zod schemas on all inputs                                        │
│  ├─ Type checking                                                     │
│  └─ Format validation (email, domain, etc.)                          │
│                                                                       │
│  Layer 5: Database                                                    │
│  ├─ Prisma ORM (SQL injection protection)                            │
│  ├─ Parameterized queries                                            │
│  └─ Foreign key constraints                                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│               FUTURE: REAL DNS INTEGRATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Current:  dns.mock.service.js  (Simulated DNS)                      │
│                                                                       │
│  Future Options:                                                      │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Cloudflare  │  │ AWS Route53  │  │ Google Cloud │              │
│  │     DNS      │  │              │  │     DNS      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ DigitalOcean │  │   Custom     │                                 │
│  │     DNS      │  │   DNS API    │                                 │
│  └──────────────┘  └──────────────┘                                 │
│                                                                       │
│  Implementation:                                                      │
│  1. Create new service file (e.g., dns.cloudflare.service.js)       │
│  2. Implement same interface as mock service                         │
│  3. Add API credentials to .env                                      │
│  4. Update service import in controllers                             │
│  5. No controller changes needed! ✨                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer          | Technology                    |
|----------------|-------------------------------|
| Frontend       | EJS + TailwindCSS + Vanilla JS|
| Backend        | Node.js + Express.js          |
| Database       | PostgreSQL                    |
| ORM            | Prisma                        |
| Authentication | JWT + bcrypt                  |
| Validation     | Zod                           |
| Security       | Helmet.js + Rate Limiting     |
| DNS (Phase 1)  | Mock Service (Swappable)      |

## Key Design Principles

1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Swappable Services** - DNS service can be easily replaced
3. **Security First** - Multiple layers of security
4. **Type Safety** - Zod validation + Prisma types
5. **Clean Architecture** - MVC pattern with service layer
6. **Scalable** - Easy to add new features
7. **Maintainable** - Clear structure and documentation

---

**This architecture supports both current mock implementation and future real DNS integration seamlessly!**
