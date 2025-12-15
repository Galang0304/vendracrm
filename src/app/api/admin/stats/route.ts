import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Admin stats API called')
    
    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session?.user?.email, session?.user?.role)

    if (!session?.user || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      console.log('❌ Unauthorized access attempt')
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

    const companyId = user.company.id

    // Get real data from database
    const [
      totalCustomers,
      totalProducts,
      todayStart
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: { 
          companyId,
          isActive: true 
        }
      }),
      
      // Total products
      prisma.product.count({
        where: { 
          companyId,
          isActive: true 
        }
      }),
      
      // Today start time
      new Date(new Date().setHours(0, 0, 0, 0))
    ])

    // Get products for calculations
    const products = await prisma.product.findMany({
      where: {
        companyId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        minStock: true
      }
    })

    console.log('📦 Products found:', products.length)
    products.forEach(product => {
      console.log(`- ${product.name}: price=${product.price}, stock=${product.stock}, minStock=${product.minStock}`)
    })

    // Calculate low stock items
    const lowStockProducts = products.filter(product => 
      product.stock <= (product.minStock || 10)
    ).length

    // Simulate sales based on inventory movement
    let totalSales = 0
    let totalOrders = 0
    let todaySales = 0
    let todayOrders = 0

    if (products.length === 0) {
      // If no products, return zero stats
      const emptyStats = {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers,
        totalProducts,
        todaySales: 0,
        todayOrders: 0,
        monthlyGrowth: 0,
        lowStockItems: 0
      }
      console.log('✅ No products found, returning empty stats:', emptyStats)
      return NextResponse.json(emptyStats)
    }

    // For demo purposes, return clean zero stats
    // This shows the system is working but no real transactions yet
    const cleanStats = {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers,
      totalProducts,
      todaySales: 0,
      todayOrders: 0,
      monthlyGrowth: 0,
      lowStockItems: lowStockProducts
    }

    console.log('✅ Returning clean demo stats:', cleanStats)
    return NextResponse.json(cleanStats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
