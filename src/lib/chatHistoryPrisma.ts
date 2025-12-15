// Prisma-based Chat History with Weekly Token Reset
import { prisma } from '@/lib/prisma'
import { getWeeklyStats, recordWeeklyUsage, checkWeeklyLimits } from '@/lib/weeklyTokenReset'

interface ChatMessage {
  id: string
  message: string
  isUser: boolean
  timestamp: Date
  tokens?: number
  role?: string
}

interface ChatSession {
  sessionId: string
  adminId: string
  adminName: string
  adminRole: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// Generate session ID
export const generateSessionId = (adminId: string): string => {
  return `session_${adminId}_${Date.now()}`
}

// Get or create chat session (Prisma) - FIXED: Company isolation
export const getChatSession = async (sessionId: string | null, adminId: string, adminName: string, adminRole: string, companyId?: string): Promise<ChatSession> => {
  try {
    let session = null
    
    // Try to find existing session (with company validation)
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { 
          id: sessionId,
          adminId: adminId  // Ensure session belongs to current user
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }
    
    // If no session found, get the most recent one for this admin only
    if (!session) {
      session = await prisma.chatSession.findFirst({
        where: { 
          adminId: adminId  // Only sessions for current user
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    }
    
    // Create new session if none exists
    if (!session) {
      const newSessionId = generateSessionId(adminId)
      session = await prisma.chatSession.create({
        data: {
          id: newSessionId,
          adminId,
          adminName,
          adminRole
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
      
      console.log(`🆕 Created new chat session: ${newSessionId} for ${adminName}`)
    } else {
      // Update session activity
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() }
      })
    }
    
    // Convert to our interface
    return {
      sessionId: session.id,
      adminId: session.adminId,
      adminName: session.adminName,
      adminRole: session.adminRole,
      messages: session.messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isUser: msg.isUser,
        timestamp: msg.createdAt,
        tokens: undefined, // We'll add this field later if needed
        role: msg.isUser ? 'user' : 'assistant'
      })),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }
  } catch (error) {
    console.error('Error getting chat session:', error)
    throw error
  }
}

// Add message to session (Prisma)
export const addMessageToSession = async (sessionId: string, message: string, isUser: boolean, tokens?: number, role?: string): Promise<ChatMessage[]> => {
  try {
    // Add new message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        adminId: (await prisma.chatSession.findUnique({ where: { id: sessionId } }))?.adminId || '',
        message,
        isUser
      }
    })
    
    // Update session activity
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })
    
    // Get updated messages with smart compression
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    if (!session) throw new Error('Session not found')
    
    // Smart compression: keep only last 50 messages per session
    const MAX_MESSAGES = 50
    if (session.messages.length > MAX_MESSAGES) {
      const messagesToDelete = session.messages.slice(0, session.messages.length - MAX_MESSAGES)
      
      await prisma.chatMessage.deleteMany({
        where: {
          id: { in: messagesToDelete.map(m => m.id) }
        }
      })
      
      console.log(`🗜️ Compressed ${messagesToDelete.length} old messages for session ${sessionId}`)
    }
    
    // Return updated messages
    const updatedSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    return updatedSession?.messages.map(msg => ({
      id: msg.id,
      message: msg.message,
      isUser: msg.isUser,
      timestamp: msg.createdAt,
      tokens,
      role: msg.isUser ? 'user' : 'assistant'
    })) || []
  } catch (error) {
    console.error('Error adding message to session:', error)
    throw error
  }
}

// Get chat history for AI context (Prisma)
export const getChatHistoryForAI = async (sessionId: string, contextLength: number = 10): Promise<any[]> => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: contextLength
    })
    
    return messages.reverse().map(msg => ({
      message: msg.message,
      isUser: msg.isUser,
      timestamp: msg.createdAt,
      role: msg.isUser ? 'user' : 'assistant'
    }))
  } catch (error) {
    console.error('Error getting chat history for AI:', error)
    return []
  }
}

// Get full chat history for display (Prisma)
export const getChatHistoryForDisplay = async (sessionId: string): Promise<{ messages: ChatMessage[], summary?: string }> => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    if (!session) {
      return { messages: [] }
    }
    
    return {
      messages: session.messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isUser: msg.isUser,
        timestamp: msg.createdAt,
        role: msg.isUser ? 'user' : 'assistant'
      }))
    }
  } catch (error) {
    console.error('Error getting chat history for display:', error)
    return { messages: [] }
  }
}

// Delete specific session (Prisma)
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    await prisma.chatSession.delete({
      where: { id: sessionId }
    })
    console.log(`🗑️ Deleted chat session: ${sessionId}`)
    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

// Get session statistics (Prisma)
export const getSessionStats = async (adminId: string): Promise<{
  activeSessions: number
  totalMessages: number
  oldestSession: Date | null
  newestSession: Date | null
}> => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { adminId },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })
    
    if (sessions.length === 0) {
      return {
        activeSessions: 0,
        totalMessages: 0,
        oldestSession: null,
        newestSession: null
      }
    }
    
    const totalMessages = sessions.reduce((sum, session) => sum + session._count.messages, 0)
    const sessionDates = sessions.map(s => s.createdAt)
    
    return {
      activeSessions: sessions.length,
      totalMessages,
      oldestSession: new Date(Math.min(...sessionDates.map(d => d.getTime()))),
      newestSession: new Date(Math.max(...sessionDates.map(d => d.getTime())))
    }
  } catch (error) {
    console.error('Error getting session stats:', error)
    return {
      activeSessions: 0,
      totalMessages: 0,
      oldestSession: null,
      newestSession: null
    }
  }
}

// Clean up old sessions (Prisma)
export const cleanupOldSessions = async (days: number = 30): Promise<void> => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const result = await prisma.chatSession.deleteMany({
      where: {
        updatedAt: { lt: cutoffDate }
      }
    })
    
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} old chat sessions (older than ${days} days)`)
    }
  } catch (error) {
    console.error('Error cleaning up old sessions:', error)
  }
}

// Get all sessions for admin (Prisma)
export const getAdminSessions = async (adminId: string): Promise<ChatSession[]> => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { adminId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    return sessions.map(session => ({
      sessionId: session.id,
      adminId: session.adminId,
      adminName: session.adminName,
      adminRole: session.adminRole,
      messages: session.messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isUser: msg.isUser,
        timestamp: msg.createdAt,
        role: msg.isUser ? 'user' : 'assistant'
      })),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }))
  } catch (error) {
    console.error('Error getting admin sessions:', error)
    return []
  }
}

// Weekly token integration
export const processMessageWithWeeklyTracking = async (
  sessionId: string,
  message: string,
  isUser: boolean,
  companyId: string,
  subscriptionTier: string,
  estimatedTokens: number = 0
): Promise<{
  messages: ChatMessage[]
  weeklyStats: any
  allowed: boolean
  error?: string
}> => {
  try {
    // Check weekly limits before processing
    const weeklyCheck = checkWeeklyLimits(companyId, subscriptionTier)
    
    if (!weeklyCheck.allowed && !isUser) {
      return {
        messages: [],
        weeklyStats: getWeeklyStats(companyId, subscriptionTier),
        allowed: false,
        error: `Weekly limit exceeded. Reset in ${weeklyCheck.daysUntilReset} days.`
      }
    }
    
    // Add message to session
    const messages = await addMessageToSession(sessionId, message, isUser, estimatedTokens)
    
    // Record usage for AI responses only
    if (!isUser && estimatedTokens > 0) {
      recordWeeklyUsage(companyId, subscriptionTier, estimatedTokens)
    }
    
    // Get updated weekly stats
    const weeklyStats = getWeeklyStats(companyId, subscriptionTier)
    
    return {
      messages,
      weeklyStats,
      allowed: true
    }
  } catch (error) {
    console.error('Error processing message with weekly tracking:', error)
    throw error
  }
}

// Auto cleanup job (run periodically)
export const startChatCleanupJob = (): void => {
  // Clean up every 24 hours
  setInterval(async () => {
    await cleanupOldSessions(30) // Keep sessions for 30 days
  }, 24 * 60 * 60 * 1000)
  
  console.log('🤖 Prisma chat cleanup job started (runs every 24 hours)')
}
