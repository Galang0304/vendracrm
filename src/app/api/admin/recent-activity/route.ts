import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const companyId = user.company.id

    // Get recent customers (last 5)
    const recentCustomers = await prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        isMember: true,
        createdAt: true
      }
    })

    // Get recent products with low stock or recent updates (last 5)
    const recentProducts = await prisma.product.findMany({
      where: { companyId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        stock: true,
        updatedAt: true
      }
    })

    // Generate realistic activity based on real data
    const activities: any[] = []

    // Add customer activities
    recentCustomers.forEach((customer) => {
      const timeDiff = Date.now() - customer.createdAt.getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutesAgo = Math.floor(timeDiff / (1000 * 60))
      
      let timeText = ''
      if (hoursAgo > 0) {
        timeText = `${hoursAgo} jam yang lalu`
      } else if (minutesAgo > 0) {
        timeText = `${minutesAgo} menit yang lalu`
      } else {
        timeText = 'Baru saja'
      }

      activities.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        description: customer.isMember 
          ? `${customer.name} bergabung sebagai member`
          : `Customer baru: ${customer.name}`,
        timestamp: timeText
      })
    })

    // Add product activities
    recentProducts.forEach((product) => {
      const timeDiff = Date.now() - product.updatedAt.getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        description: product.stock <= 10 
          ? `Stok ${product.name} hampir habis (${product.stock})`
          : `Update stok ${product.name}`,
        timestamp: `${hoursAgo} jam yang lalu`
      })
    })

    // Note: Order/Sale activities will be added when transaction system is implemented
    // For now, only showing real customer and product activities

    // Sort by most recent and limit to 5
    const sortedActivities = activities
      .sort((a, b) => {
        // Simple sorting by timestamp text (not perfect but works for demo)
        const aHours = parseInt(a.timestamp) || 0
        const bHours = parseInt(b.timestamp) || 0
        return aHours - bHours
      })
      .slice(0, 5)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
