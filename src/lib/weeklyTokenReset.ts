// Weekly Token Reset System - Simple & Effective
interface WeeklyUsage {
  companyId: string
  subscriptionTier: string
  tokensUsedThisWeek: number
  requestsThisWeek: number
  weekStartDate: Date
  weekEndDate: Date
  lastResetDate: Date
}

// In-memory storage for weekly usage
const weeklyUsageStore = new Map<string, WeeklyUsage>()

// Get start of current week (Monday 00:00)
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get end of current week (Sunday 23:59)
export const getWeekEnd = (date: Date = new Date()): Date => {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

// Get weekly token limits based on tier
export const getWeeklyLimits = (tier: string): { tokensPerWeek: number, requestsPerWeek: number } => {
  const limits = {
    'FREE': { tokensPerWeek: 5000, requestsPerWeek: 20 },
    'BASIC': { tokensPerWeek: 25000, requestsPerWeek: 100 },
    'PREMIUM': { tokensPerWeek: 75000, requestsPerWeek: 300 },
    'ENTERPRISE': { tokensPerWeek: 200000, requestsPerWeek: 1000 }
  }
  
  // Map tiers
  const tierMap: { [key: string]: keyof typeof limits } = {
    'FREE': 'FREE',
    'BASIC': 'BASIC',
    'MID': 'BASIC',
    'PREMIUM': 'PREMIUM',
    'PRO': 'PREMIUM',
    'ENTERPRISE': 'ENTERPRISE',
    'UNLIMITED': 'ENTERPRISE'
  }
  
  const mappedTier = tierMap[tier] || 'FREE'
  return limits[mappedTier]
}

// Get or create weekly usage record
export const getWeeklyUsage = (companyId: string, subscriptionTier: string): WeeklyUsage => {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(now)
  
  let usage = weeklyUsageStore.get(companyId)
  
  // Create new usage record or reset if new week
  if (!usage || usage.weekStartDate < weekStart) {
    usage = {
      companyId,
      subscriptionTier,
      tokensUsedThisWeek: 0,
      requestsThisWeek: 0,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      lastResetDate: weekStart
    }
    weeklyUsageStore.set(companyId, usage)
    
    if (usage.tokensUsedThisWeek > 0) {
      console.log(`🔄 Weekly reset for ${companyId} - New week started! Previous usage cleared.`)
    }
  }
  
  return usage
}

// Record token usage
export const recordWeeklyUsage = (companyId: string, subscriptionTier: string, tokensUsed: number): void => {
  const usage = getWeeklyUsage(companyId, subscriptionTier)
  usage.tokensUsedThisWeek += tokensUsed
  usage.requestsThisWeek += 1
  weeklyUsageStore.set(companyId, usage)
  
  console.log(`📊 Weekly usage updated for ${companyId}: ${usage.tokensUsedThisWeek} tokens, ${usage.requestsThisWeek} requests`)
}

// Check if usage is within weekly limits
export const checkWeeklyLimits = (companyId: string, subscriptionTier: string): {
  allowed: boolean
  tokensRemaining: number
  requestsRemaining: number
  tokensUsed: number
  requestsUsed: number
  weeklyLimits: { tokensPerWeek: number, requestsPerWeek: number }
  resetDate: Date
  daysUntilReset: number
} => {
  const usage = getWeeklyUsage(companyId, subscriptionTier)
  const limits = getWeeklyLimits(subscriptionTier)
  
  const tokensRemaining = Math.max(0, limits.tokensPerWeek - usage.tokensUsedThisWeek)
  const requestsRemaining = Math.max(0, limits.requestsPerWeek - usage.requestsThisWeek)
  
  const allowed = tokensRemaining > 0 && requestsRemaining > 0
  
  // Calculate days until reset (next Monday)
  const now = new Date()
  const nextWeekStart = new Date(usage.weekStartDate)
  nextWeekStart.setDate(nextWeekStart.getDate() + 7)
  const daysUntilReset = Math.ceil((nextWeekStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    allowed,
    tokensRemaining,
    requestsRemaining,
    tokensUsed: usage.tokensUsedThisWeek,
    requestsUsed: usage.requestsThisWeek,
    weeklyLimits: limits,
    resetDate: nextWeekStart,
    daysUntilReset: Math.max(0, daysUntilReset)
  }
}

// Get usage statistics for display
export const getWeeklyStats = (companyId: string, subscriptionTier: string): {
  tier: string
  currentWeek: {
    tokensUsed: number
    requestsUsed: number
    tokensLimit: number
    requestsLimit: number
  }
  progress: {
    tokensPercent: number
    requestsPercent: number
  }
  status: {
    isNearLimit: boolean
    isOverLimit: boolean
    warnings: string[]
  }
  resetInfo: {
    nextResetDate: Date
    daysUntilReset: number
    resetDay: string
  }
} => {
  const usage = getWeeklyUsage(companyId, subscriptionTier)
  const limits = getWeeklyLimits(subscriptionTier)
  const check = checkWeeklyLimits(companyId, subscriptionTier)
  
  const tokensPercent = (usage.tokensUsedThisWeek / limits.tokensPerWeek) * 100
  const requestsPercent = (usage.requestsThisWeek / limits.requestsPerWeek) * 100
  
  const warnings: string[] = []
  if (tokensPercent >= 90) warnings.push('⚠️ Token usage hampir mencapai batas mingguan')
  if (requestsPercent >= 90) warnings.push('⚠️ Request usage hampir mencapai batas mingguan')
  if (check.daysUntilReset <= 1) warnings.push('🔄 Reset mingguan dalam 1 hari')
  
  return {
    tier: subscriptionTier,
    currentWeek: {
      tokensUsed: usage.tokensUsedThisWeek,
      requestsUsed: usage.requestsThisWeek,
      tokensLimit: limits.tokensPerWeek,
      requestsLimit: limits.requestsPerWeek
    },
    progress: {
      tokensPercent: Math.min(100, tokensPercent),
      requestsPercent: Math.min(100, requestsPercent)
    },
    status: {
      isNearLimit: tokensPercent >= 80 || requestsPercent >= 80,
      isOverLimit: !check.allowed,
      warnings
    },
    resetInfo: {
      nextResetDate: check.resetDate,
      daysUntilReset: check.daysUntilReset,
      resetDay: check.resetDate.toLocaleDateString('id-ID', { weekday: 'long' })
    }
  }
}

// Manual reset for testing
export const manualWeeklyReset = (companyId: string): void => {
  weeklyUsageStore.delete(companyId)
  console.log(`🔄 Manual weekly reset for company ${companyId}`)
}

// Get all companies usage (admin view)
export const getAllWeeklyUsage = (): WeeklyUsage[] => {
  return Array.from(weeklyUsageStore.values())
}

// Cleanup old usage records (run periodically)
export const cleanupOldUsage = (): void => {
  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  let cleanedCount = 0
  for (const [companyId, usage] of weeklyUsageStore.entries()) {
    if (usage.weekStartDate < twoWeeksAgo) {
      weeklyUsageStore.delete(companyId)
      cleanedCount++
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old weekly usage records`)
  }
}
