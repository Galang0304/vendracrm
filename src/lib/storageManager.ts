import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface StorageUsage {
  totalUsed: number // in bytes
  limit: number // in bytes
  percentage: number
  isOverLimit: boolean
  canUpload: boolean
}

export interface StorageLimits {
  FREE: number
  BASIC: number
  PREMIUM: number
  ENTERPRISE: number
}

// Storage limits in bytes
export const STORAGE_LIMITS: StorageLimits = {
  FREE: 100 * 1024 * 1024 * 1024, // 100GB
  BASIC: 0, // Will be calculated as 50% of current usage with weekly reset
  PREMIUM: 0, // Will be calculated as 100% of current usage
  ENTERPRISE: -1 // Unlimited (-1 indicates no limit)
}

export class StorageManager {
  private companyId: string

  constructor(companyId: string) {
    this.companyId = companyId
  }

  /**
   * Calculate current storage usage for a company
   */
  async getCurrentUsage(): Promise<number> {
    try {
      // Sum up file sizes from various sources
      const [products, imports, profiles, payments] = await Promise.all([
        // Product images
        prisma.product.findMany({
          where: { companyId: this.companyId },
          select: { imageSize: true }
        }),
        // Import files
        prisma.importHistory.findMany({
          where: { companyId: this.companyId },
          select: { fileSize: true }
        }),
        // Profile images
        prisma.company.findUnique({
          where: { id: this.companyId },
          select: { logoSize: true }
        }),
        // Payment proofs (if any)
        prisma.user.findMany({
          where: { 
            company: {
              id: this.companyId
            }
          },
          select: { paymentProofSize: true }
        })
      ])

      let totalUsage = 0

      // Sum product image sizes
      products.forEach((product: { imageSize: number | null }) => {
        if (product.imageSize) totalUsage += product.imageSize
      })

      // Sum import file sizes
      imports.forEach((importRecord: { fileSize: number }) => {
        if (importRecord.fileSize) totalUsage += importRecord.fileSize
      })

      // Add company logo size
      if (profiles?.logoSize) {
        totalUsage += profiles.logoSize
      }

      // Sum payment proof sizes
      payments.forEach((user: { paymentProofSize: number | null }) => {
        if (user.paymentProofSize) totalUsage += user.paymentProofSize
      })

      return totalUsage
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return 0
    }
  }

  /**
   * Get storage limit for a subscription tier
   */
  async getStorageLimit(subscriptionTier: string): Promise<number> {
    switch (subscriptionTier) {
      case 'FREE':
        return STORAGE_LIMITS.FREE

      case 'BASIC':
        // 50% of current usage, reset weekly
        const currentUsage = await this.getCurrentUsage()
        const basicLimit = Math.max(currentUsage * 1.5, STORAGE_LIMITS.FREE) // At least FREE tier limit
        return basicLimit

      case 'PREMIUM':
        // 100% of current usage (no additional restrictions beyond current)
        const premiumUsage = await this.getCurrentUsage()
        return Math.max(premiumUsage * 2, STORAGE_LIMITS.FREE * 5) // At least 5x FREE tier

      case 'ENTERPRISE':
        return STORAGE_LIMITS.ENTERPRISE // Unlimited

      default:
        return STORAGE_LIMITS.FREE
    }
  }

  /**
   * Get comprehensive storage usage information
   */
  async getStorageUsage(subscriptionTier: string): Promise<StorageUsage> {
    const totalUsed = await this.getCurrentUsage()
    const limit = await this.getStorageLimit(subscriptionTier)
    
    const isUnlimited = limit === -1
    const percentage = isUnlimited ? 0 : Math.round((totalUsed / limit) * 100)
    const isOverLimit = !isUnlimited && totalUsed > limit
    const canUpload = isUnlimited || totalUsed < limit

    return {
      totalUsed,
      limit: isUnlimited ? -1 : limit,
      percentage,
      isOverLimit,
      canUpload
    }
  }

  /**
   * Check if a file upload would exceed storage limit
   */
  async canUploadFile(fileSize: number, subscriptionTier: string): Promise<boolean> {
    const currentUsage = await this.getCurrentUsage()
    const limit = await this.getStorageLimit(subscriptionTier)
    
    if (limit === -1) return true // Unlimited
    
    return (currentUsage + fileSize) <= limit
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    if (bytes === -1) return 'Unlimited'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Reset BASIC tier storage tracking (called weekly)
   */
  async resetBasicTierUsage(): Promise<void> {
    try {
      // For BASIC tier, we reset the "baseline" usage weekly
      // This is implemented by updating a resetDate field in the company record
      await prisma.company.update({
        where: { id: this.companyId },
        data: { 
          storageResetDate: new Date(),
          storageBaselineUsage: BigInt(await this.getCurrentUsage())
        }
      })
    } catch (error) {
      console.error('Error resetting BASIC tier storage:', error)
    }
  }

  /**
   * Get storage usage since last reset (for BASIC tier)
   */
  async getUsageSinceReset(): Promise<number> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: this.companyId },
        select: { 
          storageResetDate: true,
          storageBaselineUsage: true
        }
      })

      if (!company?.storageResetDate || !company?.storageBaselineUsage) {
        return await this.getCurrentUsage()
      }

      const currentUsage = await this.getCurrentUsage()
      return Math.max(0, currentUsage - Number(company.storageBaselineUsage))
    } catch (error) {
      console.error('Error calculating usage since reset:', error)
      return 0
    }
  }
}

export default StorageManager
