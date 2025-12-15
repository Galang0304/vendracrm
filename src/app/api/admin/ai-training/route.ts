import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIBusinessIntelligence } from '@/lib/aiBusinessIntelligence'

// POST - Train AI with business data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = session.user.companyId
    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    console.log(`🤖 Starting AI training for company: ${companyId}`)

    // Initialize AI Business Intelligence
    await AIBusinessIntelligence.initialize()

    // Analyze and learn business data
    const profile = await AIBusinessIntelligence.analyzeAndLearnBusiness(companyId)

    return NextResponse.json({
      success: true,
      message: 'AI training completed successfully',
      profile: {
        companyName: profile.companyName,
        industry: profile.industry,
        businessType: profile.businessType,
        learningScore: profile.learningScore,
        insights: {
          strengths: profile.insights.strengths,
          opportunities: profile.insights.opportunities,
          recommendations: profile.insights.recommendations.slice(0, 3) // Top 3 recommendations
        },
        products: {
          categories: profile.products.categories,
          topSellers: profile.products.topSellers.slice(0, 5) // Top 5 sellers
        },
        operations: {
          peakHours: profile.operations.peakHours,
          challenges: profile.operations.challenges
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error training AI:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get AI learning status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = session.user.companyId
    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    // Load existing business profile
    const profile = await AIBusinessIntelligence.loadBusinessProfile(companyId)

    if (!profile) {
      return NextResponse.json({
        success: true,
        trained: false,
        message: 'AI belum dilatih untuk bisnis ini. Klik "Train AI" untuk memulai.',
        learningScore: 0
      })
    }

    return NextResponse.json({
      success: true,
      trained: true,
      profile: {
        companyName: profile.companyName,
        industry: profile.industry,
        businessType: profile.businessType,
        learningScore: profile.learningScore,
        lastUpdated: profile.lastUpdated,
        totalInteractions: profile.conversationPatterns.commonQuestions.length,
        topQuestions: profile.conversationPatterns.commonQuestions.slice(0, 5),
        insights: {
          strengths: profile.insights.strengths,
          opportunities: profile.insights.opportunities,
          recommendations: profile.insights.recommendations.slice(0, 3)
        }
      }
    })

  } catch (error) {
    console.error('Error getting AI training status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
