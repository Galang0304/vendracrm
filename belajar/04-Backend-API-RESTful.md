# 📚 MODUL 4: Backend API - RESTful Endpoints

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan bisa:
- Memahami struktur API Routes di Next.js
- Membuat RESTful API endpoints
- Handle HTTP methods (GET, POST, PUT, DELETE)
- Authentication & authorization
- Error handling & validation

---

## 🔌 Next.js API Routes

### Lokasi API Routes

```
src/app/api/
├── auth/
│   ├── register/route.ts      → POST /api/auth/register
│   └── [...nextauth]/route.ts → /api/auth/*
├── admin/
│   ├── products/
│   │   ├── route.ts          → /api/admin/products
│   │   └── [id]/route.ts     → /api/admin/products/:id
│   └── customers/
│       └── route.ts          → /api/admin/customers
└── kasir/
    └── checkout/route.ts      → POST /api/kasir/checkout
```

### Anatomy of API Route

**File: `src/app/api/admin/products/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Get query parameters
    const searchParams = request.nextUrl.searchParams
    const companyId = session.user.companyId
    
    // 3. Query database
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        company: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 4. Return response
    return NextResponse.json({
      success: true,
      data: products
    })
    
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 2. Parse request body
    const body = await request.json()
    const { name, price, stock, category } = body
    
    // 3. Validation
    if (!name || price == null || stock == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // 4. Create product
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        companyId: session.user.companyId
      }
    })
    
    // 5. Return created product
    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🌐 HTTP Methods

### GET - Retrieve Data

```typescript
// GET /api/admin/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })
  
  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: product
  })
}
```

### POST - Create Data

```typescript
// POST /api/admin/products
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const product = await prisma.product.create({
    data: {
      name: body.name,
      price: body.price,
      companyId: session.user.companyId
    }
  })
  
  return NextResponse.json(
    { success: true, data: product },
    { status: 201 }
  )
}
```

### PUT - Update Data

```typescript
// PUT /api/admin/products/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      price: body.price,
      stock: body.stock
    }
  })
  
  return NextResponse.json({
    success: true,
    data: product
  })
}
```

### DELETE - Delete Data

```typescript
// DELETE /api/admin/products/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({
    where: { id: params.id }
  })
  
  return NextResponse.json({
    success: true,
    message: 'Product deleted'
  })
}
```

---

## 🔐 Authentication & Authorization

### Check Authentication

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions)
  
  // Check if logged in
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Access user info
  const userId = session.user.id
  const userRole = session.user.role
  const companyId = session.user.companyId
  
  // Continue with logic...
}
```

### Role-Based Authorization

```typescript
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Check authentication
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check role
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    )
  }
  
  // Continue with delete...
}
```

### Multi-Tenancy (Company Isolation)

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  // Get products ONLY from user's company
  const products = await prisma.product.findMany({
    where: {
      companyId: session.user.companyId  // 👈 Data isolation
    }
  })
  
  return NextResponse.json({ data: products })
}
```

---

## ✅ Validation

### Manual Validation

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate required fields
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    )
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }
  
  // Validate number range
  if (body.price < 0) {
    return NextResponse.json(
      { error: 'Price must be positive' },
      { status: 400 }
    )
  }
  
  // Continue...
}
```

### Using Zod for Validation

```typescript
import { z } from 'zod'

// Define schema
const ProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().optional()
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate with Zod
  const result = ProductSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.errors },
      { status: 400 }
    )
  }
  
  // Use validated data
  const validData = result.data
  
  const product = await prisma.product.create({
    data: validData
  })
  
  return NextResponse.json({ success: true, data: product })
}
```

---

## ⚠️ Error Handling

### Try-Catch Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json({ data: products })
    
  } catch (error) {
    console.error('Database error:', error)
    
    // Return user-friendly error
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

### Specific Error Handling

```typescript
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const product = await prisma.product.create({
      data: body
    })
    
    return NextResponse.json({ data: product })
    
  } catch (error) {
    // Unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Product with this name already exists' },
          { status: 409 }
        )
      }
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 📊 Query Parameters

### Reading Query Params

```typescript
// URL: /api/admin/products?category=electronics&sort=price
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const category = searchParams.get('category')    // "electronics"
  const sort = searchParams.get('sort')            // "price"
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10
  
  // Build where clause
  const where: any = {}
  if (category) {
    where.category = category
  }
  
  // Build orderBy
  const orderBy: any = {}
  if (sort) {
    orderBy[sort] = 'asc'
  }
  
  // Query with pagination
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit
  })
  
  return NextResponse.json({ data: products })
}
```

### Search & Filter

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: search } },
        { category: { contains: search } }
      ]
    }
  })
  
  return NextResponse.json({ data: products })
}
```

---

## 🔄 Request & Response Format

### Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" // optional
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": { ... } // optional, for validation errors
}
```

### Helper Function

```typescript
// src/lib/apiResponse.ts
export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  )
}

export function errorResponse(error: string, status = 500, details?: any) {
  return NextResponse.json(
    { success: false, error, details },
    { status }
  )
}

// Usage in route:
import { successResponse, errorResponse } from '@/lib/apiResponse'

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return successResponse(products)
  } catch (error) {
    return errorResponse('Failed to fetch products', 500)
  }
}
```

---

## 💾 Database Operations (Prisma)

### Find Operations

```typescript
// Find all
const products = await prisma.product.findMany()

// Find with conditions
const products = await prisma.product.findMany({
  where: {
    companyId: 'abc123',
    stock: { gt: 0 },  // greater than 0
    price: { lte: 100000 }  // less than or equal
  }
})

// Find one
const product = await prisma.product.findUnique({
  where: { id: 'product-id' }
})

// Find first match
const product = await prisma.product.findFirst({
  where: { name: 'iPhone' }
})
```

### Create Operations

```typescript
// Create single
const product = await prisma.product.create({
  data: {
    name: 'New Product',
    price: 50000,
    companyId: 'abc123'
  }
})

// Create many
const products = await prisma.product.createMany({
  data: [
    { name: 'Product 1', price: 10000 },
    { name: 'Product 2', price: 20000 }
  ]
})
```

### Update Operations

```typescript
// Update single
const product = await prisma.product.update({
  where: { id: 'product-id' },
  data: {
    stock: 100,
    price: 55000
  }
})

// Update many
const result = await prisma.product.updateMany({
  where: { category: 'Electronics' },
  data: { discount: 10 }
})
```

### Delete Operations

```typescript
// Delete single
await prisma.product.delete({
  where: { id: 'product-id' }
})

// Delete many
await prisma.product.deleteMany({
  where: { stock: 0 }
})
```

### Relations

```typescript
// Include related data
const product = await prisma.product.findUnique({
  where: { id: 'product-id' },
  include: {
    company: true,  // Include company data
    category: true  // Include category data
  }
})

// Select specific fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    company: {
      select: {
        name: true
      }
    }
  }
})
```

---

## 🎓 Latihan Praktik

### Exercise 1: Create Customer API

Buat API untuk manage customers:

```typescript
// src/app/api/admin/customers/route.ts

// GET - Get all customers
// POST - Create customer
// Body: { name, email, phone, address }
```

### Exercise 2: Update Product API

```typescript
// src/app/api/admin/products/[id]/route.ts

// GET - Get product by ID
// PUT - Update product
// DELETE - Delete product
```

### Exercise 3: Search API with Filters

```typescript
// src/app/api/admin/products/search/route.ts

// GET /api/admin/products/search?q=iphone&category=electronics&minPrice=1000
// Return filtered products
```

---

## 📝 Checklist Pemahaman

- [ ] Saya paham struktur API Routes
- [ ] Saya bisa buat GET endpoint
- [ ] Saya bisa buat POST endpoint
- [ ] Saya bisa handle PUT & DELETE
- [ ] Saya bisa implement authentication check
- [ ] Saya bisa implement role-based authorization
- [ ] Saya bisa validate request data
- [ ] Saya bisa handle errors properly
- [ ] Saya bisa query database dengan Prisma
- [ ] Saya bisa work dengan relations

---

## ➡️ Selanjutnya

**MODUL 5: Database & Prisma ORM**

Di modul berikutnya, Anda akan belajar:
- Database schema design
- Prisma migrations
- Advanced queries
- Transactions
- Database optimization

---

**📖 Modul 4 - Selesai**
