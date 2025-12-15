// Advanced AI Business Intelligence System
// AI learns about user's business and becomes smarter over time

import { prisma } from './prisma'
import fs from 'fs/promises'
import path from 'path'

interface BusinessProfile {
  companyId: string
  companyName: string
  industry: string
  businessType: string
  
  // Business Knowledge
  products: {
    categories: string[]
    topSellers: Array<{name: string, sales: number}>
    seasonalTrends: string[]
  }
  
  customers: {
    segments: string[]
    behaviors: string[]
    preferences: string[]
  }
  
  operations: {
    peakHours: string[]
    busyDays: string[]
    challenges: string[]
    goals: string[]
  }
  
  // AI Learning Data
  conversationPatterns: {
    commonQuestions: Array<{question: string, frequency: number}>
    userStyle: 'formal' | 'casual' | 'technical'
    preferredResponseLength: 'short' | 'medium' | 'detailed'
    topics: string[]
  }
  
  // Business Intelligence
  insights: {
    strengths: string[]
    opportunities: string[]
    recommendations: string[]
    predictions: string[]
  }
  
  lastUpdated: string
  learningScore: number // 0-100, how well AI knows this business
}

export class AIBusinessIntelligence {
  private static profilesDir = path.join(process.cwd(), 'data', 'business-profiles')

  // Initialize profiles directory
  static async initialize() {
    try {
      await fs.mkdir(this.profilesDir, { recursive: true })
      console.log('🧠 AI Business Intelligence initialized')
    } catch (error) {
      console.error('Error initializing AI Business Intelligence:', error)
    }
  }

  // Get business profile file path
  private static getProfilePath(companyId: string): string {
    return path.join(this.profilesDir, `${companyId}-profile.json`)
  }

  // Load business profile
  static async loadBusinessProfile(companyId: string): Promise<BusinessProfile | null> {
    try {
      const profilePath = this.getProfilePath(companyId)
      const data = await fs.readFile(profilePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      return null // Profile doesn't exist yet
    }
  }

  // Save business profile
  static async saveBusinessProfile(profile: BusinessProfile): Promise<void> {
    try {
      const profilePath = this.getProfilePath(profile.companyId)
      await fs.writeFile(profilePath, JSON.stringify(profile, null, 2))
    } catch (error) {
      console.error('Error saving business profile:', error)
    }
  }

  // Analyze business data and create/update profile
  static async analyzeAndLearnBusiness(companyId: string): Promise<BusinessProfile> {
    console.log(`🔍 Analyzing business data for company: ${companyId}`)
    
    try {
      // Get company info
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, subscriptionTier: true, isActive: true }
      })

      if (!company) {
        throw new Error('Company not found')
      }

      // Analyze products
      const products = await prisma.product.findMany({
        where: { companyId },
        select: { 
          name: true, 
          category: true, 
          price: true, 
          stock: true,
          createdAt: true 
        }
      })

      // Analyze transactions
      const transactions = await prisma.transaction.findMany({
        where: { companyId },
        include: {
          items: {
            include: {
              product: { select: { name: true, category: true } }
            }
          },
          customer: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Last 100 transactions
      })

      // Analyze customers
      const customers = await prisma.customer.findMany({
        where: { companyId },
        select: { 
          name: true, 
          email: true, 
          phone: true,
          createdAt: true 
        }
      })

      // Analyze employees
      const employees = await prisma.employee.findMany({
        where: { companyId },
        select: { name: true, role: true, createdAt: true }
      })

      // Create business intelligence
      const profile: BusinessProfile = {
        companyId,
        companyName: company.name,
        industry: this.detectIndustry(products),
        businessType: this.detectBusinessType(products, transactions),
        
        products: {
          categories: this.extractCategories(products),
          topSellers: this.analyzeTopSellers(transactions),
          seasonalTrends: this.analyzeSeasonalTrends(transactions)
        },
        
        customers: {
          segments: this.analyzeCustomerSegments(customers, transactions),
          behaviors: this.analyzeCustomerBehaviors(transactions),
          preferences: this.analyzeCustomerPreferences(transactions)
        },
        
        operations: {
          peakHours: this.analyzePeakHours(transactions),
          busyDays: this.analyzeBusyDays(transactions),
          challenges: this.identifyChallenges(products, transactions),
          goals: this.suggestGoals(company, products, transactions)
        },
        
        conversationPatterns: {
          commonQuestions: [],
          userStyle: 'casual',
          preferredResponseLength: 'medium',
          topics: []
        },
        
        insights: {
          strengths: this.identifyStrengths(products, transactions, customers),
          opportunities: this.identifyOpportunities(products, transactions),
          recommendations: this.generateRecommendations(products, transactions, customers),
          predictions: this.generatePredictions(transactions)
        },
        
        lastUpdated: new Date().toISOString(),
        learningScore: this.calculateLearningScore(products, transactions, customers)
      }

      // Save profile
      await this.saveBusinessProfile(profile)
      
      console.log(`✅ Business profile created for ${company.name} (Learning Score: ${profile.learningScore}/100)`)
      return profile

    } catch (error) {
      console.error('Error analyzing business:', error)
      throw error
    }
  }

  // Learn from user interaction
  static async learnFromInteraction(
    companyId: string, 
    question: string, 
    response: string,
    userFeedback?: 'good' | 'bad'
  ): Promise<void> {
    try {
      let profile = await this.loadBusinessProfile(companyId)
      
      if (!profile) {
        // Create new profile if doesn't exist
        profile = await this.analyzeAndLearnBusiness(companyId)
      }

      // Update conversation patterns
      const existingQuestion = profile.conversationPatterns.commonQuestions.find(
        q => q.question.toLowerCase().includes(question.toLowerCase().substring(0, 20))
      )

      if (existingQuestion) {
        existingQuestion.frequency++
      } else {
        profile.conversationPatterns.commonQuestions.push({
          question: question.substring(0, 100), // Limit length
          frequency: 1
        })
      }

      // Sort by frequency
      profile.conversationPatterns.commonQuestions.sort((a, b) => b.frequency - a.frequency)
      
      // Keep only top 50 questions
      profile.conversationPatterns.commonQuestions = profile.conversationPatterns.commonQuestions.slice(0, 50)

      // Extract topics from question
      const topics = this.extractTopics(question)
      topics.forEach(topic => {
        if (!profile.conversationPatterns.topics.includes(topic)) {
          profile.conversationPatterns.topics.push(topic)
        }
      })

      // Update learning score
      profile.learningScore = Math.min(100, profile.learningScore + 0.1)
      profile.lastUpdated = new Date().toISOString()

      await this.saveBusinessProfile(profile)

    } catch (error) {
      console.error('Error learning from interaction:', error)
    }
  }

  // Get AI context for better responses
  static async getAIContext(companyId: string): Promise<string> {
    const profile = await this.loadBusinessProfile(companyId)
    
    if (!profile) {
      return "Saya masih belajar tentang bisnis Anda. Berikan lebih banyak informasi agar saya bisa membantu lebih baik."
    }

    return `
BUSINESS INTELLIGENCE CONTEXT:
Company: ${profile.companyName}
Industry: ${profile.industry}
Business Type: ${profile.businessType}
Learning Score: ${profile.learningScore}/100

PRODUCTS & SERVICES:
- Categories: ${profile.products.categories.join(', ')}
- Top Sellers: ${profile.products.topSellers.map(p => p.name).join(', ')}

CUSTOMER INSIGHTS:
- Segments: ${profile.customers.segments.join(', ')}
- Behaviors: ${profile.customers.behaviors.join(', ')}

OPERATIONS:
- Peak Hours: ${profile.operations.peakHours.join(', ')}
- Challenges: ${profile.operations.challenges.join(', ')}
- Goals: ${profile.operations.goals.join(', ')}

BUSINESS STRENGTHS:
${profile.insights.strengths.join('\n')}

RECOMMENDATIONS:
${profile.insights.recommendations.join('\n')}

COMMON QUESTIONS:
${profile.conversationPatterns.commonQuestions.slice(0, 5).map(q => `- ${q.question} (asked ${q.frequency} times)`).join('\n')}
    `.trim()
  }

  // Helper methods for analysis
  private static detectIndustry(products: any[]): string {
    const categories = products.map(p => p.category?.toLowerCase() || '').filter(Boolean)
    
    if (categories.some(c => c.includes('food') || c.includes('makanan') || c.includes('minuman'))) {
      return 'Food & Beverage'
    }
    if (categories.some(c => c.includes('fashion') || c.includes('clothing') || c.includes('pakaian'))) {
      return 'Fashion & Retail'
    }
    if (categories.some(c => c.includes('electronic') || c.includes('gadget') || c.includes('teknologi'))) {
      return 'Technology & Electronics'
    }
    if (categories.some(c => c.includes('health') || c.includes('beauty') || c.includes('kesehatan'))) {
      return 'Health & Beauty'
    }
    
    return 'General Retail'
  }

  private static detectBusinessType(products: any[], transactions: any[]): string {
    const productCount = products.length
    const transactionCount = transactions.length
    
    if (productCount > 100 && transactionCount > 50) {
      return 'Large Retail Store'
    } else if (productCount > 50) {
      return 'Medium Retail Store'
    } else if (productCount > 10) {
      return 'Small Retail Store'
    } else {
      return 'Startup/New Business'
    }
  }

  private static extractCategories(products: any[]): string[] {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    return categories.slice(0, 10) // Top 10 categories
  }

  private static analyzeTopSellers(transactions: any[]): Array<{name: string, sales: number}> {
    const productSales: {[key: string]: number} = {}
    
    transactions.forEach(t => {
      t.items?.forEach((item: any) => {
        const productName = item.product?.name
        if (productName) {
          productSales[productName] = (productSales[productName] || 0) + item.quantity
        }
      })
    })
    
    return Object.entries(productSales)
      .map(([name, sales]) => ({name, sales}))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
  }

  private static analyzeSeasonalTrends(transactions: any[]): string[] {
    // Simple seasonal analysis
    const months = transactions.map(t => new Date(t.createdAt).getMonth())
    const monthCounts = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as {[key: number]: number})
    
    const trends = []
    if (monthCounts[11] > (monthCounts[10] || 0)) trends.push('December sales spike')
    if (monthCounts[6] > (monthCounts[5] || 0)) trends.push('July summer boost')
    
    return trends
  }

  private static analyzeCustomerSegments(customers: any[], transactions: any[]): string[] {
    const segments = []
    
    if (customers.length > 100) segments.push('Large Customer Base')
    if (customers.length < 20) segments.push('Niche Market')
    
    const repeatCustomers = transactions.filter(t => t.customer).length
    if (repeatCustomers > transactions.length * 0.6) {
      segments.push('High Customer Loyalty')
    }
    
    return segments
  }

  private static analyzeCustomerBehaviors(transactions: any[]): string[] {
    const behaviors = []
    
    const avgOrderValue = transactions.reduce((sum, t) => sum + Number(t.total), 0) / transactions.length
    if (avgOrderValue > 100000) behaviors.push('High-value purchases')
    if (avgOrderValue < 50000) behaviors.push('Budget-conscious buyers')
    
    return behaviors
  }

  private static analyzeCustomerPreferences(transactions: any[]): string[] {
    const preferences = []
    
    const paymentMethods = transactions.map(t => t.paymentMethod)
    const cashCount = paymentMethods.filter(p => p === 'CASH').length
    if (cashCount > transactions.length * 0.7) {
      preferences.push('Prefers cash payments')
    }
    
    return preferences
  }

  private static analyzePeakHours(transactions: any[]): string[] {
    const hours = transactions.map(t => new Date(t.createdAt).getHours())
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as {[key: number]: number})
    
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)
    
    return peakHours
  }

  private static analyzeBusyDays(transactions: any[]): string[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = transactions.map(t => new Date(t.createdAt).getDay())
    const dayCounts = dayOfWeek.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as {[key: number]: number})
    
    const busyDays = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => days[parseInt(day)])
    
    return busyDays
  }

  private static identifyChallenges(products: any[], transactions: any[]): string[] {
    const challenges = []
    
    const lowStockProducts = products.filter(p => p.stock < 10).length
    if (lowStockProducts > products.length * 0.2) {
      challenges.push('Inventory management - many low stock items')
    }
    
    if (transactions.length < 10) {
      challenges.push('Low sales volume - need marketing boost')
    }
    
    return challenges
  }

  private static suggestGoals(company: any, products: any[], transactions: any[]): string[] {
    const goals = []
    
    if (products.length < 50) {
      goals.push('Expand product catalog to 50+ items')
    }
    
    if (transactions.length < 100) {
      goals.push('Increase monthly transactions to 100+')
    }
    
    if (company.subscriptionTier === 'FREE') {
      goals.push('Upgrade to BASIC plan for more features')
    }
    
    return goals
  }

  private static identifyStrengths(products: any[], transactions: any[], customers: any[]): string[] {
    const strengths = []
    
    if (products.length > 50) {
      strengths.push('Diverse product portfolio')
    }
    
    if (transactions.length > 100) {
      strengths.push('Strong sales activity')
    }
    
    if (customers.length > 50) {
      strengths.push('Good customer base')
    }
    
    return strengths
  }

  private static identifyOpportunities(products: any[], transactions: any[]): string[] {
    const opportunities = []
    
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    if (categories.length < 5) {
      opportunities.push('Expand into new product categories')
    }
    
    const avgOrderValue = transactions.reduce((sum, t) => sum + Number(t.total), 0) / transactions.length
    if (avgOrderValue < 100000) {
      opportunities.push('Increase average order value through upselling')
    }
    
    return opportunities
  }

  private static generateRecommendations(products: any[], transactions: any[], customers: any[]): string[] {
    const recommendations = []
    
    if (products.filter(p => p.stock < 5).length > 0) {
      recommendations.push('Restock low inventory items to avoid stockouts')
    }
    
    if (transactions.length > 0) {
      const topSellingCategory = this.extractCategories(products)[0]
      if (topSellingCategory) {
        recommendations.push(`Focus marketing on ${topSellingCategory} - your best performing category`)
      }
    }
    
    if (customers.length > 20) {
      recommendations.push('Implement customer loyalty program to increase retention')
    }
    
    return recommendations
  }

  private static generatePredictions(transactions: any[]): string[] {
    const predictions = []
    
    if (transactions.length > 10) {
      const recentTransactions = transactions.slice(0, 10)
      const olderTransactions = transactions.slice(10, 20)
      
      const recentTotal = recentTransactions.reduce((sum, t) => sum + Number(t.total), 0)
      const olderTotal = olderTransactions.reduce((sum, t) => sum + Number(t.total), 0)
      
      if (recentTotal > olderTotal) {
        predictions.push('Sales trend is positive - expect continued growth')
      } else {
        predictions.push('Sales trend needs attention - consider promotional activities')
      }
    }
    
    return predictions
  }

  private static calculateLearningScore(products: any[], transactions: any[], customers: any[]): number {
    let score = 0
    
    // Base score from data availability
    if (products.length > 0) score += 20
    if (transactions.length > 0) score += 30
    if (customers.length > 0) score += 20
    
    // Bonus for data richness
    if (products.length > 10) score += 10
    if (transactions.length > 50) score += 10
    if (customers.length > 20) score += 10
    
    return Math.min(100, score)
  }

  private static extractTopics(question: string): string[] {
    const topics = []
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('penjualan') || lowerQuestion.includes('sales')) topics.push('sales')
    if (lowerQuestion.includes('produk') || lowerQuestion.includes('product')) topics.push('products')
    if (lowerQuestion.includes('customer') || lowerQuestion.includes('pelanggan')) topics.push('customers')
    if (lowerQuestion.includes('stok') || lowerQuestion.includes('inventory')) topics.push('inventory')
    if (lowerQuestion.includes('karyawan') || lowerQuestion.includes('employee')) topics.push('employees')
    if (lowerQuestion.includes('laporan') || lowerQuestion.includes('report')) topics.push('reports')
    
    return topics
  }
}
