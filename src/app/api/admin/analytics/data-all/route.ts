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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN'
    const companyId = isSuperAdmin ? undefined : session.user.companyId

    // Build where clause
    const whereClause: any = {
      date: { gte: startDate }
    }

    if (!isSuperAdmin && companyId) {
      whereClause.companyId = companyId
    }

    // Get comprehensive transaction data for AI analysis
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                brand: true,
                category: true,
                price: true
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            isMember: true
          }
        },
        employee: {
          select: {
            name: true
          }
        },
        store: {
          select: {
            name: true,
            code: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Transform data for AI analysis
    const analyticsData = transactions.flatMap((transaction: any) => 
      transaction.items.map((item: any) => ({
        // Transaction Info
        transactionNo: transaction.transactionNo,
        date: transaction.date.toISOString().split('T')[0], // YYYY-MM-DD format
        time: transaction.date.toISOString().split('T')[1].split('.')[0], // HH:MM:SS format
        
        // Product Info
        productName: item.product?.name || 'Unknown Product',
        productSku: item.product?.sku || '',
        brand: item.product?.brand || 'No Brand',
        category: item.product?.category || 'General',
        
        // Sales Data
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        
        // Customer Info
        customerName: transaction.customer?.name || 'Walk-in Customer',
        isMember: transaction.customer?.isMember || false,
        
        // Business Context
        paymentMethod: transaction.paymentMethod,
        storeName: transaction.store?.name || 'Main Store',
        storeCode: transaction.store?.code || 'MAIN',
        employeeName: transaction.employee?.name || 'System',
        companyName: transaction.company?.name || 'Company',
        
        // Calculated Fields
        revenue: Number(item.totalPrice),
        tax: Number(transaction.tax),
        discount: Number(transaction.discount),
        subtotal: Number(transaction.subtotal),
        total: Number(transaction.total)
      }))
    )

    // Calculate summary statistics for AI
    const summary = {
      // Time Period
      period: period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      
      // Transaction Summary
      totalTransactions: transactions.length,
      totalItems: analyticsData.length,
      totalRevenue: analyticsData.reduce((sum, item) => sum + item.revenue, 0),
      totalTax: analyticsData.reduce((sum, item) => sum + item.tax, 0),
      totalDiscount: analyticsData.reduce((sum, item) => sum + item.discount, 0),
      
      // Customer Analysis
      totalCustomers: new Set(analyticsData.map(item => item.customerName)).size,
      memberCustomers: analyticsData.filter(item => item.isMember).length,
      membershipRate: analyticsData.length > 0 ? 
        (analyticsData.filter(item => item.isMember).length / analyticsData.length * 100).toFixed(2) : 0,
      
      // Product Analysis
      totalProducts: new Set(analyticsData.map(item => item.productName)).size,
      topProducts: getTopProducts(analyticsData, 5),
      topBrands: getTopBrands(analyticsData, 5),
      topCategories: getTopCategories(analyticsData, 5),
      
      // Store Analysis
      storePerformance: getStorePerformance(analyticsData),
      
      // Payment Analysis
      paymentMethods: getPaymentMethodBreakdown(analyticsData),
      
      // Time Analysis
      dailyTrends: getDailyTrends(analyticsData),
      hourlyTrends: getHourlyTrends(analyticsData),
      
      // Business Insights
      averageOrderValue: analyticsData.length > 0 ? 
        (analyticsData.reduce((sum, item) => sum + item.revenue, 0) / new Set(analyticsData.map(item => item.transactionNo)).size) : 0,
      averageItemsPerOrder: analyticsData.length > 0 ? 
        (analyticsData.length / new Set(analyticsData.map(item => item.transactionNo)).size) : 0,
      
      // Data Scope
      dataScope: isSuperAdmin ? 'All Companies' : `Company: ${session.user.companyName || 'Current Company'}`,
      accessLevel: session.user.role
    }

    return NextResponse.json({
      summary,
      transactions: analyticsData.slice(0, 100), // Limit for AI processing
      metadata: {
        totalRecords: analyticsData.length,
        generatedAt: new Date().toISOString(),
        period: period,
        userRole: session.user.role,
        companyScope: isSuperAdmin ? 'multi-company' : 'single-company'
      }
    })

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for analytics
function getTopProducts(data: any[], limit: number) {
  const productStats = data.reduce((acc, item) => {
    const key = item.productName
    if (!acc[key]) {
      acc[key] = { name: key, quantity: 0, revenue: 0, transactions: 0 }
    }
    acc[key].quantity += item.quantity
    acc[key].revenue += item.revenue
    acc[key].transactions += 1
    return acc
  }, {})

  return Object.values(productStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit)
}

function getTopBrands(data: any[], limit: number) {
  const brandStats = data.reduce((acc, item) => {
    const key = item.brand
    if (!acc[key]) {
      acc[key] = { name: key, quantity: 0, revenue: 0, transactions: 0 }
    }
    acc[key].quantity += item.quantity
    acc[key].revenue += item.revenue
    acc[key].transactions += 1
    return acc
  }, {})

  return Object.values(brandStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit)
}

function getTopCategories(data: any[], limit: number) {
  const categoryStats = data.reduce((acc, item) => {
    const key = item.category
    if (!acc[key]) {
      acc[key] = { name: key, quantity: 0, revenue: 0, transactions: 0 }
    }
    acc[key].quantity += item.quantity
    acc[key].revenue += item.revenue
    acc[key].transactions += 1
    return acc
  }, {})

  return Object.values(categoryStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit)
}

function getStorePerformance(data: any[]) {
  const storeStats = data.reduce((acc, item) => {
    const key = item.storeName
    if (!acc[key]) {
      acc[key] = { name: key, code: item.storeCode, quantity: 0, revenue: 0, transactions: 0 }
    }
    acc[key].quantity += item.quantity
    acc[key].revenue += item.revenue
    acc[key].transactions += 1
    return acc
  }, {})

  return Object.values(storeStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
}

function getPaymentMethodBreakdown(data: any[]) {
  const paymentStats = data.reduce((acc, item) => {
    const key = item.paymentMethod
    if (!acc[key]) {
      acc[key] = { method: key, count: 0, revenue: 0 }
    }
    acc[key].count += 1
    acc[key].revenue += item.revenue
    return acc
  }, {})

  return Object.values(paymentStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
}

function getDailyTrends(data: any[]) {
  const dailyStats = data.reduce((acc, item) => {
    const key = item.date
    if (!acc[key]) {
      acc[key] = { date: key, transactions: 0, revenue: 0, items: 0 }
    }
    acc[key].transactions += 1
    acc[key].revenue += item.revenue
    acc[key].items += item.quantity
    return acc
  }, {})

  return Object.values(dailyStats)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
}

function getHourlyTrends(data: any[]) {
  const hourlyStats = data.reduce((acc, item) => {
    const hour = item.time.split(':')[0]
    if (!acc[hour]) {
      acc[hour] = { hour: hour, transactions: 0, revenue: 0, items: 0 }
    }
    acc[hour].transactions += 1
    acc[hour].revenue += item.revenue
    acc[hour].items += item.quantity
    return acc
  }, {})

  return Object.values(hourlyStats)
    .sort((a: any, b: any) => parseInt(a.hour) - parseInt(b.hour))
}
