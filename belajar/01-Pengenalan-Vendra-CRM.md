# 📚 MODUL 1: Pengenalan Vendra CRM

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan memahami:
- Apa itu Vendra CRM dan fungsinya
- Teknologi yang digunakan
- Struktur dasar proyek
- Konsep arsitektur aplikasi

---

## 🎯 Apa itu Vendra CRM?

**Vendra CRM** adalah aplikasi **Point of Sale (POS)** dan **Customer Relationship Management (CRM)** berbasis web yang membantu bisnis retail untuk:

### Fitur Utama:
1. **Sistem Kasir (POS)**
   - Transaksi penjualan cepat
   - Barcode scanning
   - Multiple payment methods
   - Print receipt

2. **Manajemen Produk**
   - Katalog produk lengkap
   - Stok inventory real-time
   - Kategori & variasi produk
   - Upload gambar produk

3. **Manajemen Pelanggan**
   - Database pelanggan
   - Program loyalty/member
   - History pembelian
   - Customer insights

4. **Multi-Store**
   - Kelola beberapa toko
   - Employee management
   - Store-specific inventory

5. **AI Assistant**
   - Chatbot untuk analisa bisnis
   - Rekomendasi otomatis
   - Sales forecasting

6. **Laporan & Analytics**
   - Sales reports
   - Inventory reports
   - Customer analytics

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Tampilan/UI)
```
Next.js 15.2.3      → Framework React untuk web app
React 19.0.0        → Library JavaScript untuk UI
TypeScript          → JavaScript dengan type checking
TailwindCSS         → CSS framework untuk styling
```

**Kenapa Next.js?**
- Server-side rendering (SSR) untuk performa cepat
- File-based routing (mudah organize pages)
- Built-in API routes (backend dalam satu project)
- Optimasi otomatis (images, fonts, dll)

### Backend (Logika & Data)
```
Next.js API Routes  → RESTful API endpoints
NextAuth.js         → Authentication & session
Prisma ORM          → Database management
MySQL 8.0           → Database server
bcryptjs            → Password encryption
```

**Kenapa Next.js API Routes?**
- Fullstack dalam satu project
- No CORS issues
- Easy deployment
- TypeScript support

### AI & Services
```
OpenAI GPT          → AI chatbot
Google Gemini       → AI analytics
Nodemailer          → Email service
Sharp               → Image processing
```

### Deployment
```
PM2                 → Process manager
VPS Ubuntu          → Server hosting
Nginx (optional)    → Reverse proxy
Git & GitHub        → Version control
```

---

## 📐 Konsep Arsitektur

### 1. Arsitektur Monolithic Fullstack
Vendra CRM menggunakan arsitektur **monolithic fullstack** di mana frontend dan backend dalam satu aplikasi Next.js.

```
┌─────────────────────────────────────────┐
│        VENDRA CRM (Next.js App)         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌─────────────┐   │
│  │  FRONTEND   │    │   BACKEND   │   │
│  │  (Pages)    │◄──►│ (API Routes)│   │
│  │  src/app/   │    │ src/app/api/│   │
│  └─────────────┘    └─────────────┘   │
│         │                    │          │
│         └────────┬───────────┘          │
│                  ▼                      │
│          ┌─────────────┐               │
│          │   PRISMA    │               │
│          │     ORM     │               │
│          └─────────────┘               │
│                  │                      │
│                  ▼                      │
│          ┌─────────────┐               │
│          │   MySQL DB  │               │
│          └─────────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Request Flow (Alur Request)

**Contoh: User ingin melihat daftar produk**

```
1. User buka browser → http://localhost:3001/admin/products

2. Next.js routing → src/app/admin/products/page.tsx (Frontend)

3. Frontend fetch data → GET /api/admin/products (Backend)

4. Backend check auth → NextAuth session validation

5. Backend query DB → Prisma: prisma.product.findMany()

6. MySQL return data → Array of products

7. Backend return JSON → { success: true, data: [...] }

8. Frontend render UI → Display products in table

9. User lihat produk di browser
```

### 3. File-Based Routing (Next.js)

Next.js menggunakan **folder structure** untuk routing:

```
src/app/admin/products/page.tsx
          ↓
URL: /admin/products
```

Contoh lengkap:
```
src/app/
  ├── page.tsx              → /              (Homepage)
  ├── auth/
  │   ├── signin/page.tsx  → /auth/signin   (Login page)
  │   └── signup/page.tsx  → /auth/signup   (Register page)
  ├── admin/
  │   ├── page.tsx         → /admin         (Admin dashboard)
  │   ├── products/
  │   │   └── page.tsx     → /admin/products (Products page)
  │   └── customers/
  │       └── page.tsx     → /admin/customers (Customers page)
  └── api/
      └── admin/
          └── products/
              └── route.ts  → /api/admin/products (API endpoint)
```

### 4. Component-Based Architecture

React/Next.js menggunakan **component-based** approach:

```
Page (Halaman)
  └─ Layout (Wrapper)
      ├─ Header (Navbar)
      ├─ Sidebar (Menu)
      └─ Content
          ├─ Table (Komponen tabel)
          │   ├─ TableHeader
          │   └─ TableRow
          │       └─ TableCell
          └─ Button (Komponen button)
```

**Keuntungan:**
- Reusable (pakai ulang komponen)
- Maintainable (mudah maintain)
- Testable (mudah testing)

---

## 📂 Struktur Folder Proyek

```
vendra-crm/
│
├── 📂 src/                          # Source code utama
│   ├── 📂 app/                      # Next.js App Router
│   │   ├── 📄 page.tsx             # Homepage
│   │   ├── 📄 layout.tsx           # Root layout
│   │   ├── 📂 admin/               # Admin pages
│   │   ├── 📂 kasir/               # Kasir pages
│   │   └── 📂 api/                 # Backend API
│   │
│   ├── 📂 components/              # React components
│   │   ├── 📂 admin/              # Admin components
│   │   ├── 📂 ui/                 # UI components (Button, Input, dll)
│   │   └── 📂 vendra/             # Brand components
│   │
│   ├── 📂 lib/                     # Business logic & services
│   │   ├── 📄 auth.ts             # Authentication
│   │   ├── 📄 prisma.ts           # Database client
│   │   └── 📄 ...                 # Other services
│   │
│   └── 📂 types/                   # TypeScript types
│
├── 📂 prisma/                       # Database
│   ├── 📄 schema.prisma            # Database schema
│   └── 📂 migrations/              # Database migrations
│
├── 📂 public/                       # Static files (images, etc)
│
├── 📄 package.json                  # Dependencies
├── 📄 next.config.ts                # Next.js config
├── 📄 tsconfig.json                 # TypeScript config
└── 📄 .env                          # Environment variables
```

---

## 🔑 Konsep Penting

### 1. Server-Side Rendering (SSR)
Next.js render halaman di server, bukan di browser.

**Keuntungan:**
- Loading lebih cepat
- SEO friendly
- Better security (rahasia tidak ke browser)

### 2. API Routes
Backend API dalam folder `src/app/api/`

```typescript
// src/app/api/products/route.ts
export async function GET() {
  const products = await prisma.product.findMany()
  return Response.json({ data: products })
}
```

### 3. Prisma ORM
Prisma = Object Relational Mapping = Bridge antara code dan database

**Tanpa Prisma (SQL raw):**
```sql
SELECT * FROM products WHERE companyId = '123';
```

**Dengan Prisma (TypeScript):**
```typescript
const products = await prisma.product.findMany({
  where: { companyId: '123' }
})
```

### 4. TypeScript
JavaScript + Type Checking

**JavaScript biasa:**
```javascript
function tambah(a, b) {
  return a + b
}
tambah(5, "10") // "510" (Bug!)
```

**TypeScript:**
```typescript
function tambah(a: number, b: number): number {
  return a + b
}
tambah(5, "10") // Error: string tidak bisa di number
```

### 5. Component Props
Cara passing data ke component:

```typescript
// Parent component
<Button text="Simpan" color="blue" onClick={handleSave} />

// Button component
function Button({ text, color, onClick }) {
  return (
    <button 
      className={`bg-${color}-500`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
```

---

## 🎓 Latihan Pemahaman

### Pertanyaan:
1. Apa perbedaan antara Frontend dan Backend?
2. Apa fungsi Prisma ORM?
3. Bagaimana cara Next.js routing bekerja?
4. Apa keuntungan menggunakan TypeScript?
5. Apa itu Component dalam React?

### Jawaban:
1. **Frontend** = UI yang dilihat user (HTML/CSS/JS), **Backend** = Logika & database di server
2. **Prisma** = Bridge/jembatan antara TypeScript code dan MySQL database, jadi tidak perlu tulis SQL manual
3. Next.js routing berdasarkan **folder structure**: `app/admin/products/page.tsx` → URL `/admin/products`
4. TypeScript memberikan **type checking** untuk mencegah bug, **autocomplete** di editor, dan **better documentation**
5. **Component** = Building block UI yang reusable, seperti Button, Input, Table yang bisa dipakai berkali-kali

---

## 📝 Checklist Pemahaman

Sebelum lanjut ke modul berikutnya, pastikan Anda paham:

- [ ] Saya mengerti apa itu Vendra CRM
- [ ] Saya tahu teknologi yang digunakan
- [ ] Saya paham struktur folder proyek
- [ ] Saya mengerti konsep Frontend vs Backend
- [ ] Saya tahu cara Next.js routing bekerja
- [ ] Saya paham apa itu Prisma ORM
- [ ] Saya mengerti konsep Component

---

## ➡️ Selanjutnya

Setelah memahami modul ini, lanjut ke:
**MODUL 2: Setup & Instalasi Project**

Di modul berikutnya, Anda akan belajar:
- Install Node.js & tools
- Clone repository
- Setup database
- Menjalankan aplikasi
- Troubleshooting common issues

---

**📖 Modul 1 - Selesai**
