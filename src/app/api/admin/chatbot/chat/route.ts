import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateGeminiResponse, getGeminiSystemPrompt, GEMINI_CONFIG } from '@/lib/geminiAI'
import { generateOpenAIResponse } from '@/lib/openaiAI'
// Legacy business context - keeping for backward compatibility
import { AIBusinessContextProvider, generateAIContextString } from '@/lib/aiBusinessContext'
import { generateSuperAdminAIResponse } from '@/lib/superAdminAI'
import { generateEnhancedSimulatedResponse } from '@/lib/enhancedAISimulator'
import { AIBusinessIntelligence } from '@/lib/aiBusinessIntelligence'
import { getChatSession, addMessageToSession, getChatHistoryForAI, generateSessionId, processMessageWithWeeklyTracking } from '@/lib/chatHistoryPrisma'
import { prisma } from '@/lib/prisma'
import { AiQuotaManager } from '@/lib/aiQuotaManager'

// Helper function to fetch analytics data for AI directly from database
async function fetchAnalyticsData(companyId: string, role: string, period: string = '30d') {
  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30) // Default 30 days
    
    // Get transactions with items for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, category: true } }
          }
        },
        customer: { select: { name: true } },
        store: { select: { name: true } }
      }
    })
    
    // Calculate analytics
    const totalTransactions = transactions.length
    const totalRevenue = transactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0
    )
    const totalItems = transactions.reduce((sum, t) => sum + t.items.length, 0)
    
    // Calculate today's revenue
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt)
      return transactionDate >= today && transactionDate < tomorrow
    })
    
    const todayRevenue = todayTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0), 0
    )
    
    // Get unique customers
    const uniqueCustomers = new Set(transactions.map(t => t.customerId).filter(Boolean))
    const totalCustomers = uniqueCustomers.size
    
    // Calculate average order value
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    
    // Get top products
    const productStats = new Map()
    transactions.forEach(t => {
      t.items.forEach(item => {
        const productName = item.product?.name || 'Unknown Product'
        const current = productStats.get(productName) || { quantity: 0, revenue: 0 }
        productStats.set(productName, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + Number(item.totalPrice)
        })
      })
    })
    
    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Get store performance
    const storeStats = new Map()
    transactions.forEach(t => {
      const storeName = t.store?.name || 'Default Store'
      const current = storeStats.get(storeName) || { transactions: 0, revenue: 0 }
      const transactionRevenue = t.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      storeStats.set(storeName, {
        transactions: current.transactions + 1,
        revenue: current.revenue + transactionRevenue
      })
    })
    
    const storePerformance = Array.from(storeStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
    
    // Get daily trends with actual dates
    const dailyStats = new Map()
    transactions.forEach(t => {
      const date = new Date(t.createdAt)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const current = dailyStats.get(dateKey) || { transactions: 0, revenue: 0 }
      const transactionRevenue = t.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      dailyStats.set(dateKey, {
        transactions: current.transactions + 1,
        revenue: current.revenue + transactionRevenue
      })
    })
    
    const dailyTrends = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Get recent transactions with specific dates
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(t => ({
        date: new Date(t.createdAt).toLocaleDateString('id-ID'),
        time: new Date(t.createdAt).toLocaleTimeString('id-ID'),
        transactionNo: t.transactionNo,
        customer: t.customer?.name || 'Walk-in Customer',
        store: t.store?.name || 'Default Store',
        revenue: t.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      }))
    
    // Calculate date range info
    const oldestTransaction = transactions.length > 0 ? 
      new Date(Math.min(...transactions.map(t => new Date(t.createdAt).getTime()))) : null
    const newestTransaction = transactions.length > 0 ? 
      new Date(Math.max(...transactions.map(t => new Date(t.createdAt).getTime()))) : null
    
    return {
      summary: {
        totalTransactions,
        totalRevenue,
        totalItems,
        totalCustomers,
        membershipRate: 0,
        averageOrderValue,
        todayRevenue,
        todayTransactions: todayTransactions.length,
        topProducts,
        storePerformance,
        paymentMethods: [],
        dailyTrends,
        recentTransactions,
        dateRange: {
          startDate: startDate.toLocaleDateString('id-ID'),
          endDate: endDate.toLocaleDateString('id-ID'),
          oldestTransaction: oldestTransaction?.toLocaleDateString('id-ID') || null,
          newestTransaction: newestTransaction?.toLocaleDateString('id-ID') || null
        }
      }
    }
  } catch (error) {
    console.error('Error fetching analytics data for AI:', error)
    return null
  }
}

// Helper function to fetch basic transaction stats for AI
async function fetchTransactionStats(companyId: string) {
  try {
    // Get basic transaction statistics
    const totalTransactions = await prisma.transaction.count({
      where: { companyId }
    })

    // Get ALL transactions for accurate total revenue calculation
    const allTransactions = await prisma.transaction.findMany({
      where: { companyId },
      include: {
        items: { select: { totalPrice: true } }
      }
    })

    // Calculate total revenue from ALL transaction items (consistent with Data All analytics)
    const totalRevenue = allTransactions.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + Number(item.totalPrice), 0)
    }, 0)

    // Get recent transactions for other analysis
    const recentTransactions = await prisma.transaction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      totalTransactions,
      totalRevenue,
      averageOrderValue,
      recentCount: recentTransactions.length
    }
  } catch (error) {
    console.error('Error fetching transaction stats for AI:', error)
    return {
      totalTransactions: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      recentCount: 0
    }
  }
}

// POST - Send message and get AI response
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      )
    }

    const adminId = session.user.id
    const adminName = session.user.name || 'Admin'
    const adminRole = session.user.role
    const companyId = session.user.companyId || 'default'
    
    // Get company subscription tier first
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionTier: true, name: true }
    })
    const subscriptionTier = company?.subscriptionTier || 'FREE'

    // Check AI quota limits based on subscription tier
    const canMakeRequest = await AiQuotaManager.canMakeRequest(companyId, subscriptionTier)
    if (!canMakeRequest) {
      const quotaStatus = await AiQuotaManager.getQuotaStatus(companyId, subscriptionTier)
      return NextResponse.json(
        {
          message: 'Quota AI chat Anda telah habis',
          quotaExceeded: true,
          quotaStatus,
          resetDate: AiQuotaManager.formatResetDate(quotaStatus.resetDate)
        },
        { status: 429 }
      )
    }

    // Get or create chat session with Prisma (company isolated)
    const currentSessionId = sessionId || generateSessionId(adminId)
    const chatSession = await getChatSession(currentSessionId, adminId, adminName, adminRole, companyId)
    
    // Add user message to session with weekly tracking
    const userMessageResult = await processMessageWithWeeklyTracking(
      chatSession.sessionId, 
      message, 
      true, 
      companyId, 
      subscriptionTier, 
      0
    )
    
    if (!userMessageResult.allowed) {
      return NextResponse.json(
        {
          message: userMessageResult.error || 'Rate limit exceeded',
          usage: userMessageResult.weeklyStats
        },
        { status: 429 }
      )
    }
    
    // Get optimized chat history for AI context
    const chatHistoryForAI = await getChatHistoryForAI(chatSession.sessionId, 10)

    // Generate AI response based on admin role and context
    const startTime = Date.now()
    let aiResponse: string
    
    try {
      aiResponse = await generateAIResponse(message, adminRole, adminName, chatHistoryForAI, companyId, adminId)
    } catch (error: any) {
      console.error('AI generation failed:', error.message)
      
      // Return appropriate error response based on error type
      if (error.message === 'AI_QUOTA_EXCEEDED') {
        return NextResponse.json({
          error: 'AI_QUOTA_EXCEEDED',
          message: 'Quota AI telah habis. Silakan tunggu reset atau upgrade paket Anda.',
          resetTime: '2025-11-27T00:00:00.000Z'
        }, { status: 429 })
      }
      
      if (error.message === 'AI_SERVICE_ERROR') {
        return NextResponse.json({
          error: 'AI_SERVICE_ERROR',
          message: 'Layanan AI sedang bermasalah. Silakan coba lagi nanti.'
        }, { status: 503 })
      }
      
      // Generic AI error
      return NextResponse.json({
        error: 'AI_UNAVAILABLE',
        message: 'AI Assistant sedang tidak tersedia. Silakan coba lagi dalam beberapa saat.'
      }, { status: 503 })
    }
    
    const responseTime = Date.now() - startTime
    
    // Learn from this interaction (AI Learning System)
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
      })
      
      // const businessContext = null // Legacy context no longer needed

      // Also learn with AI Business Intelligence
      await AIBusinessIntelligence.learnFromInteraction(
        companyId,
        message,
        aiResponse
      )
      
      console.log(`🧠 AI Learning completed for ${company?.name} (${responseTime}ms)`)
    } catch (learningError) {
      console.error('AI Learning error:', learningError)
    }
    
    // Add AI response to session
    await addMessageToSession(chatSession.sessionId, aiResponse, false)
    
    // Consume quota after successful AI response
    const estimatedTokens = Math.ceil(aiResponse.length / 4) // Rough estimate: 4 chars per token
    await AiQuotaManager.consumeQuota(companyId, estimatedTokens, subscriptionTier)
    
    // Process AI response for weekly tracking
    const aiMessageResult = await processMessageWithWeeklyTracking(
      chatSession.sessionId,
      aiResponse,
      false,
      companyId,
      subscriptionTier,
      aiResponse.length
    )

    // Get updated quota status to send to frontend
    const quotaStatus = await AiQuotaManager.getQuotaStatus(companyId, subscriptionTier)

    console.log(`📤 Sending response to frontend: ${aiResponse.substring(0, 100)}...`)
    
    return NextResponse.json({
      message: aiResponse,
      sessionId: chatSession.sessionId,
      usage: aiMessageResult.weeklyStats,
      quotaStatus,
      responseTime
    })

  } catch (error) {
    console.error('Error processing chat message:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIResponse(message: string, adminRole: string, adminName: string, chatHistory: any[], companyId: string, adminId: string): Promise<string> {
  try {
    // SuperAdmin gets special Vendra business AI
    if (adminRole === 'SUPERADMIN') {
      console.log(`🏢 Generating Vendra Business AI response for SuperAdmin: ${adminName}`)
      return await generateSuperAdminAIResponse(message, adminName, chatHistory, companyId)
    }
    // For regular admins, use AI with comprehensive business context - "MAKANAN AI"
    console.log(`🤖 Generating AI response for ${adminRole}: ${adminName}`)
    
    // Get comprehensive business context - "MAKANAN AI" + Analytics Data
    console.log(`🍽️ Loading comprehensive business context for AI`)
    const businessContext = await AIBusinessContextProvider.getComprehensiveContext(adminId)
    
    // Get analytics data for enhanced AI responses
    const analyticsData = await fetchAnalyticsData(companyId, adminRole)
    
    // Get basic transaction stats for AI
    const transactionStats = await fetchTransactionStats(companyId)
    
    console.log('🧠 AI Context loaded:', {
      hasBusinessContext: !!businessContext,
      hasAnalyticsData: !!analyticsData,
      hasTransactionStats: !!transactionStats,
      userRole: adminRole,
      companyId: companyId
    })
    
    // Try Gemini first, fallback to AI simulator if quota exceeded or error
    try {
      // Get company name for personalization
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
      })
      const companyName = company?.name || 'Company'
      
      // Use Gemini AI with comprehensive business context - "MAKANAN AI" + Real-time Analytics
      const analyticsContext = analyticsData ? `
📊 REAL-TIME ANALYTICS DATA (Last 30 Days):
- Total Transactions: ${analyticsData.summary.totalTransactions}
- Total Revenue: Rp ${analyticsData.summary.totalRevenue.toLocaleString('id-ID')}
- Total Items Sold: ${analyticsData.summary.totalItems}
- Total Customers: ${analyticsData.summary.totalCustomers}
- Member Rate: ${analyticsData.summary.membershipRate}%
- Average Order Value: Rp ${Math.round(analyticsData.summary.averageOrderValue).toLocaleString('id-ID')}

🏆 TOP PERFORMING PRODUCTS:
${analyticsData.summary.topProducts.map((p: any, i: number) => 
  `${i+1}. ${p.name} - Rp ${p.revenue.toLocaleString('id-ID')} (${p.quantity} items)`
).join('\n')}

🏪 STORE PERFORMANCE:
${analyticsData.summary.storePerformance.map((s: any) => 
  `- ${s.name}: Rp ${s.revenue.toLocaleString('id-ID')} (${s.transactions} transactions)`
).join('\n')}

💳 PAYMENT METHODS:
${analyticsData.summary.paymentMethods.map((p: any) => 
  `- ${p.method}: ${p.count} transactions, Rp ${p.revenue.toLocaleString('id-ID')}`
).join('\n')}

📈 DAILY TRENDS (Recent):
${analyticsData.summary.dailyTrends.slice(-7).map((d: any) => 
  `- ${d.date}: ${d.transactions} orders, Rp ${d.revenue.toLocaleString('id-ID')}`
).join('\n')}` : 'Analytics data not available'

      const businessContextString = businessContext ? generateAIContextString(businessContext) : `Company: ${companyName}
         Revenue: Rp ${transactionStats.totalRevenue.toLocaleString('id-ID')}
         Transactions: ${transactionStats.totalTransactions}
         Average Order Value: Rp ${transactionStats.averageOrderValue.toLocaleString('id-ID')}`

      const enhancedSystemPrompt = `${getGeminiSystemPrompt(adminRole, companyName)}

🍽️ COMPREHENSIVE BUSINESS CONTEXT (MAKANAN AI):
${businessContextString}

${analyticsContext}

📊 TRANSACTION STATS:
- Total Transactions: ${transactionStats.totalTransactions}
- Total Revenue: Rp ${transactionStats.totalRevenue.toLocaleString('id-ID')}
- Average Order Value: Rp ${transactionStats.averageOrderValue.toLocaleString('id-ID')}

🎯 INSTRUCTIONS FOR AI:
- You have COMPLETE access to this user's business data AND real-time analytics
- Reference SPECIFIC numbers, products, customers, and metrics from BOTH sources
- Provide ACTIONABLE insights based on real transaction data
- Be PERSONAL and relevant to their actual business situation
- Use the analytics data to give strategic recommendations
- Mention specific products, revenue figures, customer counts, trends when relevant
- Help them understand their business performance with real numbers
- Compare current performance with historical data when possible

Example responses with REAL DATA:
- "Based on your recent ${analyticsData?.summary.totalTransactions || 0} transactions generating Rp ${analyticsData?.summary.totalRevenue.toLocaleString('id-ID') || '0'}..."
- "Your top product ${analyticsData?.summary.topProducts[0]?.name || 'Unknown'} is performing excellently with Rp ${analyticsData?.summary.topProducts[0]?.revenue.toLocaleString('id-ID') || '0'} revenue..."
- "I notice your average order value is Rp ${Math.round(analyticsData?.summary.averageOrderValue || 0).toLocaleString('id-ID')}, which suggests..."

Always use REAL DATA from both the business context AND analytics data above!`

      // Generate AI response with enhanced context using OpenAI
      const aiProvider = process.env.VENDRA_AI_PROVIDER || 'gemini'
      
      if (aiProvider === 'openai') {
        console.log(`🤖 Using OpenAI for admin chatbot`)
        const response = await generateOpenAIResponse(
          `${enhancedSystemPrompt}\n\nUser Message: ${message}`,
          'ADMIN'
        )
        console.log(`✅ OpenAI response generated successfully with comprehensive context`)
        console.log(`🔍 Response preview: ${response.substring(0, 100)}...`)
        return response
      } else {
        // Use Gemini with new key
        const apiKey = process.env.VENDRA_GEMINI_API_KEY_1 || process.env.VENDRA_GEMINI_API_KEY || ''
        
        if (!apiKey || apiKey === 'your-gemini-api-key-here') {
          console.log(`⚠️ No valid Gemini API key found, using AI simulator`)
          throw new Error('No valid Gemini API key')
        }
        
        const response = await generateGeminiResponse(
          apiKey,
          message,
          enhancedSystemPrompt,
          GEMINI_CONFIG.maxTokens,
          GEMINI_CONFIG.temperature,
          GEMINI_CONFIG.model
        )

        console.log(`✅ Gemini AI response generated successfully with comprehensive context`)
        console.log(`🔍 Response preview: ${response.substring(0, 100)}...`)
        return response
      }
      
    } catch (error: any) {
      console.error('Error generating AI response:', error)
      
      // Check if it's a quota/limit error
      if (error.message?.includes('quota') || error.message?.includes('Too Many Requests') || error.status === 429) {
        throw new Error('AI_QUOTA_EXCEEDED')
      }
      
      // Check if it's an API key error
      if (error.message?.includes('API key') || error.message?.includes('invalid') || error.status === 400) {
        throw new Error('AI_SERVICE_ERROR')
      }
      
      // Generic AI error
      throw new Error('AI_UNAVAILABLE')
    }
  } catch (error: any) {
    console.error('Error in generateAIResponse:', error)
    
    // Re-throw specific AI errors
    if (error.message === 'AI_QUOTA_EXCEEDED' || error.message === 'AI_SERVICE_ERROR' || error.message === 'AI_UNAVAILABLE') {
      throw error
    }
    
    // Generic error
    throw new Error('AI_UNAVAILABLE')
  }
}
