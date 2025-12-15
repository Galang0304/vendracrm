import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Temporary in-memory storage for chat sessions
const chatSessions = new Map()

// POST - Clear chat history for admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminId = session.user.id

    // Clear chat session messages
    const chatSession = chatSessions.get(adminId)
    if (chatSession) {
      chatSession.messages = []
      chatSession.updatedAt = new Date()
      chatSessions.set(adminId, chatSession)
    }

    return NextResponse.json({
      message: 'Chat history cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing chat history:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
