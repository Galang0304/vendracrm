import { PrismaClient } from '@prisma/client'

// Create a global prisma instance to avoid connection issues
declare global {
  var __prisma: PrismaClient | undefined
}

const prisma = globalThis.__prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Define subscription tiers
type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

// Define quota limits for each subscription tier
export const QUOTA_LIMITS = {
  FREE: {
    tokensPerWeek: 0, // No AI access for FREE users
    requestsPerWeek: 0,
    unlimited: false
  },
  BASIC: {
    tokensPerWeek: 50000, // 50% of base limit (100k tokens)
    requestsPerWeek: 50, // 50% of base limit (100 requests)
    unlimited: false
  },
  PREMIUM: {
    tokensPerWeek: 100000, // 100% of base limit
    requestsPerWeek: 100, // 100% of base limit
    unlimited: false
  },
  ENTERPRISE: {
    tokensPerWeek: 0, // Not used for unlimited
    requestsPerWeek: 0, // Not used for unlimited
    unlimited: true
  }
}

export interface QuotaStatus {
  tokensUsed: number
  requestsUsed: number
  tokensLimit: number
  requestsLimit: number
  tokensRemaining: number
  requestsRemaining: number
  tokensPercent: number
  requestsPercent: number
  unlimited: boolean
  canMakeRequest: boolean
  resetDate: Date
}

export class AiQuotaManager {
  
  static async getOrCreateQuota(companyId: string): Promise<any> {
    try {
      let quota = await (prisma as any).aiChatQuota.findUnique({
        where: { companyId }
      })

      if (!quota) {
        quota = await (prisma as any).aiChatQuota.create({
        data: {
          companyId,
          tokensUsed: 0,
          requestsUsed: 0,
          weeklyResetDate: this.getNextWeeklyReset()
        }
      })
    }

    return quota
    } catch (error) {
      console.error('Error in getOrCreateQuota:', error)
      throw error
    }
  }

  static async checkAndResetWeeklyQuota(companyId: string): Promise<void> {
    const quota = await this.getOrCreateQuota(companyId)
    const now = new Date()

    // Check if weekly reset is needed
    if (now >= quota.weeklyResetDate) {
      await (prisma as any).aiChatQuota.update({
        where: { companyId },
        data: {
          tokensUsed: 0,
          requestsUsed: 0,
          weeklyResetDate: this.getNextWeeklyReset()
        }
      })
    }
  }

  static async getQuotaStatus(companyId: string, subscriptionTier: SubscriptionTier): Promise<QuotaStatus> {
    // Reset quota if needed
    await this.checkAndResetWeeklyQuota(companyId)
    
    const quota = await this.getOrCreateQuota(companyId)
    const limits = QUOTA_LIMITS[subscriptionTier]

    if (limits.unlimited) {
      return {
        tokensUsed: quota.tokensUsed,
        requestsUsed: quota.requestsUsed,
        tokensLimit: 0,
        requestsLimit: 0,
        tokensRemaining: Infinity,
        requestsRemaining: Infinity,
        tokensPercent: 0,
        requestsPercent: 0,
        unlimited: true,
        canMakeRequest: true,
        resetDate: quota.weeklyResetDate
      }
    }

    const tokensRemaining = Math.max(0, limits.tokensPerWeek - quota.tokensUsed)
    const requestsRemaining = Math.max(0, limits.requestsPerWeek - quota.requestsUsed)
    const tokensPercent = limits.tokensPerWeek > 0 ? (quota.tokensUsed / limits.tokensPerWeek) * 100 : 0
    const requestsPercent = limits.requestsPerWeek > 0 ? (quota.requestsUsed / limits.requestsPerWeek) * 100 : 0

    return {
      tokensUsed: quota.tokensUsed,
      requestsUsed: quota.requestsUsed,
      tokensLimit: limits.tokensPerWeek,
      requestsLimit: limits.requestsPerWeek,
      tokensRemaining,
      requestsRemaining,
      tokensPercent: Math.min(100, tokensPercent),
      requestsPercent: Math.min(100, requestsPercent),
      unlimited: false,
      canMakeRequest: requestsRemaining > 0 && tokensRemaining > 0,
      resetDate: quota.weeklyResetDate
    }
  }

  static async canMakeRequest(companyId: string, subscriptionTier: SubscriptionTier): Promise<boolean> {
    const status = await this.getQuotaStatus(companyId, subscriptionTier)
    return status.canMakeRequest
  }

  static async consumeQuota(
    companyId: string, 
    tokensUsed: number, 
    subscriptionTier: SubscriptionTier
  ): Promise<void> {
    // Don't track usage for unlimited plans
    if (QUOTA_LIMITS[subscriptionTier].unlimited) {
      return
    }

    await this.checkAndResetWeeklyQuota(companyId)
    
    await (prisma as any).aiChatQuota.upsert({
      where: { companyId },
      update: {
        tokensUsed: {
          increment: tokensUsed
        },
        requestsUsed: {
          increment: 1
        }
      },
      create: {
        companyId,
        tokensUsed,
        requestsUsed: 1,
        weeklyResetDate: this.getNextWeeklyReset()
      }
    })
  }

  static getNextWeeklyReset(): Date {
    const now = new Date()
    const nextMonday = new Date(now)
    
    // Set to next Monday at 00:00:00
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    nextMonday.setHours(0, 0, 0, 0)
    
    return nextMonday
  }

  static formatResetDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
