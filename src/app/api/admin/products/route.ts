import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubscriptionLimitChecker from '@/lib/subscriptionLimits'

// GET - Fetch all products for the company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      )
    }

    // Fetch products for the company
    const products = await prisma.product.findMany({
      where: {
        companyId: user.company.id
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Debug log
    console.log('Products with store data:', products.slice(0, 2).map(p => ({
      name: p.name,
      storeId: p.storeId,
      store: p.store
    })))

    return NextResponse.json(products)

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      name, 
      description, 
      sku, 
      barcode, 
      price, 
      cost, 
      stock, 
      minStock, 
      category, 
      brand, 
      unit, 
      weight, 
      dimensions, 
      imageUrl, 
      storeId, 
      isActive 
    } = await request.json()

    // Validation
    if (!name || !sku || !price) {
      return NextResponse.json(
        { message: 'Name, SKU, and price are required' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { message: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      )
    }

    // Check subscription limits
    const limitChecker = new SubscriptionLimitChecker(user.company.id, user.company.subscriptionTier)
    const canAdd = await limitChecker.canAddProduct()
    
    if (!canAdd.allowed) {
      return NextResponse.json(
        { message: canAdd.message },
        { status: 403 }
      )
    }

    // Check if SKU already exists for this company
    const existingSKU = await prisma.product.findFirst({
      where: {
        companyId: user.company.id,
        sku: sku
      }
    })

    if (existingSKU) {
      return NextResponse.json(
        { message: 'SKU already exists' },
        { status: 400 }
      )
    }

    // Check if barcode already exists for this company (if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          companyId: user.company.id,
          barcode: barcode
        }
      })

      if (existingBarcode) {
        return NextResponse.json(
          { message: 'Barcode already exists' },
          { status: 400 }
        )
      }
    }

    // Create new product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        sku,
        barcode: barcode || null,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        category: category || null,
        brand: brand || null,
        unit: unit || 'pcs',
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        imageUrl: imageUrl || null,
        storeId: storeId || null,
        isActive: isActive ?? true,
        companyId: user.company.id
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
