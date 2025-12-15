# 🏗️ Vendra CRM - Arsitektur & Peta Proyek

## 📋 Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Struktur Proyek](#struktur-proyek)
- [Frontend (UI)](#frontend-ui)
- [Backend (API)](#backend-api)
- [Database](#database)
- [Libraries & Utilities](#libraries--utilities)
- [Deployment](#deployment)

---

## 🎯 Gambaran Umum

**Vendra CRM** adalah aplikasi Point of Sale (POS) dan Customer Relationship Management (CRM) berbasis web yang dibangun dengan teknologi modern:

- **Framework**: Next.js 15.2.3 (App Router)
- **Database**: MySQL 8.0 dengan Prisma ORM
- **Authentication**: NextAuth.js v4
- **UI**: React 19 + TailwindCSS
- **AI Integration**: OpenAI & Google Gemini
- **Deployment**: VPS Ubuntu + PM2

### Arsitektur
```
┌─────────────────────────────────────────────────────────────┐
│                    VENDRA CRM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   FRONTEND   │◄───┤  NEXT.JS APP │───►│   BACKEND    │ │
│  │  (UI Pages)  │    │    ROUTER    │    │  (API Routes)│ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                                         │         │
│         │                                         │         │
│         ▼                                         ▼         │
│  ┌──────────────┐                        ┌──────────────┐ │
│  │  COMPONENTS  │                        │  LIBRARIES   │ │
│  │   (React)    │                        │ (Services)   │ │
│  └──────────────┘                        └──────────────┘ │
│                                                   │         │
│                                                   ▼         │
│                                          ┌──────────────┐  │
│                                          │   PRISMA     │  │
│                                          │     ORM      │  │
│                                          └──────────────┘  │
│                                                   │         │
│                                                   ▼         │
│                                          ┌──────────────┐  │
│                                          │    MySQL     │  │
│                                          │   Database   │  │
│                                          └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Proyek

```
vercel/
├── src/
│   ├── app/                    # 🌐 FRONTEND & ROUTING (Next.js App Router)
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── kasir/             # Kasir (cashier) pages
│   │   ├── superadmin/        # Super admin pages
│   │   ├── auth/              # Authentication pages (signin/signup)
│   │   └── api/               # 🔌 BACKEND API ROUTES
│   │
│   ├── components/            # ⚛️ REACT COMPONENTS
│   │   ├── admin/            # Admin-specific components
│   │   ├── ui/               # Reusable UI components
│   │   └── vendra/           # Brand-specific components
│   │
│   ├── lib/                   # 📚 LIBRARIES & BUSINESS LOGIC
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   ├── geminiAI.ts       # Google Gemini AI integration
│   │   ├── openaiAI.ts       # OpenAI integration
│   │   └── ...               # Other services
│   │
│   └── types/                 # 📝 TypeScript type definitions
│
├── prisma/                    # 🗄️ DATABASE SCHEMA & MIGRATIONS
│   ├── schema.prisma         # Database schema definition
│   └── migrations/           # Database migration files
│
├── public/                    # 🖼️ STATIC ASSETS
│   ├── images/               # Images
│   └── uploads/              # User uploads
│
├── scripts/                   # 🛠️ UTILITY SCRIPTS
│   └── change-superadmin-password.js
│
├── package.json              # Dependencies
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables
```

---

## 🌐 Frontend (UI)

### Lokasi: `src/app/` (Pages & Routes)

Next.js App Router menggunakan **file-system based routing**. Setiap folder di `src/app/` menjadi route.

### 📍 Route Map

| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `src/app/page.tsx` | Landing page / Homepage |
| `/auth/signin` | `src/app/auth/signin/page.tsx` | Halaman login |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | Halaman registrasi |
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin utama |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Analytics & overview |
| `/admin/products` | `src/app/admin/products/page.tsx` | Manajemen produk |
| `/admin/transactions` | `src/app/admin/transactions/page.tsx` | History transaksi |
| `/admin/customers` | `src/app/admin/customers/page.tsx` | Manajemen customer |
| `/admin/stores` | `src/app/admin/stores/page.tsx` | Manajemen toko |
| `/admin/employees` | `src/app/admin/employees/page.tsx` | Manajemen karyawan |
| `/admin/reports` | `src/app/admin/reports/page.tsx` | Laporan penjualan |
| `/admin/ai-assistant` | `src/app/admin/ai-assistant/page.tsx` | AI Business Assistant |
| `/kasir` | `src/app/kasir/page.tsx` | Kasir POS interface |
| `/kasir/sales` | `src/app/kasir/sales/page.tsx` | Transaksi penjualan |
| `/superadmin` | `src/app/superadmin/page.tsx` | Super Admin dashboard |
| `/superadmin/users` | `src/app/superadmin/users/page.tsx` | User management |
| `/superadmin/monitoring` | `src/app/superadmin/monitoring/page.tsx` | System monitoring |

### 🧩 Components

#### Lokasi: `src/components/`

**Komponen Utama:**

```
src/components/
├── admin/                      # Admin Components
│   ├── DashboardStats.tsx     # Statistics cards
│   ├── ProductForm.tsx        # Form produk
│   ├── TransactionTable.tsx   # Tabel transaksi
│   └── ...
│
├── ui/                        # Reusable UI Components
│   ├── Button.tsx            # Button component
│   ├── Input.tsx             # Input field
│   ├── Modal.tsx             # Modal dialog
│   ├── Table.tsx             # Data table
│   └── ...
│
├── vendra/                    # Brand Components
│   ├── Header.tsx            # App header
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── Footer.tsx            # App footer
│
├── BarcodeGenerator.tsx       # Generate barcode
└── CustomerSearch.tsx         # Search customer
```

---

## 🔌 Backend (API)

### Lokasi: `src/app/api/` (API Routes)

Next.js API Routes = Backend RESTful API. Semua file `route.ts` adalah endpoint API.

### 🗺️ API Endpoint Map

#### 🔐 Authentication (`/api/auth/`)
```
src/app/api/auth/
├── [...nextauth]/route.ts          # POST   /api/auth/callback/*  - NextAuth handler
├── register/route.ts               # POST   /api/auth/register    - Register user baru
├── logout/route.ts                 # POST   /api/auth/logout      - Logout
├── forgot-password/route.ts        # POST   /api/auth/forgot-password
├── reset-password/route.ts         # POST   /api/auth/reset-password
├── verify-otp/route.ts             # POST   /api/auth/verify-otp
├── resend-otp/route.ts             # POST   /api/auth/resend-otp
├── upload-payment/route.ts         # POST   /api/auth/upload-payment
└── my-api-key/route.ts            # GET    /api/auth/my-api-key
```

**Contoh Request:**
```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "email": "owner@example.com",
  "password": "password123",
  "name": "John Doe",
  "companyName": "My Store"
}

# Login via NextAuth
POST /api/auth/callback/credentials
{
  "email": "owner@example.com",
  "password": "password123"
}
```

#### 👨‍💼 Admin API (`/api/admin/`)
```
src/app/api/admin/
├── products/
│   ├── route.ts                    # GET, POST    /api/admin/products
│   ├── [id]/route.ts              # GET, PUT, DELETE /api/admin/products/:id
│   ├── bulk-delete/route.ts       # POST   /api/admin/products/bulk-delete
│   ├── export/route.ts            # GET    /api/admin/products/export
│   └── search/route.ts            # GET    /api/admin/products/search
│
├── transactions/
│   ├── route.ts                    # GET, POST    /api/admin/transactions
│   ├── [id]/route.ts              # GET, PUT, DELETE /api/admin/transactions/:id
│   └── stats/route.ts             # GET    /api/admin/transactions/stats
│
├── customers/
│   ├── route.ts                    # GET, POST    /api/admin/customers
│   ├── [id]/route.ts              # GET, PUT, DELETE /api/admin/customers/:id
│   └── import/route.ts            # POST   /api/admin/customers/import
│
├── stores/
│   ├── route.ts                    # GET, POST    /api/admin/stores
│   └── [id]/route.ts              # GET, PUT, DELETE /api/admin/stores/:id
│
├── employees/
│   ├── route.ts                    # GET, POST    /api/admin/employees
│   └── [id]/route.ts              # GET, PUT, DELETE /api/admin/employees/:id
│
├── reports/
│   ├── sales/route.ts             # GET    /api/admin/reports/sales
│   ├── inventory/route.ts         # GET    /api/admin/reports/inventory
│   └── customers/route.ts         # GET    /api/admin/reports/customers
│
├── ai/
│   ├── chat/route.ts              # POST   /api/admin/ai/chat
│   ├── suggestions/route.ts       # GET    /api/admin/ai/suggestions
│   └── analyze/route.ts           # POST   /api/admin/ai/analyze
│
└── settings/
    ├── company/route.ts           # GET, PUT /api/admin/settings/company
    └── profile/route.ts           # GET, PUT /api/admin/settings/profile
```

**Contoh Request:**
```bash
# Get all products
GET /api/admin/products
Authorization: Bearer <session-token>

# Create product
POST /api/admin/products
Content-Type: application/json
{
  "name": "Product A",
  "price": 50000,
  "stock": 100,
  "category": "Electronics"
}

# AI Chat
POST /api/admin/ai/chat
{
  "message": "Analisa penjualan bulan ini",
  "sessionId": "abc123"
}
```

#### 🏪 Kasir API (`/api/kasir/`)
```
src/app/api/kasir/
├── route.ts                        # GET    /api/kasir - Kasir info
├── checkout/route.ts               # POST   /api/kasir/checkout
├── products/route.ts               # GET    /api/kasir/products
├── customers/
│   ├── route.ts                   # GET    /api/kasir/customers
│   └── search/route.ts            # GET    /api/kasir/customers/search
├── transactions/route.ts           # GET    /api/kasir/transactions
└── stats/route.ts                  # GET    /api/kasir/stats
```

**Contoh Request:**
```bash
# Checkout
POST /api/kasir/checkout
{
  "items": [
    { "productId": "abc", "quantity": 2, "price": 50000 }
  ],
  "customerId": "xyz",
  "paymentMethod": "CASH",
  "totalAmount": 100000
}
```

#### 🔧 Super Admin API (`/api/superadmin/`)
```
src/app/api/superadmin/
├── users/route.ts                  # GET    /api/superadmin/users
├── approve-owner/route.ts          # POST   /api/superadmin/approve-owner
├── upgrade-requests/route.ts       # GET, POST /api/superadmin/upgrade-requests
├── system-data/route.ts            # GET    /api/superadmin/system-data
├── ai-usage/route.ts               # GET    /api/superadmin/ai-usage
└── companies/
    └── [id]/route.ts              # GET, PUT, DELETE
```

#### 💳 Subscription API (`/api/subscription/`)
```
src/app/api/subscription/
├── upgrade/route.ts                # POST   /api/subscription/upgrade
├── check/route.ts                  # GET    /api/subscription/check
└── webhook/route.ts                # POST   /api/subscription/webhook
```

#### 📦 Storage API (`/api/storage/`)
```
src/app/api/storage/
└── usage/route.ts                  # GET    /api/storage/usage
```

#### ⏰ Cron Jobs (`/api/cron/`)
```
src/app/api/cron/
└── weekly-token-reset/route.ts     # POST   /api/cron/weekly-token-reset
```

---

## 🗄️ Database

### Lokasi: `prisma/schema.prisma`

**Database Models:**

```prisma
// Users & Authentication
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  password      String
  role          UserRole       @default(OWNER)
  status        ApprovalStatus @default(PENDING)
  company       Company?
  // ... more fields
  @@map("users")
}

// Companies
model Company {
  id                  String   @id @default(cuid())
  name                String
  email               String   @unique
  subscriptionTier    SubscriptionTier @default(FREE)
  stores              Store[]
  products            Product[]
  // ... more fields
  @@map("companies")
}

// Products
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  stock       Int
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  // ... more fields
  @@map("products")
}

// Transactions
model Transaction {
  id            String   @id @default(cuid())
  totalAmount   Float
  paymentMethod String
  items         TransactionItem[]
  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  // ... more fields
  @@map("transactions")
}

// Customers
model Customer {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String?
  transactions  Transaction[]
  // ... more fields
  @@map("customers")
}

// Stores (Multi-store)
model Store {
  id          String   @id @default(cuid())
  name        String
  address     String?
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  // ... more fields
  @@map("stores")
}

// Employees
model Employee {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        EmployeeRole
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  // ... more fields
  @@map("employees")
}

// AI Chat
model ChatSession {
  id        String   @id @default(cuid())
  adminId   String
  admin     User     @relation(fields: [adminId], references: [id])
  messages  ChatMessage[]
  // ... more fields
  @@map("chat_sessions")
}

// Enums
enum UserRole {
  SUPERADMIN
  ADMIN
  KASIR
  OWNER
}

enum SubscriptionTier {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}
```

**Relasi Database:**
```
User (1) ───► (1) Company
         ↓
Company (1) ───► (∞) Store
         ↓
Company (1) ───► (∞) Product
         ↓
Company (1) ───► (∞) Employee
         ↓
Company (1) ───► (∞) Customer
         ↓
Customer (1) ───► (∞) Transaction
         ↓
Transaction (1) ───► (∞) TransactionItem
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (GUI)
npx prisma studio

# Pull schema from existing database
npx prisma db pull
```

---

## 📚 Libraries & Utilities

### Lokasi: `src/lib/`

**Core Services:**

| File | Fungsi |
|------|--------|
| `auth.ts` | NextAuth configuration & session management |
| `prisma.ts` | Prisma client instance (singleton) |
| `config.ts` | App configuration (URLs, CORS, etc) |
| `geminiAI.ts` | Google Gemini AI integration |
| `openaiAI.ts` | OpenAI GPT integration |
| `geminiKeyRotation.ts` | API key rotation for Gemini |
| `aiBusinessContext.ts` | Business context untuk AI |
| `aiBusinessIntelligence.ts` | AI analytics & insights |
| `aiQuotaManager.ts` | Manage AI usage quota |
| `email.ts` | Email service (nodemailer) |
| `webhook.ts` | Webhook handler |
| `storageManager.ts` | File storage management |
| `subscriptionChecker.ts` | Check subscription status |
| `subscriptionLimits.ts` | Subscription tier limits |
| `tierLimits.ts` | Feature limits per tier |
| `freePlanLimits.ts` | Free plan restrictions |

**Contoh Penggunaan:**

```typescript
// src/lib/auth.ts - Authentication
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

const session = await getServerSession(authOptions)

// src/lib/prisma.ts - Database
import { prisma } from '@/lib/prisma'

const products = await prisma.product.findMany()

// src/lib/geminiAI.ts - AI
import { getGeminiAI } from '@/lib/geminiAI'

const ai = getGeminiAI()
const response = await ai.generateText("Analisa penjualan")

// src/lib/email.ts - Email
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Hello</h1>'
})
```

---

## 🚀 Deployment

### Server Information
- **Server**: VPS Ubuntu 24.04.3
- **IP**: 103.151.145.182
- **Port**: 8081
- **URL**: http://103.151.145.182:8081
- **Process Manager**: PM2

### Environment Variables

**Production (.env di server):**
```bash
# App Configuration
APP_URL=http://103.151.145.182:8081
NEXTAUTH_URL=http://103.151.145.182:8081
NEXTAUTH_SECRET=v4bWWwuUHmJXdKGSi0IdQWBP1fKsJJldbL3BfaSRE24=
NODE_ENV=production
PORT=8081

# Database
DATABASE_URL=mysql://vendracrm:vendra2025db!@localhost:3306/vendra_crm

# OpenAI
OPENAI_API_KEY=your_openai_key

# Google Gemini
GEMINI_API_KEY=your_gemini_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### Deployment Commands

```bash
# SSH ke server
ssh galang0304@103.151.145.182

# Pull latest code
cd ~/vendracrm
git pull origin main

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Restart aplikasi
pm2 restart vendra-crm

# Check logs
pm2 logs vendra-crm

# Check status
pm2 status
```

### Default Credentials

**Super Admin:**
- Email: `superadmin@vendra.com`
- Password: `superadmin123`

---

## 🔄 Data Flow

### 1. User Login Flow
```
User → /auth/signin (Frontend)
     → POST /api/auth/callback/credentials
     → NextAuth authorize() in src/lib/auth.ts
     → Prisma query to users table
     → bcrypt.compare(password, hash)
     → Create session
     → Redirect to dashboard
```

### 2. Product CRUD Flow
```
Admin → /admin/products (Frontend)
      → GET /api/admin/products
      → Check authentication (getServerSession)
      → Check authorization (role check)
      → Prisma query: prisma.product.findMany()
      → Return JSON response
      → Display in UI table
```

### 3. Kasir Checkout Flow
```
Kasir → /kasir/sales (Frontend)
      → Select products + customer
      → POST /api/kasir/checkout
      → Validate session & store
      → Create transaction (Prisma transaction)
        - Create Transaction record
        - Create TransactionItem records
        - Update product stock
        - Update customer points
      → Return receipt
      → Print/display receipt
```

### 4. AI Assistant Flow
```
Admin → /admin/ai-assistant (Frontend)
      → Type message
      → POST /api/admin/ai/chat
      → Get business context (sales data, inventory)
      → Call Gemini AI with context
      → Stream response back
      → Save to ChatSession & ChatMessage
      → Display in chat UI
```

---

## 📊 Architecture Patterns

### 1. **Separation of Concerns**
- **Frontend**: Pure UI components (React)
- **Backend**: API routes with business logic
- **Database**: Prisma ORM layer
- **Services**: Reusable utilities in `src/lib/`

### 2. **Authentication & Authorization**
- NextAuth.js untuk session management
- Role-based access control (RBAC)
- Middleware untuk protected routes

### 3. **Multi-tenancy**
- Company-based data isolation
- Every user belongs to a company
- Queries always filtered by companyId

### 4. **API Design**
- RESTful endpoints
- Consistent response format:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Success"
  }
  ```
- Error handling:
  ```json
  {
    "success": false,
    "error": "Error message"
  }
  ```

---

## 🛠️ Development Workflow

### Local Development
```bash
# Clone repo
git clone https://github.com/Galang0304/vendracrm.git
cd vendracrm

# Install dependencies
npm install

# Setup .env
cp .env.example .env
# Edit .env dengan local database

# Generate Prisma Client
npx prisma generate

# Run development server
npm run dev

# Open http://localhost:3001
```

### Production Deployment
```bash
# Build production
npm run build

# Run production server
npm start

# Or use PM2
pm2 start ecosystem.config.js
```

---

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi tim development.

**Repository**: https://github.com/Galang0304/vendracrm.git
**Live URL**: http://103.151.145.182:8081

---

**Last Updated**: December 15, 2025
