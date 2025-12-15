'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface ChatMessage {
  id: string
  message: string
  isUser: boolean
  timestamp: Date
  adminId: string
}

interface ChatSession {
  id: string
  adminId: string
  adminName: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export default function AIChatbot() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user && isOpen) {
      loadChatSession()
    }
  }, [session, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatSession = async () => {
    try {
      const response = await fetch('/api/admin/chatbot/session')
      if (response.ok) {
        const data = await response.json()
        setChatSession(data)
        setMessages(data.messages || [])
      } else {
        // Create new session with welcome message
        const welcomeMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          message: getWelcomeMessage(),
          isUser: false,
          timestamp: new Date(),
          adminId: session?.user.id || ''
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error loading chat session:', error)
    }
  }

  const getWelcomeMessage = () => {
    const adminName = session?.user.name || 'Admin'
    const role = session?.user.role || 'ADMIN'
    
    const welcomeMessages = {
      SUPERADMIN: `Halo ${adminName}! 👋 Saya adalah AI Assistant khusus untuk SuperAdmin. Saya dapat membantu Anda dengan:
      
• 📊 Analisis data multi-company
• 🏢 Manajemen sistem global
• 📈 Laporan performa keseluruhan
• ⚙️ Konfigurasi sistem advanced
• 🔐 Manajemen keamanan tingkat tinggi

Apa yang bisa saya bantu hari ini?`,

      ADMIN: `Selamat datang ${adminName}! 👋 Saya adalah AI Assistant untuk Admin. Saya siap membantu Anda dengan:

• 👥 Manajemen karyawan dan toko
• 📦 Analisis inventory dan produk  
• 💰 Laporan keuangan dan transaksi
• 🎯 Strategi bisnis dan marketing
• 📊 Dashboard analytics dan insights

Ada yang bisa saya bantu untuk mengoptimalkan bisnis Anda?`,

      OWNER: `Halo ${adminName}! 👋 Sebagai AI Assistant khusus Owner, saya dapat membantu Anda dengan:

• 🏪 Strategi pengembangan bisnis
• 💼 Analisis ROI dan profitabilitas
• 📈 Perencanaan ekspansi toko
• 👨‍💼 Manajemen tim dan operasional
• 🎯 Optimasi customer experience

Bagaimana saya bisa membantu mengembangkan bisnis Anda hari ini?`
    }

    return welcomeMessages[role as keyof typeof welcomeMessages] || welcomeMessages.ADMIN
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session?.user) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      message: inputMessage,
      isUser: true,
      timestamp: new Date(),
      adminId: session.user.id
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
          message: inputMessage,
          adminId: session.user.id,
          adminName: session.user.name,
          adminRole: session.user.role,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: ChatMessage = {
          id: `msg_${Date.now()}_bot`,
          message: data.response,
          isUser: false,
          timestamp: new Date(),
          adminId: session.user.id
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.',
        isUser: false,
        timestamp: new Date(),
        adminId: session.user.id
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    try {
      await fetch('/api/admin/chatbot/clear', {
        method: 'POST'
      })
      setMessages([])
      loadChatSession() // Reload with welcome message
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

  if (!session?.user) return null

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
          title="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-gray-100">
                  Personal untuk {session.user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white p-1"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 h-[480px] overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${
                        message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`p-2 rounded-full ${
                          message.isUser 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          {message.isUser ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.isUser
                            ? 'bg-gray-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isUser ? 'text-gray-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="p-2 rounded-full bg-white border border-gray-200">
                          <Bot className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg">
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
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={clearChat}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Clear Chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={loadChatSession}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan Anda..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send Message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
