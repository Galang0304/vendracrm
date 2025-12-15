'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  saveChatToStorage, 
  getSessionFromStorage, 
  getCurrentSessionId, 
  setCurrentSessionId,
  clearAllChatStorage,
  syncWithServer,
  restoreFromServer
} from '@/lib/chatPersistence'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import AITrainingPanel from '@/components/admin/AITrainingPanel'
import ChatMessage from '@/components/admin/ChatMessage'
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  RefreshCw, 
  MessageCircle,
  Sparkles,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Users,
  BarChart3
} from 'lucide-react'

interface ChatMessage {
  id: string
  message: string
  isUser: boolean
  timestamp: Date
  tokens?: number
  role?: string
}

// Component for FREE users
function FreeUserRestriction() {
  return (
    <DashboardLayout title="AI Assistant">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Fitur Premium
            </h2>
            <p className="text-gray-600 mb-6">
              Fitur ini hanya tersedia untuk pengguna berbayar. Upgrade paket Anda untuk mengakses fitur ini.
            </p>
            <button
              onClick={() => window.location.href = '/admin/upgrade'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Upgrade Sekarang
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Main wrapper component that handles routing
export default function AIAssistantPage() {
  const { data: session } = useSession()
  
  // Check subscription tier access first
  if (session?.user?.subscriptionTier === 'FREE') {
    return <FreeUserRestriction />
  }
  
  // Render the full AI assistant for paid users
  return <AIAssistantMain />
}

// Main AI Assistant component with all hooks
function AIAssistantMain(): React.JSX.Element {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionSummary, setSessionSummary] = useState<string | undefined>()
  const [messagesCount, setMessagesCount] = useState(0)
  const [usage, setUsage] = useState<any>(null)
  const [quotaStatus, setQuotaStatus] = useState<any>(null)
  const [subscriptionTier, setSubscriptionTier] = useState<string>('FREE')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user) {
      loadChatSession()
      loadQuotaStatus()
    }
  }, [session])

  const loadQuotaStatus = async () => {
    try {
      const response = await fetch('/api/admin/ai-quota')
      if (response.ok) {
        const data = await response.json()
        setQuotaStatus(data.quotaStatus)
        setSubscriptionTier(data.subscriptionTier)
      }
    } catch (error) {
      console.error('Error loading quota status:', error)
    }
  }

  // Chat cleanup handled by chatHistoryPrisma now
  useEffect(() => {
    // Cleanup job moved to chatHistoryPrisma
    console.log('🧹 Chat cleanup system active')
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set progress bar widths programmatically to avoid inline styles
  useEffect(() => {
    if (usage) {
      const progressBars = document.querySelectorAll('[data-width]') as NodeListOf<HTMLElement>
      
      if (progressBars[0]) {
        progressBars[0].style.width = `${Math.min(100, usage.progress.tokensPercent)}%`
      }
      if (progressBars[1]) {
        progressBars[1].style.width = `${Math.min(100, usage.progress.requestsPercent)}%`
      }
    }
  }, [usage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatSession = async () => {
    if (!session?.user) return
    
    try {
      // 1. Try to get existing session from localStorage first (user-specific)
      const savedSessionId = getCurrentSessionId(session.user.id)
      let sessionData = null
      
      if (savedSessionId) {
        sessionData = getSessionFromStorage(savedSessionId, session.user.id)
      }
      
      // 2. If found in localStorage, use it
      if (sessionData && sessionData.messages.length > 0) {
        setSessionId(sessionData.sessionId)
        setMessages(sessionData.messages)
        setMessagesCount(sessionData.messages.length)
        console.log(`📱 Loaded ${sessionData.messages.length} messages from localStorage`)
        return
      }
      
      // 3. Try to restore from server
      const restoredData = await restoreFromServer(session.user.id, session.user.companyId || 'default')
      if (restoredData && restoredData.messages.length > 0) {
        setSessionId(restoredData.sessionId)
        setMessages(restoredData.messages)
        setMessagesCount(restoredData.messages.length)
        console.log(`☁️ Restored ${restoredData.messages.length} messages from server`)
        return
      }
      
      // 4. Create new session with welcome message
      const response = await fetch('/api/admin/chatbot/session')
      if (response.ok) {
        const data = await response.json()
        const newSessionId = data.sessionId
        
        const welcomeMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          message: getWelcomeMessage(),
          isUser: false,
          timestamp: new Date()
        }
        
        setSessionId(newSessionId)
        setMessages([welcomeMessage])
        setMessagesCount(1)
        setCurrentSessionId(newSessionId, session.user.id)
        
        // Save to localStorage
        const newSessionData = {
          sessionId: newSessionId,
          messages: [welcomeMessage],
          lastActivity: new Date(),
          companyId: session.user.companyId || 'default',
          userId: session.user.id,
          subscriptionTier: session.user.subscriptionTier || 'FREE'
        }
        saveChatToStorage(newSessionData)
        
        console.log(`🆕 Created new session: ${newSessionId}`)
      }
    } catch (error) {
      console.error('Error loading chat session:', error)
      // Fallback welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        message: getWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  const getWelcomeMessage = () => {
    const adminName = session?.user.name || 'Admin'
    const role = session?.user.role || 'ADMIN'
    
    const welcomeMessages = {
      SUPERADMIN: `🌟 Selamat datang di AI Assistant Dashboard, ${adminName}!

Sebagai SuperAdmin, Anda memiliki akses ke AI Assistant paling canggih dengan kemampuan:

🏢 **Multi-Company Analytics**
• Analisis performa lintas perusahaan
• Benchmark dan comparison metrics
• Global trend analysis

🔐 **Advanced System Management**
• Security audit dan compliance monitoring
• System performance optimization
• Global configuration recommendations

📊 **Enterprise Reporting**
• Executive dashboard insights
• Cross-company performance reports
• Strategic planning assistance

Ketik pertanyaan Anda atau pilih salah satu quick action di bawah untuk memulai!`,

      ADMIN: `👋 Halo ${adminName}! Selamat datang di AI Assistant Dashboard.

Sebagai Admin, AI Assistant siap membantu Anda dengan:

👥 **Team & Operations Management**
• Employee performance analysis
• Operational efficiency insights
• Process optimization recommendations

📦 **Inventory & Product Analysis**
• Stock level monitoring
• Product performance insights
• Procurement recommendations

💰 **Financial & Sales Analytics**
• Revenue analysis dan forecasting
• Sales trend identification
• Cost optimization strategies

Mulai percakapan dengan mengetik pertanyaan atau gunakan quick actions!`,

      OWNER: `🎯 Selamat datang ${adminName}! AI Assistant khusus Owner siap membantu.

Sebagai Owner, fokus AI Assistant untuk Anda:

🚀 **Business Growth Strategy**
• Market expansion opportunities
• Competitive analysis insights
• Growth planning assistance

💼 **Profitability & ROI Analysis**
• Revenue optimization strategies
• Investment return calculations
• Cost-benefit analysis

🎯 **Customer Experience Enhancement**
• Customer satisfaction insights
• Loyalty program recommendations
• Service quality improvements

Mari mulai dengan strategi bisnis yang ingin Anda kembangkan!`
    }

    return welcomeMessages[role as keyof typeof welcomeMessages] || welcomeMessages.ADMIN
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session?.user) return

    const currentMessage = inputMessage
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      message: currentMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          adminId: session?.user.id,
          adminName: session?.user.name,
          adminRole: session?.user.role,
          sessionId: sessionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🎯 Received AI response:', data.message?.substring(0, 100) + '...')
        const botMessage: ChatMessage = {
          id: `msg_${Date.now()}_bot`,
          message: data.message,
          isUser: false,
          timestamp: new Date()
        }
        
        setMessages(prev => {
          const newMessages = [...prev, botMessage]
          
          // Save to localStorage immediately
          if (session?.user && data.sessionId) {
            const sessionData = {
              sessionId: data.sessionId,
              messages: newMessages,
              lastActivity: new Date(),
              companyId: session.user.companyId || 'default',
              userId: session.user.id,
              subscriptionTier: session.user.subscriptionTier || 'FREE'
            }
            saveChatToStorage(sessionData)
            
            // Sync with server periodically (every 5 messages)
            if (newMessages.length % 5 === 0) {
              syncWithServer(session.user.id, session.user.companyId || 'default')
            }
          }
          
          return newMessages
        })
        
        // Update session info
        if (data.sessionId) {
          setSessionId(data.sessionId)
          setCurrentSessionId(data.sessionId, session.user.id)
        }
        if (data.messagesCount) setMessagesCount(data.messagesCount)
        if (data.usage) setUsage(data.usage)
        if (data.quotaStatus) {
          setQuotaStatus(data.quotaStatus)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    try {
      // Clear all chat storage (localStorage + sessionId) for current user
      clearAllChatStorage(session?.user?.id)
      
      // Clear session from server if exists
      if (sessionId) {
        await fetch('/api/admin/chatbot/session', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        })
      }
      
      // Reset state
      setMessages([])
      setSessionId(null)
      setUsage(null)
      setMessagesCount(0)
      setSessionSummary(undefined)
      
      // Load new session
      await loadChatSession()
      
      console.log('🧹 Chat cleared successfully')
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    {
      title: "Laporan Bisnis",
      description: "Minta laporan performa bisnis terkini",
      message: "Buatkan laporan performa bisnis untuk minggu ini",
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      title: "Analisis Penjualan", 
      description: "Analisis trend dan insights penjualan",
      message: "Analisis trend penjualan dan berikan insights untuk meningkatkan revenue",
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      title: "Rekomendasi Strategi",
      description: "Dapatkan rekomendasi strategis untuk bisnis",
      message: "Berikan rekomendasi strategi untuk mengoptimalkan operasional bisnis",
      icon: Target,
      color: "bg-purple-500"
    },
    {
      title: "Optimasi Tim",
      description: "Tips untuk meningkatkan produktivitas tim",
      message: "Bagaimana cara meningkatkan produktivitas dan performa tim karyawan?",
      icon: Users,
      color: "bg-orange-500"
    }
  ]

  const handleQuickAction = (message: string) => {
    setInputMessage(message)
  }

  if (!session?.user) {
    return (
      <DashboardLayout title="AI Assistant">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please login to access AI Assistant.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="AI Assistant">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">AI Assistant</h2>
              <p className="text-blue-100">
                Halo {session?.user?.name}! Saya siap membantu Anda dengan analisis bisnis dan rekomendasi strategis.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <span className="bg-blue-500/30 px-3 py-1 rounded-full">
                  Powered by Vendra AI
                </span>
                <span className="bg-purple-500/30 px-3 py-1 rounded-full">
                  Subscription Tier: {session?.user?.subscriptionTier || 'FREE'}
                </span>
              </div>
            </div>
            <Bot className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chat dengan AI Assistant</h3>
                    <p className="text-sm text-gray-500">
                      {messages.length} pesan • Online
                    </p>
                  </div>
                </div>
                
                {/* Quota Status Display */}
                {quotaStatus && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {subscriptionTier} Plan
                      </div>
                      {quotaStatus.unlimited ? (
                        <div className="text-sm font-medium text-green-600">
                          ∞ Unlimited
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className={`font-medium ${
                            quotaStatus.requestsPercent > 80 ? 'text-red-600' : 
                            quotaStatus.requestsPercent > 60 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {quotaStatus.requestsRemaining}/{quotaStatus.requestsLimit}
                          </span>
                          <span className="text-gray-500 ml-1">requests</span>
                        </div>
                      )}
                    </div>
                    {!quotaStatus.unlimited && (
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            quotaStatus.requestsPercent > 80 ? 'bg-red-500' : 
                            quotaStatus.requestsPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, quotaStatus.requestsPercent)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadChatSession}
                    className="text-gray-400 hover:text-gray-600 p-2"
                    title="Refresh Chat"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="text-gray-400 hover:text-red-600 p-2"
                    title="Clear Chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quota Warning */}
              {quotaStatus && !quotaStatus.unlimited && quotaStatus.requestsPercent > 80 && (
                <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800">
                        Quota AI Chat Hampir Habis
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Tersisa {quotaStatus.requestsRemaining} dari {quotaStatus.requestsLimit} request. 
                        Reset pada: {new Date(quotaStatus.resetDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      {subscriptionTier === 'BASIC' && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Upgrade ke PREMIUM untuk mendapatkan 100% quota atau ENTERPRISE untuk unlimited access.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-2">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message.message}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-white border border-gray-200">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan Anda di sini..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    title="Send message"
                    aria-label="Send message to AI Assistant"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Capabilities
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Zap className="h-4 w-4 text-yellow-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Real-time Analysis</p>
                    <p className="text-xs text-gray-600">Analisis data bisnis secara real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Strategic Insights</p>
                    <p className="text-xs text-gray-600">Rekomendasi strategis berbasis data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure & Private</p>
                    <p className="text-xs text-gray-600">Data Anda aman dan terlindungi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Quota Status */}
            {quotaStatus && (
              <div className={`rounded-lg shadow-sm border p-6 ${
                quotaStatus.unlimited 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : quotaStatus.requestsPercent > 80 
                    ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    : quotaStatus.requestsPercent > 60
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  AI Chat Quota
                </h3>
                <div className="space-y-4">
                  {/* Subscription Tier */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      subscriptionTier === 'ENTERPRISE' ? 'text-purple-700 bg-purple-100' :
                      subscriptionTier === 'PREMIUM' ? 'text-blue-700 bg-blue-100' :
                      subscriptionTier === 'BASIC' ? 'text-green-700 bg-green-100' :
                      'text-gray-700 bg-gray-100'
                    }`}>
                      {subscriptionTier}
                    </span>
                  </div>

                  {/* Request Usage */}
                  {quotaStatus.unlimited ? (
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
                      <div className="text-sm font-medium text-green-700">Unlimited Requests</div>
                      <div className="text-xs text-green-600">ENTERPRISE Plan</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Requests This Week:</span>
                        <span className={`text-sm font-bold ${
                          quotaStatus.requestsPercent > 80 ? 'text-red-600' :
                          quotaStatus.requestsPercent > 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {quotaStatus.requestsUsed} / {quotaStatus.requestsLimit}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            quotaStatus.requestsPercent > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            quotaStatus.requestsPercent > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, quotaStatus.requestsPercent)}%` }}
                        />
                      </div>
                      
                      {/* Percentage */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          {quotaStatus.requestsRemaining} requests remaining
                        </span>
                        <span className={`font-medium ${
                          quotaStatus.requestsPercent > 80 ? 'text-red-600' :
                          quotaStatus.requestsPercent > 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {quotaStatus.requestsPercent.toFixed(1)}% used
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reset Date */}
                  {!quotaStatus.unlimited && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Quota resets:</span>
                        <span className="font-medium text-gray-700">
                          {new Date(quotaStatus.resetDate).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upgrade Suggestion */}
                  {subscriptionTier === 'BASIC' && quotaStatus.requestsPercent > 50 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-blue-800">Upgrade Suggestion</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Upgrade ke PREMIUM untuk 2x quota atau ENTERPRISE untuk unlimited access
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weekly Usage & Limits */}
            {usage && usage.weekly && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Legacy Usage Stats
                </h3>
                <div className="space-y-4">
                  {/* Tier Badge */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Subscription Tier:</span>
                    <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      {usage.tier}
                    </span>
                  </div>

                  {/* Token Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tokens This Week:</span>
                      <span className="text-sm font-bold text-green-700">
                        {usage.weekly.tokensUsed.toLocaleString()} / {usage.weekly.tokensLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          usage.progress.tokensPercent >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          usage.progress.tokensPercent >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        data-width={Math.min(100, usage.progress.tokensPercent)}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      {usage.progress.tokensPercent.toFixed(1)}% used
                    </div>
                  </div>

                  {/* Request Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Requests This Week:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {usage.weekly.requestsUsed} / {usage.weekly.requestsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          usage.progress.requestsPercent >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          usage.progress.requestsPercent >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        data-width={Math.min(100, usage.progress.requestsPercent)}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      {usage.progress.requestsPercent.toFixed(1)}% used
                    </div>
                  </div>

                  {/* Remaining Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600">Tokens Remaining</div>
                      <div className="text-sm font-bold text-green-600">
                        {usage.weekly.tokensRemaining.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-xs text-gray-600">Requests Remaining</div>
                      <div className="text-sm font-bold text-blue-600">
                        {usage.weekly.requestsRemaining}
                      </div>
                    </div>
                  </div>

                  {/* Reset Info */}
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Weekly Reset</div>
                    <div className="text-sm font-medium text-gray-800">
                      {usage.weekly.daysUntilReset === 0 ? 'Today' : 
                       usage.weekly.daysUntilReset === 1 ? 'Tomorrow' : 
                       `${usage.weekly.daysUntilReset} days`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(usage.weekly.resetDate).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>

                  {/* Warnings */}
                  {usage.warnings && usage.warnings.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                      {usage.warnings.map((warning: string, index: number) => (
                        <div key={index} className="text-sm text-yellow-800 flex items-center mb-1 last:mb-0">
                          <span className="mr-2">⚠️</span>
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.message)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips Penggunaan</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Gunakan bahasa yang jelas dan spesifik</p>
                <p>• Sebutkan periode waktu untuk analisis</p>
                <p>• Minta contoh konkret untuk implementasi</p>
                <p>• Gunakan quick actions untuk memulai</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
