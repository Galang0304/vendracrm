// Chat Persistence - User-Specific LocalStorage + Server Backup
interface ChatMessage {
  id: string
  message: string
  isUser: boolean
  timestamp: Date
  tokens?: number
  role?: string
}

interface ChatSessionData {
  sessionId: string
  messages: ChatMessage[]
  lastActivity: Date
  companyId: string
  userId: string
  subscriptionTier: string
}

const STORAGE_KEY_PREFIX = 'vendra-ai-chat'
const SESSION_ID_KEY_PREFIX = 'ai-chat-session-id'
const MAX_STORAGE_SESSIONS = 3 // Keep only last 3 sessions per user

// Generate user-specific storage key
const getUserStorageKey = (userId: string): string => {
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

// Generate user-specific session ID key
const getUserSessionIdKey = (userId: string): string => {
  return `${SESSION_ID_KEY_PREFIX}-${userId}`
}

// Save chat session to localStorage (user-specific)
export const saveChatToStorage = (sessionData: ChatSessionData): void => {
  try {
    const userStorageKey = getUserStorageKey(sessionData.userId)
    const existingSessions = getChatFromStorageByUser(sessionData.userId)
    
    // Update existing session or add new one
    const sessionIndex = existingSessions.findIndex(s => s.sessionId === sessionData.sessionId)
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = sessionData
    } else {
      existingSessions.push(sessionData)
    }
    
    // Keep only recent sessions (sorted by lastActivity)
    const sortedSessions = existingSessions
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, MAX_STORAGE_SESSIONS)
    
    localStorage.setItem(userStorageKey, JSON.stringify(sortedSessions))
    console.log(`💾 Chat saved to localStorage for user ${sessionData.userId}: ${sessionData.messages.length} messages`)
  } catch (error) {
    console.error('Error saving chat to storage:', error)
  }
}

// Get chat sessions from localStorage by user ID
export const getChatFromStorageByUser = (userId: string): ChatSessionData[] => {
  try {
    const userStorageKey = getUserStorageKey(userId)
    const stored = localStorage.getItem(userStorageKey)
    if (!stored) return []
    
    const sessions = JSON.parse(stored) as ChatSessionData[]
    return sessions.map((session: ChatSessionData) => ({
      ...session,
      lastActivity: new Date(session.lastActivity),
      messages: session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }))
  } catch (error) {
    console.error('Error getting chat from storage for user:', error)
    return []
  }
}

// Get chat sessions from localStorage (legacy - for backward compatibility)
export const getChatFromStorage = (): ChatSessionData[] => {
  try {
    // This is kept for backward compatibility but should not be used
    return []
  } catch (error) {
    console.error('Error getting chat from storage:', error)
    return []
  }
}

// Get specific session from localStorage by user
export const getSessionFromStorage = (sessionId: string, userId?: string): ChatSessionData | null => {
  try {
    if (!userId) return null
    const sessions = getChatFromStorageByUser(userId)
    return sessions.find(s => s.sessionId === sessionId) || null
  } catch (error) {
    console.error('Error getting session from storage:', error)
    return null
  }
}

// Remove session from localStorage by user
export const removeSessionFromStorage = (sessionId: string, userId: string): void => {
  try {
    const userStorageKey = getUserStorageKey(userId)
    const sessions = getChatFromStorageByUser(userId)
    const filteredSessions = sessions.filter(s => s.sessionId !== sessionId)
    localStorage.setItem(userStorageKey, JSON.stringify(filteredSessions))
    console.log(`🗑️ Session removed from localStorage for user ${userId}: ${sessionId}`)
  } catch (error) {
    console.error('Error removing session from storage:', error)
  }
}

// Clear all chat data from localStorage for specific user
export const clearAllChatStorage = (userId?: string): void => {
  try {
    if (userId) {
      // Clear specific user's data
      const userStorageKey = getUserStorageKey(userId)
      const userSessionIdKey = getUserSessionIdKey(userId)
      localStorage.removeItem(userStorageKey)
      localStorage.removeItem(userSessionIdKey)
      console.log(`🧹 Chat data cleared for user ${userId}`)
    } else {
      // Clear all legacy data (for backward compatibility)
      localStorage.removeItem('vendra-ai-chat')
      localStorage.removeItem('ai-chat-session-id')
      console.log('🧹 Legacy chat data cleared')
    }
  } catch (error) {
    console.error('Error clearing chat storage:', error)
  }
}

// Get current active session ID for user
export const getCurrentSessionId = (userId?: string): string | null => {
  try {
    if (!userId) {
      // Legacy fallback
      return localStorage.getItem('ai-chat-session-id')
    }
    const userSessionIdKey = getUserSessionIdKey(userId)
    return localStorage.getItem(userSessionIdKey)
  } catch (error) {
    console.error('Error getting current session ID:', error)
    return null
  }
}

// Set current active session ID for user
export const setCurrentSessionId = (sessionId: string, userId?: string): void => {
  try {
    if (!userId) {
      // Legacy fallback
      localStorage.setItem('ai-chat-session-id', sessionId)
      return
    }
    const userSessionIdKey = getUserSessionIdKey(userId)
    localStorage.setItem(userSessionIdKey, sessionId)
  } catch (error) {
    console.error('Error setting current session ID:', error)
  }
}

// Sync with server (user-specific)
export const syncWithServer = async (userId: string, companyId: string): Promise<void> => {
  try {
    const sessions = getChatFromStorageByUser(userId)
    if (sessions.length === 0) return

    // Send to server for backup
    const response = await fetch('/api/admin/chatbot/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions, userId, companyId })
    })

    if (response.ok) {
      console.log(`☁️ Synced ${sessions.length} sessions to server for user ${userId}`)
    }
  } catch (error) {
    console.error('Error syncing with server:', error)
  }
}

// Restore from server (user-specific)
export const restoreFromServer = async (userId: string, companyId: string): Promise<ChatSessionData | null> => {
  try {
    const response = await fetch(`/api/admin/chatbot/restore?userId=${userId}&companyId=${companyId}`)
    if (!response.ok) return null

    const data = await response.json()
    if (data.session) {
      // Save to localStorage
      saveChatToStorage(data.session)
      console.log(`☁️ Restored session from server for user ${userId}`)
      return data.session
    }
    return null
  } catch (error) {
    console.error('Error restoring from server:', error)
    return null
  }
}
