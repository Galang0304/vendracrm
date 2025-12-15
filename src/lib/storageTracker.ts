import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export interface StorageUsage {
  totalUsed: number // in bytes
  limit: number // in bytes
  percentage: number
  isOverLimit: boolean
  canUpload: boolean
  formattedUsed: string
  formattedLimit: string
}

// Storage limits in bytes
export const STORAGE_LIMITS = {
  FREE: 10 * 1024 * 1024 * 1024, // 10GB
  BASIC: 500 * 1024 * 1024 * 1024, // 500GB with weekly reset logic
  PREMIUM: 1024 * 1024 * 1024 * 1024, // 1TB
  ENTERPRISE: -1 // Unlimited
}

export class StorageTracker {
  private companyId: string

  constructor(companyId: string) {
    this.companyId = companyId
  }

  /**
   * Calculate storage usage by scanning upload directories
   */
  async calculateDirectoryUsage(): Promise<number> {
    try {
      let totalSize = 0
      const uploadPaths = [
        path.join(process.cwd(), 'public', 'uploads', 'profiles'),
        path.join(process.cwd(), 'public', 'uploads', 'payments'),
        path.join(process.cwd(), 'public', 'uploads', 'products'),
        path.join(process.cwd(), 'public', 'uploads', 'imports')
      ]

      for (const uploadPath of uploadPaths) {
        if (fs.existsSync(uploadPath)) {
          totalSize += await this.getDirectorySize(uploadPath)
        }
      }

      return totalSize
    } catch (error) {
      console.error('Error calculating directory usage:', error)
      return 0
    }
  }

  /**
   * Get size of a directory recursively
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0
    
    try {
      const files = fs.readdirSync(dirPath)
      
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = fs.statSync(filePath)
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath)
        } else {
          // Check if file belongs to this company (by filename pattern or folder structure)
          if (this.isCompanyFile(filePath)) {
            totalSize += stats.size
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error)
    }
    
    return totalSize
  }

  /**
   * Check if a file belongs to this company
   */
  private isCompanyFile(filePath: string): boolean {
    // For now, count all files since we don't have proper company-specific file organization
    // TODO: Implement proper company-specific file storage structure
    return true
  }

  /**
   * Get storage limit based on subscription tier
   */
  getStorageLimit(subscriptionTier: string): number {
    switch (subscriptionTier.toUpperCase()) {
      case 'FREE':
        return STORAGE_LIMITS.FREE
      case 'BASIC':
        return STORAGE_LIMITS.BASIC
      case 'PREMIUM':
        return STORAGE_LIMITS.PREMIUM
      case 'ENTERPRISE':
        return STORAGE_LIMITS.ENTERPRISE
      default:
        return STORAGE_LIMITS.FREE
    }
  }

  /**
   * Get comprehensive storage usage information
   */
  async getStorageUsage(subscriptionTier: string): Promise<StorageUsage> {
    const totalUsed = await this.calculateDirectoryUsage()
    const limit = this.getStorageLimit(subscriptionTier)
    
    const isUnlimited = limit === -1
    const percentage = isUnlimited ? 0 : Math.round((totalUsed / limit) * 100)
    const isOverLimit = !isUnlimited && totalUsed > limit
    const canUpload = isUnlimited || totalUsed < limit

    return {
      totalUsed,
      limit: isUnlimited ? -1 : limit,
      percentage,
      isOverLimit,
      canUpload,
      formattedUsed: this.formatBytes(totalUsed),
      formattedLimit: isUnlimited ? 'Unlimited' : this.formatBytes(limit)
    }
  }

  /**
   * Check if a file upload would exceed storage limit
   */
  async canUploadFile(fileSize: number, subscriptionTier: string): Promise<boolean> {
    const currentUsage = await this.calculateDirectoryUsage()
    const limit = this.getStorageLimit(subscriptionTier)
    
    if (limit === -1) return true // Unlimited
    
    return (currentUsage + fileSize) <= limit
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    if (bytes === -1) return 'Unlimited'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get storage usage percentage for UI display
   */
  async getUsagePercentage(subscriptionTier: string): Promise<number> {
    const usage = await this.getStorageUsage(subscriptionTier)
    return usage.percentage
  }

  /**
   * Check storage limits before file operations
   */
  async enforceStorageLimit(fileSize: number, subscriptionTier: string): Promise<{ allowed: boolean; message?: string }> {
    const canUpload = await this.canUploadFile(fileSize, subscriptionTier)
    
    if (!canUpload) {
      const usage = await this.getStorageUsage(subscriptionTier)
      return {
        allowed: false,
        message: `Storage limit exceeded. Used: ${usage.formattedUsed} / ${usage.formattedLimit}. Please upgrade your plan or delete some files.`
      }
    }
    
    return { allowed: true }
  }
}

export default StorageTracker
