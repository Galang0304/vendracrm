// SuperAdmin Data Access - Platform-wide data access (except chat history)
import { prisma } from '@/lib/prisma'

interface PlatformStats {
  totalCompanies: number
  totalUsers: number
  totalTransactions: number
  totalRevenue: number
  totalProducts: number
  totalStores: number
  totalEmployees: number
  activeCompanies: number
  pendingApprovals: number
  monthlyGrowth: number
}

interface CompanyOverview {
  id: string
  name: string
  subscriptionTier: string
  status: string
  createdAt: Date
  userCount: number
  transactionCount: number
  revenue: number
  productCount: number
  storeCount: number
  employeeCount: number
}

// Get platform-wide statistics (SuperAdmin only)
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Get basic counts
    const [
      totalCompanies,
      totalUsers,
      totalTransactions,
      totalProducts,
      totalStores,
      totalEmployees,
      pendingApprovals
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.product.count(),
      prisma.store.count(),
      prisma.employee.count(),
      prisma.user.count({ where: { status: 'PENDING' } })
    ])

    // Get revenue data
    const transactions = await prisma.transaction.findMany({
      select: {
        total: true,
        createdAt: true
      }
    })

    const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
    const activeCompanies = totalCompanies // All companies are considered active

    // Calculate monthly growth (simplified)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const currentMonthTransactions = transactions.filter(t => t.createdAt >= currentMonth).length
    const lastMonthTransactions = transactions.filter(t => 
      t.createdAt >= lastMonth && t.createdAt < currentMonth
    ).length

    const monthlyGrowth = lastMonthTransactions > 0 
      ? ((currentMonthTransactions - lastMonthTransactions) / lastMonthTransactions) * 100 
      : 0

    return {
      totalCompanies,
      totalUsers,
      totalTransactions,
      totalRevenue,
      totalProducts,
      totalStores,
      totalEmployees,
      activeCompanies,
      pendingApprovals,
      monthlyGrowth
    }
  } catch (error) {
    console.error('Error getting platform stats:', error)
    throw error
  }
}

// Get all companies overview (SuperAdmin only)
export async function getAllCompaniesOverview(): Promise<CompanyOverview[]> {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get additional data for each company
    const companiesWithData = await Promise.all(
      companies.map(async (company) => {
        const [userCount, transactionData, productCount, storeCount, employeeCount] = await Promise.all([
          prisma.user.count({ where: { company: { id: company.id } } }),
          prisma.transaction.findMany({ 
            where: { company: { id: company.id } },
            select: { total: true }
          }),
          prisma.product.count({ where: { company: { id: company.id } } }),
          prisma.store.count({ where: { company: { id: company.id } } }),
          prisma.employee.count({ where: { companyId: company.id } })
        ])

        const revenue = transactionData.reduce((sum, t) => sum + (Number(t.total) || 0), 0)

        return {
          id: company.id,
          name: company.name,
          subscriptionTier: company.subscriptionTier || 'FREE',
          status: company.isActive ? 'ACTIVE' : 'INACTIVE',
          createdAt: company.createdAt,
          userCount,
          transactionCount: transactionData.length,
          revenue,
          productCount,
          storeCount,
          employeeCount
        }
      })
    )

    return companiesWithData
  } catch (error) {
    console.error('Error getting companies overview:', error)
    throw error
  }
}

// Get top performing companies (SuperAdmin only)
export async function getTopPerformingCompanies(limit: number = 10): Promise<CompanyOverview[]> {
  try {
    const companies = await getAllCompaniesOverview()
    
    // Sort by revenue descending
    return companies
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting top performing companies:', error)
    throw error
  }
}

// Get recent transactions across all companies (SuperAdmin only)
export async function getRecentPlatformTransactions(limit: number = 50) {
  try {
    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        customer: {
          select: {
            name: true
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
        }
      }
    })

    return transactions.map(transaction => ({
      id: transaction.id,
      transactionNo: transaction.transactionNo,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      companyName: transaction.company.name,
      customerName: transaction.customer?.name || 'Walk-in Customer',
      employeeName: transaction.employee?.name || 'Unknown',
      storeName: transaction.store?.name || 'Unknown Store'
    }))
  } catch (error) {
    console.error('Error getting recent platform transactions:', error)
    throw error
  }
}

// Get platform revenue analytics (SuperAdmin only)
export async function getPlatformRevenueAnalytics() {
  try {
    const transactions = await prisma.transaction.findMany({
      select: {
        total: true,
        createdAt: true,
        paymentMethod: true,
        company: {
          select: {
            name: true,
            subscriptionTier: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group by payment method
    const paymentMethodStats = transactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'Unknown'
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 }
      }
      acc[method].count++
      acc[method].total += Number(t.total) || 0
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    // Group by subscription tier
    const tierStats = transactions.reduce((acc, t) => {
      const tier = t.company.subscriptionTier || 'FREE'
      if (!acc[tier]) {
        acc[tier] = { count: 0, total: 0 }
      }
      acc[tier].count++
      acc[tier].total += Number(t.total) || 0
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    // Daily revenue for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentTransactions = transactions.filter(t => t.createdAt >= thirtyDaysAgo)
    const dailyRevenue = recentTransactions.reduce((acc, t) => {
      const date = t.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += Number(t.total) || 0
      return acc
    }, {} as Record<string, number>)

    return {
      totalRevenue: transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0),
      totalTransactions: transactions.length,
      paymentMethodStats,
      tierStats,
      dailyRevenue,
      averageTransactionValue: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0) / transactions.length 
        : 0
    }
  } catch (error) {
    console.error('Error getting platform revenue analytics:', error)
    throw error
  }
}

// Get user management data (SuperAdmin only)
export async function getPlatformUserData() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Process users with company data
    const usersWithCompany = users.map((user) => {
      let companyName = 'No Company'
      let subscriptionTier = 'FREE'
      
      if (user.company) {
        companyName = user.company.name
        subscriptionTier = user.company.subscriptionTier || 'FREE'
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        companyName,
        subscriptionTier,
        isApproved: user.status === 'APPROVED'
      }
    })

    // Group by role
    const roleStats = usersWithCompany.reduce((acc, user) => {
      const role = user.role
      if (!acc[role]) {
        acc[role] = 0
      }
      acc[role]++
      return acc
    }, {} as Record<string, number>)

    // Group by approval status
    const approvalStats = {
      approved: usersWithCompany.filter(u => u.status === 'APPROVED').length,
      pending: usersWithCompany.filter(u => u.status === 'PENDING').length
    }

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentUsers = usersWithCompany.filter(u => u.createdAt >= thirtyDaysAgo)

    return {
      totalUsers: usersWithCompany.length,
      roleStats,
      approvalStats,
      recentRegistrations: recentUsers.length,
      users: usersWithCompany
    }
  } catch (error) {
    console.error('Error getting platform user data:', error)
    throw error
  }
}
