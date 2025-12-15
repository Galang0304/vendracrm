import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getChatSession, getChatHistoryForDisplay, generateSessionId, getSessionStats, deleteSession } from '@/lib/chatHistoryPrisma'
import { prisma } from '@/lib/prisma'

// GET - Get chat session for current admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const adminId = session.user.id
    const companyId = session.user.companyId || 'default'
    
    // Get company subscription tier
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true }
    })
    const subscriptionTier = company?.subscriptionTier || 'FREE'

    // Get or create session (company isolated)
    const currentSession = await getChatSession(
      sessionId, 
      adminId, 
      session.user.name || 'Admin',
      session.user.role,
      companyId
    )
    
    const history = await getChatHistoryForDisplay(currentSession.sessionId)
    
    return NextResponse.json({
      sessionId: currentSession.sessionId,
      messages: history.messages || [],
      summary: history.summary,
      createdAt: currentSession.createdAt,
      adminName: currentSession.adminName,
      adminRole: currentSession.adminRole,
      subscriptionTier
    })
  } catch (error) {
    console.error('Error getting chat session:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
