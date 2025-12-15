import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTierStatus } from '@/lib/tierLimits'
import { getCompanyUsage } from '@/lib/vendraAIConfig'

// GET - Get tier status and usage for current company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = session.user.companyId

    // Get tier status and limits
    const tierStatus = await getTierStatus(companyId)
    
    // Get AI usage statistics
    const aiUsage = getCompanyUsage(companyId)

    const response = {
      ...tierStatus,
      aiUsage: aiUsage ? {
        requestsThisHour: aiUsage.requestsThisHour,
        requestsToday: aiUsage.requestsToday,
        tokensToday: aiUsage.tokensToday,
        totalRequests: aiUsage.totalRequests,
        totalTokensUsed: aiUsage.totalTokensUsed,
        lastRequestTime: aiUsage.lastRequestTime
      } : null,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting tier status:', error)
    return NextResponse.json(
      { error: 'Failed to get tier status' },
      { status: 500 }
    )
  }
}
