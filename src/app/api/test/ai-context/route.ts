import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIBusinessContextProvider, generateAIContextString } from '@/lib/aiBusinessContext'

// GET - Test AI Business Context (Makanan AI)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log(`🧪 Testing AI Business Context for user: ${userId}`)

    // Load comprehensive business context
    const startTime = Date.now()
    const comprehensiveContext = await AIBusinessContextProvider.getComprehensiveContext(userId)
    const loadTime = Date.now() - startTime

    if (!comprehensiveContext) {
      return NextResponse.json({
        success: false,
        message: 'Failed to load business context',
        userId,
        loadTime
      })
    }

    // Generate AI context string
    const aiContextString = generateAIContextString(comprehensiveContext)

    return NextResponse.json({
      success: true,
      message: 'AI Business Context loaded successfully',
      loadTime: `${loadTime}ms`,
      user: {
        id: userId,
        name: session.user.name,
        role: session.user.role
      },
      context: {
        company: comprehensiveContext.company,
        inventory: {
          totalProducts: comprehensiveContext.inventory.totalProducts,
          lowStockCount: comprehensiveContext.inventory.lowStockCount,
          totalValue: comprehensiveContext.inventory.totalValue,
          categories: comprehensiveContext.inventory.categories
        },
        sales: {
          totalTransactions: comprehensiveContext.sales.totalTransactions,
          totalRevenue: comprehensiveContext.sales.totalRevenue,
          todayRevenue: comprehensiveContext.sales.todayRevenue,
          weeklyRevenue: comprehensiveContext.sales.weeklyRevenue,
          averageOrderValue: comprehensiveContext.sales.averageOrderValue
        },
        customers: {
          totalCustomers: comprehensiveContext.customers.totalCustomers,
          membershipCustomers: comprehensiveContext.customers.membershipCustomers,
          newCustomersThisMonth: comprehensiveContext.customers.newCustomersThisMonth
        },
        operations: {
          totalEmployees: comprehensiveContext.operations.totalEmployees,
          activeStores: comprehensiveContext.operations.activeStores,
          storeList: comprehensiveContext.operations.storeList
        },
        aiInsights: comprehensiveContext.aiInsights,
        performance: comprehensiveContext.performance,
        alerts: comprehensiveContext.alerts
      },
      aiContextString: {
        length: aiContextString.length,
        preview: aiContextString.substring(0, 500) + '...',
        full: aiContextString
      }
    })

  } catch (error) {
    console.error('Error testing AI Business Context:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
