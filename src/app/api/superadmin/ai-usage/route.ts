import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAllUsageStats, estimateCost, getVendraAIConfig } from '@/lib/vendraAIConfig'

// GET - SuperAdmin AI usage analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin access required' },
        { status: 401 }
      )
    }

    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
        isActive: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Get usage statistics from memory store
    const allUsageStats = getAllUsageStats()
    const vendraConfig = getVendraAIConfig()

    // Combine company data with usage stats
    const companiesWithUsage = companies.map(company => {
      const usage = allUsageStats.get(company.id)
      const estimatedCost = usage ? estimateCost(usage.totalTokensUsed) : 0

      return {
        companyId: company.id,
        companyName: company.name,
        subscriptionTier: company.subscriptionTier,
        isActive: company.isActive,
        owner: company.owner,
        
        // Usage stats
        totalRequests: usage?.totalRequests || 0,
        totalTokensUsed: usage?.totalTokensUsed || 0,
        requestsThisHour: usage?.requestsThisHour || 0,
        lastRequestTime: usage?.lastRequestTime || null,
        estimatedCost: estimatedCost,
        
        // Rate limits for this tier
        rateLimits: vendraConfig.rateLimits[company.subscriptionTier as keyof typeof vendraConfig.rateLimits] || vendraConfig.rateLimits.FREE
      }
    })

    // Calculate totals
    const totalStats = {
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.isActive).length,
      companiesWithUsage: companiesWithUsage.filter(c => c.totalRequests > 0).length,
      
      totalRequests: companiesWithUsage.reduce((sum, c) => sum + c.totalRequests, 0),
      totalTokensUsed: companiesWithUsage.reduce((sum, c) => sum + c.totalTokensUsed, 0),
      totalEstimatedCost: companiesWithUsage.reduce((sum, c) => sum + c.estimatedCost, 0),
      
      // Usage by tier
      usageByTier: {
        FREE: {
          companies: companiesWithUsage.filter(c => c.subscriptionTier === 'FREE').length,
          requests: companiesWithUsage.filter(c => c.subscriptionTier === 'FREE').reduce((sum, c) => sum + c.totalRequests, 0),
          tokens: companiesWithUsage.filter(c => c.subscriptionTier === 'FREE').reduce((sum, c) => sum + c.totalTokensUsed, 0),
          cost: companiesWithUsage.filter(c => c.subscriptionTier === 'FREE').reduce((sum, c) => sum + c.estimatedCost, 0)
        },
        BASIC: {
          companies: companiesWithUsage.filter(c => c.subscriptionTier === 'BASIC').length,
          requests: companiesWithUsage.filter(c => c.subscriptionTier === 'BASIC').reduce((sum, c) => sum + c.totalRequests, 0),
          tokens: companiesWithUsage.filter(c => c.subscriptionTier === 'BASIC').reduce((sum, c) => sum + c.totalTokensUsed, 0),
          cost: companiesWithUsage.filter(c => c.subscriptionTier === 'BASIC').reduce((sum, c) => sum + c.estimatedCost, 0)
        },
        PREMIUM: {
          companies: companiesWithUsage.filter(c => c.subscriptionTier === 'PREMIUM').length,
          requests: companiesWithUsage.filter(c => c.subscriptionTier === 'PREMIUM').reduce((sum, c) => sum + c.totalRequests, 0),
          tokens: companiesWithUsage.filter(c => c.subscriptionTier === 'PREMIUM').reduce((sum, c) => sum + c.totalTokensUsed, 0),
          cost: companiesWithUsage.filter(c => c.subscriptionTier === 'PREMIUM').reduce((sum, c) => sum + c.estimatedCost, 0)
        },
        ENTERPRISE: {
          companies: companiesWithUsage.filter(c => c.subscriptionTier === 'ENTERPRISE').length,
          requests: companiesWithUsage.filter(c => c.subscriptionTier === 'ENTERPRISE').reduce((sum, c) => sum + c.totalRequests, 0),
          tokens: companiesWithUsage.filter(c => c.subscriptionTier === 'ENTERPRISE').reduce((sum, c) => sum + c.totalTokensUsed, 0),
          cost: companiesWithUsage.filter(c => c.subscriptionTier === 'ENTERPRISE').reduce((sum, c) => sum + c.estimatedCost, 0)
        }
      },
      
      // Current hour activity
      currentHourActivity: companiesWithUsage.reduce((sum, c) => sum + c.requestsThisHour, 0)
    }

    return NextResponse.json({
      message: 'AI usage statistics retrieved successfully',
      vendraConfig: {
        isEnabled: vendraConfig.isEnabled,
        model: vendraConfig.model,
        hasApiKey: !!vendraConfig.openaiApiKey
      },
      totalStats,
      companies: companiesWithUsage.sort((a, b) => b.totalRequests - a.totalRequests) // Sort by usage
    })

  } catch (error) {
    console.error('Error fetching AI usage:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
