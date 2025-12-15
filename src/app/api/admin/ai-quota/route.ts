import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AiQuotaManager } from '@/lib/aiQuotaManager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = session.user.companyId || 'default'
    
    // Get company subscription tier
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true, name: true }
    })
    const subscriptionTier = company?.subscriptionTier || 'FREE'

    // Get quota status
    const quotaStatus = await AiQuotaManager.getQuotaStatus(companyId, subscriptionTier)

    return NextResponse.json({
      quotaStatus,
      subscriptionTier,
      companyName: company?.name || 'Company'
    })

  } catch (error) {
    console.error('Error fetching AI quota:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
