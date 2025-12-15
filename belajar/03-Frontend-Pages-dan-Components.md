# 📚 MODUL 3: Frontend - Pages & Components

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan bisa:
- Memahami struktur pages di Next.js
- Membuat dan menggunakan React components
- Routing & navigation antar halaman
- Fetch data dari API
- State management dengan React hooks

---

## 📄 Next.js Pages

### File-Based Routing

Next.js menggunakan **file system** untuk routing. File di folder `src/app/` otomatis jadi route.

#### Contoh Struktur:

```
src/app/
├── page.tsx              → / (Homepage)
├── layout.tsx            → Root layout (wrapper semua pages)
├── auth/
│   ├── signin/
│   │   └── page.tsx     → /auth/signin
│   └── signup/
│       └── page.tsx     → /auth/signup
└── admin/
    ├── page.tsx          → /admin
    ├── products/
    │   └── page.tsx     → /admin/products
    └── customers/
        └── page.tsx     → /admin/customers
```

### Anatomy of a Page

**File: `src/app/admin/products/page.tsx`**

```typescript
// 1. Import dependencies
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 2. Define component
export default async function ProductsPage() {
  // 3. Fetch data (server-side)
  const session = await getServerSession(authOptions)
  
  // 4. Check authentication
  if (!session) {
    return <div>Please login</div>
  }

  // 5. Return JSX (UI)
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  )
}

// 6. Metadata (for SEO)
export const metadata = {
  title: 'Products - Vendra CRM',
  description: 'Manage your products'
}
```

**Penjelasan:**
1. **Import** - Import libraries & modules yang dibutuhkan
2. **Component** - Function yang return UI (JSX)
3. **async/await** - Fetch data di server before render
4. **Authentication** - Check user sudah login atau belum
5. **JSX** - HTML-like syntax dalam JavaScript
6. **Metadata** - Info untuk browser (title, description)

---

## 🧩 React Components

### Apa itu Component?

Component = Building block UI yang reusable.

**Analogi:**
Seperti LEGO blocks. Anda bisa buat 1 block "Button", lalu pakai berkali-kali.

### Jenis Components

#### 1. Server Components (Default di Next.js 13+)

```typescript
// src/components/ProductList.tsx
import { prisma } from '@/lib/prisma'

// Server Component: bisa langsung query database
export default async function ProductList() {
  const products = await prisma.product.findMany()
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Rp {product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

**Karakteristik:**
- Jalan di server
- Bisa query database langsung
- No client-side JavaScript
- Better performance

#### 2. Client Components

```typescript
'use client' // 👈 Directive untuk client component

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

**Karakteristik:**
- Jalan di browser
- Bisa pakai useState, useEffect, event handlers
- Interactive UI
- Client-side JavaScript

### Kapan Pakai Server vs Client Component?

**Pakai Server Component:**
- Fetch data dari database
- Access environment variables
- No interactivity needed

**Pakai Client Component:**
- Event handlers (onClick, onChange)
- State management (useState)
- Browser APIs (localStorage, window)
- Interactive UI

---

## 🎨 Component Composition

### Props (Properties)

Props = cara passing data ke component.

#### Example 1: Button Component

```typescript
// src/components/ui/Button.tsx
'use client'

interface ButtonProps {
  text: string
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
}

export function Button({ text, variant = 'primary', onClick }: ButtonProps) {
  const colors = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    danger: 'bg-red-500 hover:bg-red-600'
  }
  
  return (
    <button
      className={`px-4 py-2 text-white rounded ${colors[variant]}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
```

#### Usage:

```typescript
// Di page lain
import { Button } from '@/components/ui/Button'

export default function MyPage() {
  const handleClick = () => {
    alert('Button clicked!')
  }
  
  return (
    <div>
      <Button text="Save" variant="primary" onClick={handleClick} />
      <Button text="Cancel" variant="secondary" />
      <Button text="Delete" variant="danger" />
    </div>
  )
}
```

### Children Props

Children = content yang dimasukkan di antara opening & closing tag.

```typescript
// src/components/Card.tsx
interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  )
}

// Usage:
<Card title="Product Info">
  <p>This is the content inside the card.</p>
  <Button text="Buy Now" />
</Card>
```

---

## 🔄 State Management

### useState Hook

`useState` = cara untuk store dan update data di component.

```typescript
'use client'

import { useState } from 'react'

export default function ProductForm() {
  // Declare state
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [stock, setStock] = useState(0)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, price, stock })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Price"
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        placeholder="Stock"
      />
      <button type="submit">Save</button>
    </form>
  )
}
```

**Penjelasan:**
- `useState('')` = initial value adalah string kosong
- `setName(value)` = function untuk update state
- `onChange` = event handler ketika input berubah
- State berubah → Component re-render

### useEffect Hook

`useEffect` = run code setelah component render.

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch data when component mount
    async function fetchProducts() {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.data)
      setLoading(false)
    }
    
    fetchProducts()
  }, []) // Empty array = run once on mount
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

---

## 🌐 Routing & Navigation

### Link Component

Untuk navigate antar pages tanpa reload.

```typescript
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/products">Products</Link>
      <Link href="/admin/customers">Customers</Link>
    </nav>
  )
}
```

### Dynamic Routes

Route dengan parameter.

**File: `src/app/admin/products/[id]/page.tsx`**

```typescript
interface Props {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = params
  
  // Fetch product by ID
  const product = await prisma.product.findUnique({
    where: { id }
  })
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: Rp {product.price}</p>
    </div>
  )
}
```

**URL:** `/admin/products/abc123` → `id = "abc123"`

### Programmatic Navigation

Navigate via code (bukan click link).

```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function CreateProduct() {
  const router = useRouter()
  
  const handleSave = async () => {
    // Save product...
    
    // Redirect to products list
    router.push('/admin/products')
  }
  
  return <button onClick={handleSave}>Save & Back</button>
}
```

---

## 📡 Fetching Data

### Server Component (Preferred)

```typescript
// Fetch di server component
export default async function ProductsPage() {
  const products = await prisma.product.findMany()
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Client Component

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => setProducts(data.data))
  }, [])
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### POST Request

```typescript
'use client'

const handleCreateProduct = async (formData: any) => {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  
  const result = await response.json()
  
  if (result.success) {
    alert('Product created!')
  }
}
```

---

## 🎨 Styling dengan TailwindCSS

### Utility Classes

```typescript
export function Button() {
  return (
    <button className="
      bg-blue-500 
      hover:bg-blue-600 
      text-white 
      font-bold 
      py-2 
      px-4 
      rounded
    ">
      Click Me
    </button>
  )
}
```

**Common Classes:**
- **Spacing**: `p-4` (padding), `m-4` (margin), `gap-2` (gap)
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-300`
- **Typography**: `text-xl`, `font-bold`, `text-center`
- **Layout**: `flex`, `grid`, `hidden`, `block`
- **Responsive**: `md:flex`, `lg:w-1/2` (breakpoints)

---

## 🎓 Latihan Praktik

### Exercise 1: Create Custom Card Component

```typescript
// src/components/ui/Card.tsx
// Buat component Card dengan props:
// - title: string
// - description: string
// - children: ReactNode
// Styling dengan TailwindCSS
```

### Exercise 2: Product List with State

```typescript
// src/app/admin/products/page.tsx
// 1. Fetch products dari API
// 2. Display dalam table
// 3. Add loading state
// 4. Add error handling
```

### Exercise 3: Create Product Form

```typescript
// src/app/admin/products/create/page.tsx
// 1. Form dengan name, price, stock
// 2. useState untuk manage form state
// 3. Submit ke API POST /api/admin/products
// 4. Redirect ke products list setelah sukses
```

---

## 📝 Checklist Pemahaman

- [ ] Saya paham file-based routing di Next.js
- [ ] Saya bisa buat page baru
- [ ] Saya mengerti perbedaan Server vs Client Component
- [ ] Saya bisa buat reusable component dengan props
- [ ] Saya paham useState untuk state management
- [ ] Saya bisa fetch data dari API
- [ ] Saya bisa navigate antar pages
- [ ] Saya bisa styling dengan TailwindCSS

---

## ➡️ Selanjutnya

**MODUL 4: Backend API - RESTful Endpoints**

Di modul berikutnya, Anda akan belajar:
- Struktur API Routes
- HTTP Methods (GET, POST, PUT, DELETE)
- Request & Response handling
- Authentication & authorization
- Error handling

---

**📖 Modul 3 - Selesai**
