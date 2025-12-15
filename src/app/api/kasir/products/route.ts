import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get products for kasir (POS)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    // Get kasir's company and store through employee record
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { 
        company: true,
        store: true 
      }
    })

    if (!employee || !employee.company) {
      return NextResponse.json(
        { message: 'Employee or company not found' },
        { status: 404 }
      )
    }

    const companyId = employee.company.id
    const storeId = employee.storeId

    // Get products for the specific store or all company products if no specific store
    const whereCondition: any = {
      companyId: companyId,
      isActive: true
    }

    // If kasir assigned to specific store, only show products for that store
    if (storeId) {
      whereCondition.OR = [
        { storeId: storeId },      // Products assigned to this store
        { storeId: null }          // Products available to all stores
      ]
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        barcode: true,
        category: true,
        description: true,
        minStock: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Format products for kasir
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      barcode: product.barcode || '',
      category: product.category || 'Uncategorized',
      description: product.description || '',
      minStock: product.minStock || 0,
      isActive: product.isActive
    }))

    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error('Error fetching products for kasir:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
