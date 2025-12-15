# 🏪 Vendra CRM - Point of Sale & Customer Management System

<div align="center">

![Vendra CRM](https://img.shields.io/badge/Vendra-CRM-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)
![React](https://img.shields.io/badge/React-19.0.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

**Solusi lengkap untuk manajemen toko, penjualan, dan pelanggan dengan AI Assistant**

[Demo](http://103.151.145.182:8081) • [Dokumentasi](ARCHITECTURE.md) • [Deployment Guide](DEPLOYMENT-SERVER.md)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)

---

## 🎯 Tentang Proyek

**Vendra CRM** adalah aplikasi Point of Sale (POS) dan Customer Relationship Management (CRM) berbasis web yang dirancang untuk membantu bisnis retail mengelola:

✅ **Penjualan & Transaksi** - Sistem kasir lengkap dengan barcode scanner  
✅ **Inventory Management** - Kelola stok produk real-time  
✅ **Customer Management** - Database pelanggan dengan loyalty program  
✅ **Multi-Store Support** - Manage beberapa toko dalam satu akun  
✅ **Employee Management** - Role-based access untuk karyawan  
✅ **AI Business Assistant** - Chatbot AI untuk analisa bisnis  
✅ **Reports & Analytics** - Laporan penjualan dan insights  
✅ **Subscription Tiers** - Free, Basic, Premium, Enterprise plans  

---

## ⚡ Fitur Utama

### 🛒 Point of Sale (Kasir)
- Interface kasir yang cepat dan intuitif
- Barcode scanner support
- Multiple payment methods (Cash, Card, E-wallet)
- Print receipt & email
- Customer search & member discount

### 📦 Inventory Management
- Real-time stock tracking
- Low stock alerts
- Product categories & variants
- Bulk import/export (CSV)
- Product images & barcodes

### 👥 Customer Management
- Customer database lengkap
- Membership & loyalty points
- Purchase history
- Customer segmentation
- Birthday & anniversary reminders

### 📊 Reports & Analytics
- Sales reports (daily, weekly, monthly)
- Best-selling products
- Customer insights
- Inventory reports
- Revenue trends & forecasting

### 🤖 AI Business Assistant
- Natural language queries
- Business insights & recommendations
- Sales analysis
- Inventory optimization suggestions
- Powered by OpenAI GPT & Google Gemini

### 🏢 Multi-Store & Multi-User
- Manage multiple store locations
- Employee role management (Owner, Admin, Kasir)
- Store-specific inventory
- Centralized reporting

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.3** - React framework dengan App Router
- **React 19.0.0** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - RESTful API
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database ORM
- **MySQL 8.0** - Database
- **bcryptjs** - Password hashing

### AI & Integrations
- **OpenAI GPT** - AI chatbot
- **Google Gemini** - AI analytics
- **Nodemailer** - Email service
- **Sharp** - Image processing

### DevOps
- **PM2** - Process manager
- **GitHub** - Version control
- **VPS Ubuntu** - Hosting

---

## 📁 Struktur Proyek

```
vendra-crm/
│
├── 📂 src/
│   ├── 📂 app/                    # 🌐 FRONTEND (Pages & Routes)
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── 📂 auth/              # Login & Signup pages
│   │   ├── 📂 admin/             # Admin dashboard pages
│   │   ├── 📂 kasir/             # Kasir (POS) pages
│   │   ├── 📂 superadmin/        # Super admin pages
│   │   └── 📂 api/               # 🔌 BACKEND (API Routes)
│   │       ├── 📂 auth/          # Authentication API
│   │       ├── 📂 admin/         # Admin API (products, transactions, etc)
│   │       ├── 📂 kasir/         # Kasir API (checkout, sales)
│   │       └── 📂 superadmin/    # Super admin API
│   │
│   ├── 📂 components/            # ⚛️ React Components
│   │   ├── 📂 admin/            # Admin components
│   │   ├── 📂 ui/               # Reusable UI components
│   │   └── 📂 vendra/           # Brand components
│   │
│   ├── 📂 lib/                   # 📚 Business Logic & Services
│   │   ├── auth.ts              # NextAuth config
│   │   ├── prisma.ts            # Prisma client
│   │   ├── geminiAI.ts          # Google Gemini AI
│   │   ├── openaiAI.ts          # OpenAI GPT
│   │   └── ...                  # Other services
│   │
│   └── 📂 types/                 # TypeScript definitions
│
├── 📂 prisma/                    # 🗄️ Database
│   ├── schema.prisma            # Database schema
│   └── 📂 migrations/           # Migration files
│
├── 📂 public/                    # Static files (images, uploads)
├── 📂 scripts/                   # Utility scripts
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── next.config.ts               # Next.js config
```

> **📖 Dokumentasi Lengkap**: Lihat [ARCHITECTURE.md](ARCHITECTURE.md) untuk peta lengkap API, database, dan arsitektur sistem.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ 
- MySQL 8.0+
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/Galang0304/vendracrm.git
cd vendracrm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE vendra_crm;
CREATE USER 'vendracrm'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON vendra_crm.* TO 'vendracrm'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Setup Environment
```bash
cp .env.example .env
nano .env
```

Edit `.env` dengan konfigurasi Anda:
```env
DATABASE_URL="mysql://vendracrm:your_password@localhost:3306/vendra_crm"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
APP_URL="http://localhost:3001"
PORT=3001
```

### 5. Generate Prisma & Migrate
```bash
npx prisma generate
npx prisma db push
```

### 6. Create Super Admin (Optional)
```bash
node scripts/change-superadmin-password.js
```

### 7. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3001](http://localhost:3001) di browser.

### Default Login
- **Email**: `superadmin@vendra.com`
- **Password**: `superadmin123`

---

## 🌐 Deployment

### Production Server
- **URL**: http://103.151.145.182:8081
- **Server**: VPS Ubuntu 24.04
- **Process Manager**: PM2

### Deploy ke Server

```bash
# SSH ke server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/Galang0304/vendracrm.git
cd vendracrm

# Install dependencies
npm install

# Setup .env (lihat .env.example)
nano .env

# Generate Prisma
npx prisma generate

# Build production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

> **📖 Deployment Guide**: Lihat [DEPLOYMENT-SERVER.md](DEPLOYMENT-SERVER.md) untuk panduan lengkap deployment ke VPS.

---

## 🔌 API Documentation

### Base URL
```
Production: http://103.151.145.182:8081/api
Development: http://localhost:3001/api
```

### Endpoints

#### Authentication
```bash
POST /api/auth/register          # Register user baru
POST /api/auth/callback/*        # Login (NextAuth)
POST /api/auth/logout            # Logout
POST /api/auth/forgot-password   # Reset password
```

#### Admin - Products
```bash
GET    /api/admin/products       # Get all products
POST   /api/admin/products       # Create product
GET    /api/admin/products/:id   # Get product by ID
PUT    /api/admin/products/:id   # Update product
DELETE /api/admin/products/:id   # Delete product
POST   /api/admin/products/bulk-delete  # Bulk delete
GET    /api/admin/products/export      # Export CSV
```

#### Admin - Transactions
```bash
GET    /api/admin/transactions       # Get all transactions
GET    /api/admin/transactions/:id   # Get transaction detail
GET    /api/admin/transactions/stats # Get statistics
```

#### Kasir (POS)
```bash
POST   /api/kasir/checkout       # Checkout transaction
GET    /api/kasir/products       # Get products for sale
GET    /api/kasir/customers      # Get customers
GET    /api/kasir/stats          # Get kasir statistics
```

#### AI Assistant
```bash
POST   /api/admin/ai/chat        # Chat dengan AI
GET    /api/admin/ai/suggestions # Get AI suggestions
POST   /api/admin/ai/analyze     # Analyze business data
```

> **📖 API Documentation**: Lihat [ARCHITECTURE.md](ARCHITECTURE.md) untuk dokumentasi API lengkap dengan contoh request/response.

---

## 🗄️ Database Schema

### Main Tables

**users** - User accounts & authentication  
**companies** - Company/business profiles  
**stores** - Store locations  
**products** - Product catalog  
**transactions** - Sales transactions  
**transaction_items** - Transaction line items  
**customers** - Customer database  
**employees** - Employee management  
**chat_sessions** - AI chat history  
**chat_messages** - AI chat messages  

### Key Relationships
```
User (1) ──► (1) Company
Company (1) ──► (∞) Store
Company (1) ──► (∞) Product
Company (1) ──► (∞) Employee
Company (1) ──► (∞) Customer
Customer (1) ──► (∞) Transaction
Transaction (1) ──► (∞) TransactionItem
```

### Subscription Tiers
- **FREE** - 1 store, 100 products, 500 transactions/month
- **BASIC** - 3 stores, 1000 products, unlimited transactions
- **PREMIUM** - 10 stores, unlimited products, AI features
- **ENTERPRISE** - Unlimited everything, priority support

> **📖 Database Schema**: Lihat file `prisma/schema.prisma` untuk schema lengkap.

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Peta lengkap frontend, backend, API, database |
| [DEPLOYMENT-SERVER.md](DEPLOYMENT-SERVER.md) | Panduan deployment ke VPS server |
| `.env.example` | Template environment variables |
| `prisma/schema.prisma` | Database schema definition |

---

## 🤝 Contributing

Contributions are welcome! Silakan buat pull request atau issue untuk bug reports dan feature requests.

---

## 📄 License

This project is private and proprietary.

---

## 📞 Contact

**Repository**: https://github.com/Galang0304/vendracrm.git  
**Live Demo**: http://103.151.145.182:8081  
**Login**: superadmin@vendra.com / superadmin123

---

<div align="center">

**Built with ❤️ using Next.js & React**

⭐ Star this repo if you find it helpful!

</div>
2. Import project di [vercel.com](https://vercel.com)
3. Deploy otomatis

## Troubleshooting
- Pastikan semua dependencies terinstall
- Check versi Node.js
- Clear cache: `npm cache clean --force`

## Lisensi
MIT