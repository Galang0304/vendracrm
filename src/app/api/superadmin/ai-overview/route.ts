import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAllAISettings, hasCompanyAISettings } from '@/lib/aiSettingsStore'

// GET - SuperAdmin overview of all companies' AI settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin access required' },
        { status: 401 }
      )
    }

    // Get all companies from database
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        isActive: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all AI settings from memory store
    const allAISettings = getAllAISettings()

    // Combine company data with AI settings
    const companiesWithAI = companies.map(company => {
      const aiSettings = allAISettings.get(company.id)
      
      return {
        // Company info
        companyId: company.id,
        companyName: company.name,
        companyEmail: company.email,
        subscriptionTier: company.subscriptionTier,
        isActive: company.isActive,
        createdAt: company.createdAt,
        
        // Owner info
        owner: company.owner,
        
        // AI settings
        hasAISettings: hasCompanyAISettings(company.id),
        aiEnabled: aiSettings?.aiEnabled || false,
        hasApiKey: !!(aiSettings?.openaiApiKey),
        model: aiSettings?.model || 'Not Set',
        lastUpdated: aiSettings?.updatedAt || null,
        
        // Masked API key for security (only show first 8 and last 4 chars)
        apiKeyPreview: aiSettings?.openaiApiKey 
          ? `${aiSettings.openaiApiKey.substring(0, 8)}...${aiSettings.openaiApiKey.substring(aiSettings.openaiApiKey.length - 4)}`
          : null
      }
    })

    // Calculate statistics
    const stats = {
      totalCompanies: companies.length,
      companiesWithAI: companiesWithAI.filter(c => c.hasAISettings).length,
      activeAI: companiesWithAI.filter(c => c.aiEnabled && c.hasApiKey).length,
      pendingSetup: companiesWithAI.filter(c => !c.hasAISettings).length,
      
      // Breakdown by subscription tier
      byTier: {
        FREE: companiesWithAI.filter(c => c.subscriptionTier === 'FREE').length,
        BASIC: companiesWithAI.filter(c => c.subscriptionTier === 'BASIC').length,
        PREMIUM: companiesWithAI.filter(c => c.subscriptionTier === 'PREMIUM').length,
        ENTERPRISE: companiesWithAI.filter(c => c.subscriptionTier === 'ENTERPRISE').length,
      },
      
      // AI usage breakdown
      aiUsage: {
        withApiKey: companiesWithAI.filter(c => c.hasApiKey).length,
        enabled: companiesWithAI.filter(c => c.aiEnabled).length,
        gpt4oMini: companiesWithAI.filter(c => c.model === 'gpt-4o-mini').length,
        gpt4o: companiesWithAI.filter(c => c.model === 'gpt-4o').length,
      }
    }

    return NextResponse.json({
      message: 'AI overview retrieved successfully',
      stats,
      companies: companiesWithAI
    })

  } catch (error) {
    console.error('Error fetching AI overview:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
