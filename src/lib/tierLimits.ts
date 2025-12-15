// Tier Limits Middleware - Enforce subscription limits
import { prisma } from '@/lib/prisma'
import { getRateLimitForTier } from '@/lib/vendraAIConfig'

export interface TierCheckResult {
  allowed: boolean
  message?: string
  currentCount?: number
  limit?: number
}

// Check if company can add more data entries
export async function checkDataLimit(companyId: string): Promise<TierCheckResult> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true }
    })

    if (!company) {
      return { allowed: false, message: 'Company not found' }
    }

    const limits = getRateLimitForTier(company.subscriptionTier)
    
    // Unlimited data for UNLIMITED tier
    if (limits.dataLimit === -1) {
      return { allowed: true }
    }

    // Count current data entries (products + customers + transactions)
    const [productCount, customerCount, transactionCount] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.transaction.count({ where: { companyId } })
    ])

    const totalData = productCount + customerCount + transactionCount
    const allowed = totalData < limits.dataLimit

    return {
      allowed,
      currentCount: totalData,
      limit: limits.dataLimit,
      message: allowed ? undefined : `Data limit exceeded. Current: ${totalData}, Limit: ${limits.dataLimit}`
    }
  } catch (error) {
    console.error('Error checking data limit:', error)
    return { allowed: false, message: 'Error checking data limit' }
  }
}

// Check if company can add more kasir accounts
export async function checkKasirLimit(companyId: string): Promise<TierCheckResult> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true }
    })

    if (!company) {
      return { allowed: false, message: 'Company not found' }
    }

    const limits = getRateLimitForTier(company.subscriptionTier)
    
    // Unlimited kasir for UNLIMITED tier
    if (limits.kasirLimit === -1) {
      return { allowed: true }
    }

    // Count current kasir accounts
    const kasirCount = await prisma.admin.count({
      where: { 
        companyId,
        role: 'KASIR'
      }
    })

    const allowed = kasirCount < limits.kasirLimit

    return {
      allowed,
      currentCount: kasirCount,
      limit: limits.kasirLimit,
      message: allowed ? undefined : `Kasir limit exceeded. Current: ${kasirCount}, Limit: ${limits.kasirLimit}`
    }
  } catch (error) {
    console.error('Error checking kasir limit:', error)
    return { allowed: false, message: 'Error checking kasir limit' }
  }
}

// Check if company can add more manajer accounts
export async function checkManajerLimit(companyId: string): Promise<TierCheckResult> {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true }
    })

    if (!company) {
      return { allowed: false, message: 'Company not found' }
    }

    const limits = getRateLimitForTier(company.subscriptionTier)
    
    // Unlimited manajer for UNLIMITED tier
    if (limits.manajerLimit === -1) {
      return { allowed: true }
    }

    // Count current manajer accounts
    const manajerCount = await prisma.admin.count({
      where: { 
        companyId,
        role: 'ADMIN' // ADMIN role is equivalent to manajer
      }
    })

    const allowed = manajerCount < limits.manajerLimit

    return {
      allowed,
      currentCount: manajerCount,
      limit: limits.manajerLimit,
      message: allowed ? undefined : `Manajer limit exceeded. Current: ${manajerCount}, Limit: ${limits.manajerLimit}`
    }
  } catch (error) {
    console.error('Error checking manajer limit:', error)
    return { allowed: false, message: 'Error checking manajer limit' }
  }
}

// Get comprehensive tier status for a company
export async function getTierStatus(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { 
        subscriptionTier: true,
        name: true
      }
    })

    if (!company) {
      throw new Error('Company not found')
    }

    const limits = getRateLimitForTier(company.subscriptionTier)
    
    // Get current counts
    const [productCount, customerCount, transactionCount, kasirCount, manajerCount] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.customer.count({ where: { companyId } }),
      prisma.transaction.count({ where: { companyId } }),
      prisma.admin.count({ where: { companyId, role: 'KASIR' } }),
      prisma.admin.count({ where: { companyId, role: 'ADMIN' } })
    ])

    const totalData = productCount + customerCount + transactionCount

    return {
      company: {
        name: company.name,
        tier: company.subscriptionTier
      },
      limits,
      current: {
        data: totalData,
        kasir: kasirCount,
        manajer: manajerCount,
        breakdown: {
          products: productCount,
          customers: customerCount,
          transactions: transactionCount
        }
      },
      status: {
        dataAllowed: limits.dataLimit === -1 || totalData < limits.dataLimit,
        kasirAllowed: limits.kasirLimit === -1 || kasirCount < limits.kasirLimit,
        manajerAllowed: limits.manajerLimit === -1 || manajerCount < limits.manajerLimit,
        aiEnabled: limits.aiEnabled
      }
    }
  } catch (error) {
    console.error('Error getting tier status:', error)
    throw error
  }
}

// Middleware function to check limits before operations
export function withTierLimit(limitType: 'data' | 'kasir' | 'manajer') {
  return async (companyId: string): Promise<TierCheckResult> => {
    switch (limitType) {
      case 'data':
        return await checkDataLimit(companyId)
      case 'kasir':
        return await checkKasirLimit(companyId)
      case 'manajer':
        return await checkManajerLimit(companyId)
      default:
        return { allowed: false, message: 'Invalid limit type' }
    }
  }
}
