import { prisma } from '@/lib/prisma'

export async function checkAndUpdateExpiredSubscriptions() {
  try {
    const now = new Date()
    
    // Find all companies with expired subscriptions that are not FREE
    const expiredCompanies = await prisma.company.findMany({
      where: {
        subscriptionExpiry: {
          lt: now
        },
        subscriptionTier: {
          not: 'FREE'
        },
        isActive: true
      }
    })

    // Update expired companies to FREE tier
    for (const company of expiredCompanies) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          subscriptionTier: 'FREE',
          isActive: false,
          subscriptionExpiry: null
        }
      })
      
      console.log(`Company ${company.name} (${company.id}) downgraded to FREE due to expiration`)
    }

    return {
      success: true,
      updatedCount: expiredCompanies.length,
      updatedCompanies: expiredCompanies.map(c => ({ id: c.id, name: c.name }))
    }
  } catch (error) {
    console.error('Error checking expired subscriptions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function scheduleSubscriptionCheck() {
  // Run the check immediately
  await checkAndUpdateExpiredSubscriptions()
  
  // Schedule to run every hour
  setInterval(async () => {
    await checkAndUpdateExpiredSubscriptions()
  }, 60 * 60 * 1000) // 1 hour in milliseconds
}
