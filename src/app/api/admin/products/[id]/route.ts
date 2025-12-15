import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch product
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
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

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if product exists and belongs to company
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: user.company.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if new SKU conflicts with other products (excluding current product)
    if (sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findFirst({
        where: {
          companyId: user.company.id,
          sku: sku,
          id: { not: params.id }
        }
      })

      if (skuConflict) {
        return NextResponse.json(
          { message: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Check if new barcode conflicts with other products (excluding current product)
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeConflict = await prisma.product.findFirst({
        where: {
          companyId: user.company.id,
          barcode: barcode,
          id: { not: params.id }
        }
      })

      if (barcodeConflict) {
        return NextResponse.json(
          { message: 'Barcode already exists' },
          { status: 400 }
        )
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
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
        isActive: isActive ?? true
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

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if product exists and belongs to company
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        companyId: user.company.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
