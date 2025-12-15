# 📚 MODUL 5: Database & Prisma ORM

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan bisa:
- Memahami database schema Vendra CRM
- Bekerja dengan Prisma ORM
- Membuat migrations
- Advanced queries & relations
- Database optimization

---

## 🗄️ Database Schema Vendra CRM

### Entity Relationship Diagram

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│    User     │1     1 │   Company    │1     ∞ │   Product   │
│             │───────►│              │───────►│             │
│ - id        │        │ - id         │        │ - id        │
│ - email     │        │ - name       │        │ - name      │
│ - password  │        │ - tier       │        │ - price     │
│ - role      │        │ - isActive   │        │ - stock     │
└─────────────┘        └──────────────┘        └─────────────┘
                              │1
                              │
                              │∞
                       ┌──────────────┐
                       │   Customer   │
                       │              │
                       │ - id         │
                       │ - name       │
                       │ - email      │
                       └──────────────┘
                              │1
                              │
                              │∞
                       ┌──────────────┐
                       │ Transaction  │
                       │              │
                       │ - id         │
                       │ - total      │
                       │ - date       │
                       └──────────────┘
```

### Main Tables

#### 1. Users Table
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  password      String
  role          UserRole       @default(OWNER)
  status        ApprovalStatus @default(PENDING)
  isActive      Boolean        @default(false)
  isVerified    Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  company       Company?
  sessions      Session[]
  chatSessions  ChatSession[]
  
  @@map("users")
}

enum UserRole {
  SUPERADMIN
  ADMIN
  KASIR
  OWNER
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### 2. Companies Table
```prisma
model Company {
  id                  String           @id @default(cuid())
  name                String
  email               String           @unique
  subscriptionTier    SubscriptionTier @default(FREE)
  subscriptionExpiry  DateTime?
  isActive            Boolean          @default(true)
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  
  // Relations
  ownerId             String           @unique
  owner               User             @relation(fields: [ownerId], references: [id])
  stores              Store[]
  products            Product[]
  customers           Customer[]
  employees           Employee[]
  transactions        Transaction[]
  
  @@map("companies")
}

enum SubscriptionTier {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}
```

#### 3. Products Table
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  stock       Int
  category    String?
  barcode     String?  @unique
  image       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  items       TransactionItem[]
  
  @@map("products")
}
```

#### 4. Customers Table
```prisma
model Customer {
  id              String   @id @default(cuid())
  uniqueId        String   @unique
  name            String
  email           String?
  phone           String?
  isMember        Boolean  @default(false)
  membershipPoints Int     @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  transactions    Transaction[]
  
  @@map("customers")
}
```

#### 5. Transactions Table
```prisma
model Transaction {
  id            String   @id @default(cuid())
  receiptNumber String   @unique
  totalAmount   Float
  paymentMethod String
  paymentStatus String   @default("COMPLETED")
  createdAt     DateTime @default(now())
  
  // Relations
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])
  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  employeeId    String?
  employee      Employee? @relation(fields: [employeeId], references: [id])
  items         TransactionItem[]
  
  @@map("transactions")
}

model TransactionItem {
  id            String   @id @default(cuid())
  quantity      Int
  price         Float
  subtotal      Float
  
  // Relations
  transactionId String
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  productId     String
  product       Product     @relation(fields: [productId], references: [id])
  
  @@map("transaction_items")
}
```

---

## 🛠️ Prisma Operations

### 1. Basic CRUD

#### Create
```typescript
// Create single record
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
    role: 'OWNER'
  }
})

// Create with relations
const company = await prisma.company.create({
  data: {
    name: 'My Company',
    email: 'company@example.com',
    owner: {
      connect: { id: userId }  // Connect to existing user
    }
  }
})

// Create with nested create
const user = await prisma.user.create({
  data: {
    email: 'owner@example.com',
    name: 'Owner',
    password: hashedPassword,
    company: {
      create: {
        name: 'My Store',
        email: 'store@example.com'
      }
    }
  }
})
```

#### Read
```typescript
// Find all
const users = await prisma.user.findMany()

// Find with filter
const users = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
    isActive: true
  }
})

// Find unique
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Find first
const user = await prisma.user.findFirst({
  where: { role: 'SUPERADMIN' }
})

// Count records
const count = await prisma.product.count({
  where: { companyId: 'company-id' }
})
```

#### Update
```typescript
// Update single
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    name: 'New Name',
    isActive: true
  }
})

// Update many
const result = await prisma.product.updateMany({
  where: { stock: 0 },
  data: { isActive: false }
})

// Upsert (update or create)
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'Updated Name' },
  create: {
    email: 'user@example.com',
    name: 'New User',
    password: hashedPassword
  }
})
```

#### Delete
```typescript
// Delete single
await prisma.product.delete({
  where: { id: productId }
})

// Delete many
await prisma.product.deleteMany({
  where: {
    companyId: 'company-id',
    stock: 0
  }
})
```

### 2. Relations

#### Include Relations
```typescript
// Include one-to-one
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    company: true  // Include full company object
  }
})

// Include one-to-many
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: {
    products: true,     // All products
    stores: true,       // All stores
    customers: true     // All customers
  }
})

// Nested include
const transaction = await prisma.transaction.findUnique({
  where: { id: transactionId },
  include: {
    customer: true,
    items: {
      include: {
        product: true  // Include product for each item
      }
    }
  }
})
```

#### Select Specific Fields
```typescript
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

### 3. Filtering

#### Comparison Operators
```typescript
const products = await prisma.product.findMany({
  where: {
    price: { gt: 10000 },      // Greater than
    stock: { lte: 10 },        // Less than or equal
    category: { not: 'Food' }, // Not equal
    name: { in: ['iPhone', 'Samsung'] }, // In array
    isActive: true
  }
})
```

#### Text Search
```typescript
const products = await prisma.product.findMany({
  where: {
    name: {
      contains: 'phone',  // LIKE '%phone%'
      mode: 'insensitive' // Case insensitive
    }
  }
})

// Multiple fields search (OR)
const products = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: search } },
      { category: { contains: search } },
      { barcode: { contains: search } }
    ]
  }
})
```

#### Date Filtering
```typescript
const transactions = await prisma.transaction.findMany({
  where: {
    createdAt: {
      gte: new Date('2025-01-01'),  // Greater than or equal
      lte: new Date('2025-12-31')   // Less than or equal
    }
  }
})
```

### 4. Sorting & Pagination

#### Sorting
```typescript
const products = await prisma.product.findMany({
  orderBy: {
    price: 'desc'  // descending
  }
})

// Multiple sorts
const products = await prisma.product.findMany({
  orderBy: [
    { category: 'asc' },
    { price: 'desc' }
  ]
})

// Sort by relation
const products = await prisma.product.findMany({
  orderBy: {
    company: {
      name: 'asc'
    }
  }
})
```

#### Pagination
```typescript
// Skip & take
const page = 2
const pageSize = 10

const products = await prisma.product.findMany({
  skip: (page - 1) * pageSize,  // Skip 10 records
  take: pageSize,               // Take 10 records
  orderBy: { createdAt: 'desc' }
})

// With total count
const [products, total] = await Promise.all([
  prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize
  }),
  prisma.product.count()
])

const totalPages = Math.ceil(total / pageSize)
```

### 5. Aggregations

```typescript
// Count
const count = await prisma.product.count()

// Sum
const result = await prisma.transaction.aggregate({
  _sum: {
    totalAmount: true
  },
  where: {
    companyId: 'company-id'
  }
})
const totalSales = result._sum.totalAmount

// Average, min, max
const result = await prisma.product.aggregate({
  _avg: { price: true },
  _min: { price: true },
  _max: { price: true },
  _count: true
})

// Group by
const result = await prisma.transaction.groupBy({
  by: ['companyId'],
  _sum: {
    totalAmount: true
  },
  _count: true
})
```

---

## 🔄 Transactions

Prisma transactions untuk multiple operations:

```typescript
// Example: Checkout transaction
async function checkout(items, customerId, companyId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create transaction
    const transaction = await tx.transaction.create({
      data: {
        receiptNumber: generateReceiptNumber(),
        totalAmount: calculateTotal(items),
        paymentMethod: 'CASH',
        companyId,
        customerId
      }
    })
    
    // 2. Create transaction items
    for (const item of items) {
      await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price
        }
      })
      
      // 3. Update product stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }
    
    // 4. Update customer points
    if (customerId) {
      await tx.customer.update({
        where: { id: customerId },
        data: {
          membershipPoints: {
            increment: Math.floor(transaction.totalAmount / 1000)
          }
        }
      })
    }
    
    return transaction
  })
}
```

---

## 📊 Migrations

### Create Migration

```bash
# Create new migration
npx prisma migrate dev --name add_discount_field

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

### Migration Files

```sql
-- Migration: add_discount_field
ALTER TABLE `products` ADD COLUMN `discount` DOUBLE NOT NULL DEFAULT 0;
```

### Schema Changes

```prisma
// Add field to model
model Product {
  id       String @id @default(cuid())
  name     String
  price    Float
  discount Float  @default(0)  // ← New field
}
```

Run migration:
```bash
npx prisma migrate dev --name add_product_discount
```

---

## 🎓 Latihan Praktik

### Exercise 1: Complex Query

```typescript
// Get sales report for last month
// - Total transactions
// - Total revenue
// - Best selling products (top 5)
// - Customer with most purchases
```

### Exercise 2: Checkout Transaction

```typescript
// Implement complete checkout:
// 1. Create transaction
// 2. Create transaction items
// 3. Update product stock
// 4. Calculate & add customer points
// 5. Handle if stock insufficient (rollback)
```

### Exercise 3: Dashboard Statistics

```typescript
// Get dashboard stats:
// - Total products
// - Low stock products (stock < 10)
// - Today's sales count & revenue
// - Total customers
// - New customers this month
```

---

## 📝 Checklist Pemahaman

- [ ] Saya paham database schema Vendra CRM
- [ ] Saya bisa CRUD operations dengan Prisma
- [ ] Saya bisa work dengan relations (include, select)
- [ ] Saya bisa filtering & search data
- [ ] Saya bisa sorting & pagination
- [ ] Saya bisa aggregations (sum, count, avg)
- [ ] Saya paham Prisma transactions
- [ ] Saya bisa create & run migrations

---

## ➡️ Selanjutnya

**MODUL 6: Fitur Lanjutan**

Di modul berikutnya, Anda akan belajar:
- AI Integration (OpenAI & Gemini)
- File uploads
- Email service
- Real-time features
- Subscription management

---

**📖 Modul 5 - Selesai**
