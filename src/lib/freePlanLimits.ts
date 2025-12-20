import { prisma } from '@/lib/prisma'

// FREE plan limitations
export const FREE_PLAN_LIMITS = {
  MAX_STORES: 1,
  MAX_CASHIERS: 1,
  MAX_DATABASE_ROWS: 1000,
  AI_ENABLED: false,
  FEATURES: {
    AI_CHAT: false,
    MULTIPLE_STORES: false,
    UNLIMITED_CASHIERS: false,
    ADVANCED_ANALYTICS: false,
    CUSTOM_BRANDING: false,
    API_ACCESS: true, // Basic API access allowed
    BASIC_REPORTS: true,
    INVENTORY_MANAGEMENT: true,
    TRANSACTION_PROCESSING: true
  }
}

// Check if company has reached FREE plan limits
export async function checkFreePlanLimits(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      stores: true,
      employees: {
        where: { role: 'KASIR' }
      },
      products: true,
      transactions: true,
      customers: true
    }
  })

  if (!company || company.subscriptionTier !== 'FREE') {
    return { withinLimits: true, limits: FREE_PLAN_LIMITS }
  }

  const totalRows = company.products.length + 
                   company.transactions.length + 
                   company.customers.length

  return {
    withinLimits: company.stores.length <= FREE_PLAN_LIMITS.MAX_STORES &&
                  company.employees.length <= FREE_PLAN_LIMITS.MAX_CASHIERS &&
                  totalRows <= FREE_PLAN_LIMITS.MAX_DATABASE_ROWS,
    currentUsage: {
      stores: company.stores.length,
      cashiers: company.employees.length,
      databaseRows: totalRows
    },
    limits: FREE_PLAN_LIMITS
  }
}

// Middleware to check FREE plan limits before creating resources
export async function enforceFreePlanLimits(
  companyId: string, 
  resourceType: 'store' | 'cashier' | 'product' | 'transaction' | 'customer'
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company || company.subscriptionTier !== 'FREE') {
    return { allowed: true }
  }

  const limits = await checkFreePlanLimits(companyId)
  
  if (!limits.withinLimits) {
    return {
      allowed: false,
      message: 'Batas paket FREE telah tercapai. Upgrade ke paket berbayar untuk fitur lebih lengkap.',
      currentUsage: limits.currentUsage,
      maxLimits: limits.limits
    }
  }

  // Check specific resource limits
  switch (resourceType) {
    case 'store':
      if (limits.currentUsage && limits.currentUsage.stores >= FREE_PLAN_LIMITS.MAX_STORES) {
        return {
          allowed: false,
          message: `Paket FREE hanya dapat membuat ${FREE_PLAN_LIMITS.MAX_STORES} toko. Upgrade untuk membuat lebih banyak toko.`
        }
      }
      break
    
    case 'cashier':
      if (limits.currentUsage && limits.currentUsage.cashiers >= FREE_PLAN_LIMITS.MAX_CASHIERS) {
        return {
          allowed: false,
          message: `Paket FREE hanya dapat membuat ${FREE_PLAN_LIMITS.MAX_CASHIERS} akun kasir. Upgrade untuk menambah kasir.`
        }
      }
      break
    
    case 'product':
    case 'transaction':
    case 'customer':
      if (limits.currentUsage && limits.currentUsage.databaseRows >= FREE_PLAN_LIMITS.MAX_DATABASE_ROWS) {
        return {
          allowed: false,
          message: `Paket FREE dibatasi ${FREE_PLAN_LIMITS.MAX_DATABASE_ROWS} data. Saat ini: ${limits.currentUsage.databaseRows}. Upgrade untuk kapasitas lebih besar.`
        }
      }
      break
  }

  return { allowed: true }
}
