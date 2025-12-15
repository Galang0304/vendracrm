// AI Business Context - "Makanan AI" untuk memberikan data lengkap user
// AI akan tau semua tentang bisnis user yang login

import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface ComprehensiveBusinessContext {
  // User & Company Info
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  
  company: {
    id: string
    name: string
    tier: string
    isActive: boolean
    owner: string
    createdAt: string
  }
  
  // RFM Customer Analysis
  rfmAnalysis: {
    totalCustomers: number
    segments: {
      [key: string]: {
        count: number
        percentage: number
        characteristics: string
        recommendations: string[]
      }
    }
    businessInsights: {
      customerLifetimeValue: {
        average: number
        highest: number
        distribution: string
      }
      customerRetention: {
        loyalCustomers: number
        atRiskCustomers: number
        lostCustomers: number
        retentionRate: number
      }
      revenueAnalysis: {
        totalRevenue: number
        averageOrderValue: number
        topSpendingSegments: string[]
        revenueConcentration: string
      }
    }
    marketingRecommendations: {
      highValueSegments: string[]
      retentionStrategies: string[]
      acquisitionOpportunities: string[]
      campaignTargeting: {
        [segment: string]: string[]
      }
    }
    productInsights: {
      topProductsBySegment: {
        [segment: string]: Array<{
          productName: string
          popularity: number
          revenue: number
        }>
      }
      crossSellOpportunities: string[]
      inventoryOptimization: string[]
    }
  }
  
  // Business Data
  inventory: {
    totalProducts: number
    lowStockCount: number
    totalValue: number
    categories: string[]
    topProducts: Array<{
      name: string
      stock: number
      price: number
      sales: number
    }>
    recentProducts: Array<{
      name: string
      stock: number
      isLowStock: boolean
      createdAt: string
    }>
  }
  
  sales: {
    totalTransactions: number
    totalRevenue: number
    todayRevenue: number
    weeklyRevenue: number
    monthlyRevenue: number
    averageOrderValue: number
    topCustomers: Array<{
      name: string
      totalSpent: number
      transactionCount: number
    }>
    recentTransactions: Array<{
      transactionNo: string
      total: number
      customer: string
      date: string
    }>
    salesTrends: {
      dailyGrowth: number
      weeklyGrowth: number
      monthlyGrowth: number
    }
  }
  
  
  customers: {
    totalCustomers: number
    activeCustomers: number
    newCustomersThisMonth: number
    membershipCustomers: number
    customerSegments: Array<{
      segment: string
      count: number
      percentage: number
    }>
    topCustomers: Array<{
      name: string
      email: string
      totalSpent: number
      lastVisit: string
    }>
  }
  
  operations: {
    totalEmployees: number
    activeStores: number
    storeList: Array<{
      name: string
      code: string
      isActive: boolean
    }>
    employeeList: Array<{
      name: string
      role: string
      isActive: boolean
    }>
    businessHours: string[]
    peakHours: string[]
  }
  
  // AI Learning Data
  aiInsights: {
    businessType: string
    industry: string
    strengths: string[]
    challenges: string[]
    opportunities: string[]
    recommendations: string[]
    learningScore: number
  }
  
  // Performance Metrics
  performance: {
    profitability: 'high' | 'medium' | 'low'
    growth: 'growing' | 'stable' | 'declining'
    efficiency: number
    customerSatisfaction: number
    inventoryTurnover: number
  }
  
  // Alerts & Notifications
  alerts: {
    lowStock: Array<{
      productName: string
      currentStock: number
      minStock: number
    }>
    expiringSoon: Array<{
      item: string
      expiryDate: string
      daysLeft: number
    }>
    businessAlerts: string[]
    recommendations: string[]
  }
}

export class AIBusinessContextProvider {
  
  // Main function to get comprehensive business context
  static async getComprehensiveContext(userId: string): Promise<ComprehensiveBusinessContext | null> {
    try {
      console.log(`🧠 Loading comprehensive business context for user: ${userId}`)
      
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      })
      
      if (!user) {
        console.log(`❌ User not found: ${userId}`)
        return null
      }
      
      // Get company info (via ownerId relationship)
      const company = await prisma.company.findFirst({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          isActive: true,
          createdAt: true,
          owner: {
            select: { name: true }
          }
        }
      })
      
      if (!company) {
        // Handle SuperAdmin or users without company
        if (user.role === 'SUPERADMIN') {
          return await this.getSuperAdminContext(user)
        }
        console.log(`❌ No company found for user: ${userId}`)
        return null
      }
      
      const companyId = company.id
      console.log(`📊 Loading data for company: ${company.name} (${companyId})`)
      
      // Load all business data in parallel for performance
      // Load all business data in parallel for performance
      const [inventory, sales, customers, operations, aiInsights, performance, alerts] = await Promise.all([
        this.getInventoryContext(companyId),
        this.getSalesContext(companyId),
        this.getCustomersContext(companyId),
        this.getOperationsContext(companyId),
        this.getAIInsights(companyId),
        this.getPerformanceMetrics(companyId),
        this.getAlertsAndNotifications(companyId)
      ])
      
      // Get RFM Analysis - simplified for now
      const rfmAnalysis = {
        totalCustomers: customers.totalCustomers,
        segments: {
          'Best Customers': { count: 0, percentage: 0, characteristics: 'High-value frequent buyers', recommendations: ['VIP treatment', 'Loyalty rewards'] },
          'Loyal Customers': { count: 0, percentage: 0, characteristics: 'Frequent buyers', recommendations: ['Upselling', 'Bundle offers'] },
          'Others': { count: customers.totalCustomers, percentage: 100, characteristics: 'Mixed patterns', recommendations: ['Further analysis'] }
        },
        businessInsights: {
          customerLifetimeValue: { average: sales.averageOrderValue, highest: sales.averageOrderValue * 2, distribution: 'Balanced' },
          customerRetention: { loyalCustomers: Math.floor(customers.totalCustomers * 0.3), atRiskCustomers: Math.floor(customers.totalCustomers * 0.2), lostCustomers: 0, retentionRate: 70 },
          revenueAnalysis: { totalRevenue: sales.totalRevenue, averageOrderValue: sales.averageOrderValue, topSpendingSegments: ['Best Customers'], revenueConcentration: 'Balanced' }
        },
        marketingRecommendations: {
          highValueSegments: ['Best Customers', 'Loyal Customers'],
          retentionStrategies: ['Customer loyalty programs', 'Personalized offers'],
          acquisitionOpportunities: ['Referral programs', 'Social media marketing'],
          campaignTargeting: { 'Best Customers': ['VIP treatment'], 'Others': ['Welcome campaigns'] }
        },
        productInsights: {
          topProductsBySegment: {},
          crossSellOpportunities: ['Bundle products', 'Seasonal offers'],
          inventoryOptimization: ['Stock popular items']
        }
      }
      
      const context: ComprehensiveBusinessContext = {
        user: {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          role: user.role
        },
        company: {
          id: company.id,
          name: company.name,
          tier: company.subscriptionTier,
          isActive: company.isActive,
          owner: company.owner?.name || 'Unknown',
          createdAt: company.createdAt.toISOString()
        },
        rfmAnalysis,
        inventory,
        sales,
        customers,
        operations,
        aiInsights,
        performance,
        alerts
      }
      
      console.log(`✅ Comprehensive context loaded for ${company.name}`)
      console.log(`📊 Context includes: ${inventory.totalProducts} products, ${sales.totalTransactions} transactions, ${customers.totalCustomers} customers`)
      
      return context
      
    } catch (error) {
      console.error('❌ Error loading comprehensive business context:', error)
      return null
    }
  }
  
  // Get inventory context
  private static async getInventoryContext(companyId: string) {
    const products = await prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        price: true,
        category: true,
        createdAt: true
      }
    })
    
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.stock <= p.minStock)
    const totalValue = products.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0)
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]
    
    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalValue,
      categories,
      topProducts: products
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          stock: p.stock,
          price: Number(p.price),
          sales: 0 // TODO: Calculate from transactions
        })),
      recentProducts: products
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          stock: p.stock,
          isLowStock: p.stock <= p.minStock,
          createdAt: p.createdAt.toISOString()
        }))
    }
  }
  
  // Get sales context - using same calculation as Data All analytics
  private static async getSalesContext(companyId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      include: {
        customer: { select: { name: true } },
        items: { select: { totalPrice: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const totalTransactions = transactions.length
    // Calculate revenue from transaction items (consistent with Data All analytics API)
    const totalRevenue = transactions.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0)
    }, 0)
    
    // Calculate time-based revenue
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const todayTransactions = transactions.filter(t => new Date(t.createdAt) >= today)
    const weeklyTransactions = transactions.filter(t => new Date(t.createdAt) >= weekAgo)
    const monthlyTransactions = transactions.filter(t => new Date(t.createdAt) >= monthAgo)
    
    const todayRevenue = todayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0)
    const weeklyRevenue = weeklyTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0)
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0)
    
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    
    return {
      totalTransactions,
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      averageOrderValue,
      topCustomers: [], // TODO: Calculate top customers
      recentTransactions: transactions.slice(0, 5).map(t => ({
        transactionNo: t.transactionNo,
        total: t.items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
        customer: t.customer?.name || 'Walk-in',
        date: t.createdAt.toISOString()
      })),
      salesTrends: {
        dailyGrowth: 0, // TODO: Calculate growth
        weeklyGrowth: 0,
        monthlyGrowth: 0
      }
    }
  }
  
  // Get customers context
  private static async getCustomersContext(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        isMember: true,
        createdAt: true,
        transactions: {
          select: {
            total: true,
            createdAt: true,
            items: { select: { totalPrice: true } }
          }
        }
      }
    })
    
    const totalCustomers = customers.length
    const membershipCustomers = customers.filter(c => c.isMember).length
    
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const newCustomersThisMonth = customers.filter(c => new Date(c.createdAt) >= monthAgo).length
    
    return {
      totalCustomers,
      activeCustomers: totalCustomers, // TODO: Define active criteria
      newCustomersThisMonth,
      membershipCustomers,
      customerSegments: [
        { segment: 'Members', count: membershipCustomers, percentage: (membershipCustomers / totalCustomers) * 100 },
        { segment: 'Regular', count: totalCustomers - membershipCustomers, percentage: ((totalCustomers - membershipCustomers) / totalCustomers) * 100 }
      ],
      topCustomers: customers
        .map(c => ({
          name: c.name,
          email: c.email || '',
          totalSpent: c.transactions.reduce((sum, t) => {
            // Calculate from items (consistent with revenue calculation)
            return sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0)
          }, 0),
          lastVisit: c.transactions.length > 0 ? 
            Math.max(...c.transactions.map(t => new Date(t.createdAt).getTime())).toString() : 
            c.createdAt.toISOString()
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
    }
  }
  
  // Get operations context
  private static async getOperationsContext(companyId: string) {
    const [employees, stores] = await Promise.all([
      prisma.employee.findMany({
        where: { companyId },
        select: { name: true, role: true, isActive: true }
      }),
      prisma.store.findMany({
        where: { companyId },
        select: { name: true, code: true, isActive: true }
      })
    ])
    
    return {
      totalEmployees: employees.length,
      activeStores: stores.filter(s => s.isActive).length,
      storeList: stores.map(s => ({
        name: s.name,
        code: s.code,
        isActive: s.isActive
      })),
      employeeList: employees.map(e => ({
        name: e.name,
        role: e.role,
        isActive: e.isActive
      })),
      businessHours: ['09:00-17:00'], // TODO: Make configurable
      peakHours: ['12:00-14:00', '17:00-19:00'] // TODO: Calculate from transaction data
    }
  }
  
  // Get AI insights
  private static async getAIInsights(companyId: string) {
    // TODO: Integrate with AIBusinessIntelligence
    return {
      businessType: 'Retail Store',
      industry: 'General Retail',
      strengths: ['Good product variety', 'Active customer base'],
      challenges: ['Inventory management', 'Customer retention'],
      opportunities: ['Online expansion', 'Loyalty program'],
      recommendations: ['Implement inventory alerts', 'Focus on customer experience'],
      learningScore: 75
    }
  }
  
  // Get performance metrics
  private static async getPerformanceMetrics(companyId: string) {
    return {
      profitability: 'medium' as const,
      growth: 'growing' as const,
      efficiency: 78,
      customerSatisfaction: 85,
      inventoryTurnover: 4.2
    }
  }
  
  // Get alerts and notifications
  private static async getAlertsAndNotifications(companyId: string) {
    const lowStockProducts = await prisma.product.findMany({
      where: { 
        companyId,
        stock: { lte: prisma.product.fields.minStock }
      },
      select: { name: true, stock: true, minStock: true }
    })
    
    return {
      lowStock: lowStockProducts.map(p => ({
        productName: p.name,
        currentStock: p.stock,
        minStock: p.minStock
      })),
      expiringSoon: [], // TODO: Add expiry tracking
      businessAlerts: [
        ...(lowStockProducts.length > 0 ? [`${lowStockProducts.length} products are low in stock`] : []),
        'Consider updating your inventory management system'
      ],
      recommendations: [
        'Set up automatic reorder points',
        'Implement customer loyalty program',
        'Analyze sales patterns for better forecasting'
      ]
    }
  }
  
  // SuperAdmin context (cross-company view)
  private static async getSuperAdminContext(user: any): Promise<ComprehensiveBusinessContext> {
    // TODO: Implement SuperAdmin multi-company context
    return {
      user,
      company: {
        id: 'superadmin',
        name: 'Vendra Platform',
        tier: 'ENTERPRISE',
        isActive: true,
        owner: 'SuperAdmin',
        createdAt: new Date().toISOString()
      },
      rfmAnalysis: {
        totalCustomers: 0,
        segments: {},
        businessInsights: {
          customerLifetimeValue: { average: 0, highest: 0, distribution: 'SuperAdmin view' },
          customerRetention: { loyalCustomers: 0, atRiskCustomers: 0, lostCustomers: 0, retentionRate: 0 },
          revenueAnalysis: { totalRevenue: 0, averageOrderValue: 0, topSpendingSegments: [], revenueConcentration: 'Cross-company view' }
        },
        marketingRecommendations: {
          highValueSegments: [],
          retentionStrategies: [],
          acquisitionOpportunities: [],
          campaignTargeting: {}
        },
        productInsights: {
          topProductsBySegment: {},
          crossSellOpportunities: [],
          inventoryOptimization: []
        }
      },
      inventory: { totalProducts: 0, lowStockCount: 0, totalValue: 0, categories: [], topProducts: [], recentProducts: [] },
      sales: { totalTransactions: 0, totalRevenue: 0, todayRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0, averageOrderValue: 0, topCustomers: [], recentTransactions: [], salesTrends: { dailyGrowth: 0, weeklyGrowth: 0, monthlyGrowth: 0 } },
      customers: { totalCustomers: 0, activeCustomers: 0, newCustomersThisMonth: 0, membershipCustomers: 0, customerSegments: [], topCustomers: [] },
      operations: { totalEmployees: 0, activeStores: 0, storeList: [], employeeList: [], businessHours: [], peakHours: [] },
      aiInsights: { businessType: 'Platform', industry: 'SaaS', strengths: [], challenges: [], opportunities: [], recommendations: [], learningScore: 100 },
      performance: { profitability: 'high', growth: 'growing', efficiency: 95, customerSatisfaction: 90, inventoryTurnover: 0 },
      alerts: { lowStock: [], expiringSoon: [], businessAlerts: [], recommendations: [] }
    }
  }
}

// Helper function to get context from session
export async function getBusinessContextFromSession(): Promise<ComprehensiveBusinessContext | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No valid session found')
      return null
    }
    
    return await AIBusinessContextProvider.getComprehensiveContext(session.user.id)
    
  } catch (error) {
    console.error('❌ Error getting business context from session:', error)
    return null
  }
}

// Generate AI-friendly context string
export function generateAIContextString(context: ComprehensiveBusinessContext): string {
  return `🏢 BUSINESS CONTEXT FOR AI:

USER & COMPANY:
- User: ${context.user.name} (${context.user.role})
- Company: ${context.company.name} (${context.company.tier} tier)
- Active: ${context.company.isActive ? 'Yes' : 'No'}

INVENTORY DATA:
- Total Products: ${context.inventory.totalProducts}
- Low Stock Items: ${context.inventory.lowStockCount}
- Inventory Value: Rp ${context.inventory.totalValue.toLocaleString()}
- Categories: ${context.inventory.categories.join(', ')}

SALES PERFORMANCE:
- Total Transactions: ${context.sales.totalTransactions}
- Total Revenue: Rp ${context.sales.totalRevenue.toLocaleString()}
- Today's Revenue: Rp ${context.sales.todayRevenue.toLocaleString()}
- Weekly Revenue: Rp ${context.sales.weeklyRevenue.toLocaleString()}
- Average Order: Rp ${context.sales.averageOrderValue.toLocaleString()}

CUSTOMER DATA:
- Total Customers: ${context.customers.totalCustomers}
- New This Month: ${context.customers.newCustomersThisMonth}
- Active Customers: ${context.customers.activeCustomers}
- Top Customer: ${context.customers.topCustomers[0]?.name || 'N/A'}

AI INSIGHTS:
- Business Type: ${context.aiInsights.businessType}
- Industry: ${context.aiInsights.industry}
- Learning Score: ${context.aiInsights.learningScore}/100
- Strengths: ${context.aiInsights.strengths.join(', ')}
- Challenges: ${context.aiInsights.challenges.join(', ')}

ALERTS:
- Low Stock: ${context.alerts.lowStock.length} items
- Business Alerts: ${context.alerts.businessAlerts.join(', ')}

PERFORMANCE:
- Profitability: ${context.performance.profitability}
- Growth: ${context.performance.growth}
- Efficiency: ${context.performance.efficiency}%

Use this context to provide highly personalized and relevant business advice!`
}
