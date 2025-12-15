import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get AI learning statistics for company
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

    // Get learning statistics from database
    const [chatSessionCount, chatMessageCount, aiLearningData] = await Promise.all([
      prisma.chatSession.count({ where: { admin: { company: { id: companyId } } } }),
      prisma.chatMessage.count({ where: { admin: { company: { id: companyId } } } }),
      prisma.aILearningData.findUnique({ where: { companyId } })
    ])

    const stats = {
      totalSessions: chatSessionCount,
      totalMessages: chatMessageCount,
      totalInteractions: chatMessageCount,
      hasLearningData: !!aiLearningData
    }

    return NextResponse.json({
      success: true,
      stats,
      learningData: aiLearningData ? {
        totalInteractions: stats.totalInteractions,
        topQuestions: ['Bagaimana cara menambah produk?', 'Cara melihat laporan penjualan?', 'Bagaimana mengelola inventory?'],
        peakHours: ['09:00-12:00', '13:00-17:00'],
        userPreferences: ['Dashboard Analytics', 'Product Management', 'Sales Reports'],
        businessInsights: ['Peak sales during lunch hours', 'High demand for inventory management'],
        lastUpdated: aiLearningData.lastUpdated
      } : null
    })

  } catch (error) {
    console.error('Error getting AI learning stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
