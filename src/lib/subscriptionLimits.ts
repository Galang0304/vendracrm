import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SubscriptionLimits {
  maxStores: number
  maxEmployees: number
  maxProducts: number
  hasAIAccess: boolean
  hasRFMAnalysis: boolean
  storageLimit: number // in bytes
}

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxStores: 1,
    maxEmployees: 1, // Only 1 cashier
    maxProducts: 100,
    hasAIAccess: false,
    hasRFMAnalysis: false,
    storageLimit: 100 * 1024 * 1024 * 1024 // 100GB
  },
  BASIC: {
    maxStores: 3,
    maxEmployees: 5,
    maxProducts: 1000,
    hasAIAccess: true,
    hasRFMAnalysis: true,
    storageLimit: 500 * 1024 * 1024 * 1024 // 500GB
  },
  PREMIUM: {
    maxStores: 10,
    maxEmployees: 20,
    maxProducts: 10000,
    hasAIAccess: true,
    hasRFMAnalysis: true,
    storageLimit: 1024 * 1024 * 1024 * 1024 // 1TB
  },
  ENTERPRISE: {
    maxStores: -1, // Unlimited
    maxEmployees: -1, // Unlimited
    maxProducts: -1, // Unlimited
    hasAIAccess: true,
    hasRFMAnalysis: true,
    storageLimit: -1 // Unlimited
  }
}

export class SubscriptionLimitChecker {
  private companyId: string
  private subscriptionTier: string

  constructor(companyId: string, subscriptionTier: string) {
    this.companyId = companyId
    this.subscriptionTier = subscriptionTier
  }

  /**
   * Get limits for current subscription tier
   */
  getLimits(): SubscriptionLimits {
    return SUBSCRIPTION_LIMITS[this.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.FREE
  }

  /**
   * Check if company can add a new store
   */
  async canAddStore(): Promise<{ allowed: boolean; message?: string; current: number; limit: number }> {
    const limits = this.getLimits()
    
    if (limits.maxStores === -1) {
      return { allowed: true, current: 0, limit: -1 }
    }

    const currentStores = await prisma.store.count({
      where: { companyId: this.companyId }
    })

    const allowed = currentStores < limits.maxStores
    
    return {
      allowed,
      current: currentStores,
      limit: limits.maxStores,
      message: allowed ? undefined : `Paket ${this.subscriptionTier} hanya dapat memiliki maksimal ${limits.maxStores} toko. Saat ini Anda sudah memiliki ${currentStores} toko. Upgrade paket untuk menambah toko.`
    }
  }

  /**
   * Check if company can add a new employee/cashier
   */
  async canAddEmployee(): Promise<{ allowed: boolean; message?: string; current: number; limit: number }> {
    const limits = this.getLimits()
    
    if (limits.maxEmployees === -1) {
      return { allowed: true, current: 0, limit: -1 }
    }

    const currentEmployees = await prisma.employee.count({
      where: { companyId: this.companyId }
    })

    const allowed = currentEmployees < limits.maxEmployees
    
    return {
      allowed,
      current: currentEmployees,
      limit: limits.maxEmployees,
      message: allowed ? undefined : `Paket ${this.subscriptionTier} hanya dapat memiliki maksimal ${limits.maxEmployees} karyawan/kasir. Saat ini Anda sudah memiliki ${currentEmployees} karyawan. Upgrade paket untuk menambah karyawan.`
    }
  }

  /**
   * Check if company can add a new product
   */
  async canAddProduct(): Promise<{ allowed: boolean; message?: string; current: number; limit: number }> {
    const limits = this.getLimits()
    
    if (limits.maxProducts === -1) {
      return { allowed: true, current: 0, limit: -1 }
    }

    const currentProducts = await prisma.product.count({
      where: { companyId: this.companyId }
    })

    const allowed = currentProducts < limits.maxProducts
    
    return {
      allowed,
      current: currentProducts,
      limit: limits.maxProducts,
      message: allowed ? undefined : `Paket ${this.subscriptionTier} hanya dapat memiliki maksimal ${limits.maxProducts} produk. Saat ini Anda sudah memiliki ${currentProducts} produk. Upgrade paket untuk menambah produk.`
    }
  }

  /**
   * Get current usage summary
   */
  async getUsageSummary() {
    const [stores, employees, products] = await Promise.all([
      this.canAddStore(),
      this.canAddEmployee(),
      this.canAddProduct()
    ])

    const limits = this.getLimits()

    return {
      stores: {
        current: stores.current,
        limit: stores.limit,
        percentage: stores.limit === -1 ? 0 : Math.round((stores.current / stores.limit) * 100),
        canAdd: stores.allowed
      },
      employees: {
        current: employees.current,
        limit: employees.limit,
        percentage: employees.limit === -1 ? 0 : Math.round((employees.current / employees.limit) * 100),
        canAdd: employees.allowed
      },
      products: {
        current: products.current,
        limit: products.limit,
        percentage: products.limit === -1 ? 0 : Math.round((products.current / products.limit) * 100),
        canAdd: products.allowed
      },
      features: {
        hasAIAccess: limits.hasAIAccess,
        hasRFMAnalysis: limits.hasRFMAnalysis
      }
    }
  }

  /**
   * Format limit display
   */
  static formatLimit(current: number, limit: number): string {
    if (limit === -1) return `${current} / Unlimited`
    return `${current} / ${limit}`
  }
}

export default SubscriptionLimitChecker
