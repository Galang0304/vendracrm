import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RFMCustomer {
  customerId: string
  customerName: string
  customerEmail: string
  recency: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rfmSegment: string
  rfmScore: number
  label: string
  lastPurchaseDate: Date
  totalRevenue: number
  averageOrderValue: number
}

interface RFMAnalysisResult {
  customers: RFMCustomer[]
  segments: {
    [key: string]: {
      count: number
      percentage: number
      totalRevenue: number
      averageRecency: number
      averageFrequency: number
      averageMonetary: number
    }
  }
  summary: {
    totalCustomers: number
    totalRevenue: number
    averageRecency: number
    averageFrequency: number
    averageMonetary: number
    analysisDate: Date
  }
  topProducts: {
    [segment: string]: Array<{
      productName: string
      quantity: number
      revenue: number
      percentage: number
    }>
  }
}

// RFM Scoring Functions
function calculateRScore(recency: number, quantiles: any): number {
  if (recency <= quantiles.recency[0.25]) return 4
  if (recency <= quantiles.recency[0.50]) return 3
  if (recency <= quantiles.recency[0.75]) return 2
  return 1
}

function calculateFMScore(value: number, quantiles: any, type: 'frequency' | 'monetary'): number {
  if (value <= quantiles[type][0.25]) return 1
  if (value <= quantiles[type][0.50]) return 2
  if (value <= quantiles[type][0.75]) return 3
  return 4
}

// RFM Labeling Function
function getRFMLabel(rScore: number, fScore: number, mScore: number, segment: string): string {
  // Best Customers - High value, frequent, recent
  if (segment === '444') return 'Pelanggan Terbaik'
  
  // Lost Cheap Customers - Low value, infrequent, not recent
  if (segment === '111') return 'Pelanggan Hilang Murah'
  
  // Champions - Recent, frequent, high spend
  if (rScore >= 4 && fScore >= 4) return 'Juara'
  
  // Loyal Customers - High frequency
  if (fScore === 4) return 'Pelanggan Setia'
  
  // Big Spenders - High monetary
  if (mScore === 4) return 'Pembeli Besar'
  
  // At Risk - Low recency but good frequency/monetary
  if (rScore === 1 && (fScore >= 3 || mScore >= 3)) return 'Berisiko Hilang'
  
  // Lost Customers - Very low recency
  if (rScore === 1) return 'Pelanggan Hilang'
  
  // Almost Lost - Low recency
  if (rScore === 2) return 'Hampir Hilang'
  
  // New Customers - Recent but low frequency/monetary
  if (rScore >= 3 && fScore <= 2 && mScore <= 2) return 'Pelanggan Baru'
  
  // Potential Loyalists - Recent and moderate frequency
  if (rScore >= 3 && fScore >= 2) return 'Calon Setia'
  
  return 'Lainnya'
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 RFM Analysis API called')
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authorized:', session.user.email, session.user.role)

    const { searchParams } = new URL(request.url)
    const companyId = session.user.role === 'SUPERADMIN' 
      ? searchParams.get('companyId') || session.user.companyId
      : session.user.companyId
    const storeId = searchParams.get('storeId')

    if (!companyId) {
      console.log('❌ Company ID missing')
      return NextResponse.json(
        { message: 'Company ID is required' },
        { status: 400 }
      )
    }

    console.log('📊 Processing RFM for company:', companyId, 'store:', storeId || 'all')

    // Set analysis date (current date)
    const analysisDate = new Date()
    
    // Build transaction query with optional store filter
    const transactionWhere: any = {
      companyId: companyId,
      date: {
        lte: analysisDate
      }
    }

    // Add store filter if specified
    if (storeId && storeId !== 'all') {
      transactionWhere.storeId = storeId
    }

    // Get all transactions with customer data
    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
        store: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    if (transactions.length === 0) {
      return NextResponse.json({
        customers: [],
        segments: {},
        summary: {
          totalCustomers: 0,
          totalRevenue: 0,
          averageRecency: 0,
          averageFrequency: 0,
          averageMonetary: 0,
          analysisDate
        },
        topProducts: {}
      })
    }

    // Calculate RFM metrics for each customer
    const customerMetrics = new Map<string, {
      customerId: string
      customerName: string
      customerEmail: string
      lastPurchaseDate: Date
      frequency: number
      monetary: number
      transactions: any[]
    }>()

    // Process transactions to calculate metrics
    transactions.forEach(transaction => {
      const customerId = transaction.customerId
      const customerName = transaction.customer.name
      const customerEmail = transaction.customer.email
      const transactionDate = new Date(transaction.date)
      // Calculate transaction total from items (consistent with Data All)
      const transactionTotal = transaction.items.reduce((sum: number, item: any) => {
        return sum + Number(item.totalPrice || 0)
      }, 0)

      if (!customerMetrics.has(customerId)) {
        customerMetrics.set(customerId, {
          customerId,
          customerName: customerName || 'Unknown Customer',
          customerEmail: customerEmail || 'no-email@example.com',
          lastPurchaseDate: transactionDate,
          frequency: 0,
          monetary: 0,
          transactions: []
        })
      }

      const customer = customerMetrics.get(customerId)!
      
      // Update last purchase date (most recent)
      if (transactionDate > customer.lastPurchaseDate) {
        customer.lastPurchaseDate = transactionDate
      }
      
      // Increment frequency
      customer.frequency += 1
      
      // Add to monetary value
      customer.monetary += transactionTotal
      
      // Store transaction for product analysis
      customer.transactions.push(transaction)
    })

    // Calculate recency and prepare RFM data
    const rfmData: Array<{
      customerId: string
      customerName: string
      customerEmail: string
      recency: number
      frequency: number
      monetary: number
      lastPurchaseDate: Date
      transactions: any[]
    }> = []

    customerMetrics.forEach(customer => {
      const recency = Math.floor((analysisDate.getTime() - customer.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      
      rfmData.push({
        customerId: customer.customerId,
        customerName: customer.customerName || 'Unknown Customer',
        customerEmail: customer.customerEmail || 'no-email@example.com',
        recency,
        frequency: customer.frequency,
        monetary: customer.monetary,
        lastPurchaseDate: customer.lastPurchaseDate,
        transactions: customer.transactions
      })
    })

    // Calculate quantiles for scoring
    const recencyValues = rfmData.map(c => c.recency).sort((a, b) => a - b)
    const frequencyValues = rfmData.map(c => c.frequency).sort((a, b) => a - b)
    const monetaryValues = rfmData.map(c => c.monetary).sort((a, b) => a - b)

    const quantiles = {
      recency: {
        0.25: recencyValues[Math.floor(recencyValues.length * 0.25)],
        0.50: recencyValues[Math.floor(recencyValues.length * 0.50)],
        0.75: recencyValues[Math.floor(recencyValues.length * 0.75)]
      },
      frequency: {
        0.25: frequencyValues[Math.floor(frequencyValues.length * 0.25)],
        0.50: frequencyValues[Math.floor(frequencyValues.length * 0.50)],
        0.75: frequencyValues[Math.floor(frequencyValues.length * 0.75)]
      },
      monetary: {
        0.25: monetaryValues[Math.floor(monetaryValues.length * 0.25)],
        0.50: monetaryValues[Math.floor(monetaryValues.length * 0.50)],
        0.75: monetaryValues[Math.floor(monetaryValues.length * 0.75)]
      }
    }

    // Calculate RFM scores and segments
    const rfmCustomers: RFMCustomer[] = rfmData.map(customer => {
      const rScore = calculateRScore(customer.recency, quantiles)
      const fScore = calculateFMScore(customer.frequency, quantiles, 'frequency')
      const mScore = calculateFMScore(customer.monetary, quantiles, 'monetary')
      
      const rfmSegment = `${rScore}${fScore}${mScore}`
      const rfmScore = rScore + fScore + mScore
      const label = getRFMLabel(rScore, fScore, mScore, rfmSegment)
      
      return {
        customerId: customer.customerId,
        customerName: customer.customerName || 'Unknown Customer',
        customerEmail: customer.customerEmail || 'no-email@example.com',
        recency: customer.recency,
        frequency: customer.frequency,
        monetary: customer.monetary,
        rScore,
        fScore,
        mScore,
        rfmSegment,
        rfmScore,
        label,
        lastPurchaseDate: customer.lastPurchaseDate,
        totalRevenue: customer.monetary,
        averageOrderValue: customer.monetary / customer.frequency
      }
    })

    // Calculate segment statistics
    const segments: { [key: string]: any } = {}
    const segmentCounts: { [key: string]: number } = {}
    
    rfmCustomers.forEach(customer => {
      const label = customer.label
      
      if (!segments[label]) {
        segments[label] = {
          count: 0,
          percentage: 0,
          totalRevenue: 0,
          averageRecency: 0,
          averageFrequency: 0,
          averageMonetary: 0,
          customers: []
        }
      }
      
      segments[label].count += 1
      segments[label].totalRevenue += customer.monetary
      segments[label].averageRecency += customer.recency
      segments[label].averageFrequency += customer.frequency
      segments[label].averageMonetary += customer.monetary
      segments[label].customers.push(customer)
    })

    // Calculate averages and percentages
    Object.keys(segments).forEach(label => {
      const segment = segments[label]
      segment.percentage = (segment.count / rfmCustomers.length) * 100
      segment.averageRecency = segment.averageRecency / segment.count
      segment.averageFrequency = segment.averageFrequency / segment.count
      segment.averageMonetary = segment.averageMonetary / segment.count
      delete segment.customers // Remove detailed customer data from segment summary
    })

    // Calculate top products by segment
    const topProducts: { [segment: string]: Array<any> } = {}
    
    Object.keys(segments).forEach(segmentLabel => {
      const segmentCustomers = rfmCustomers.filter(c => c.label === segmentLabel)
      const productStats = new Map<string, { quantity: number, revenue: number, name: string }>()
      
      segmentCustomers.forEach(customer => {
        const customerData = rfmData.find(c => c.customerId === customer.customerId)
        if (customerData && customerData.transactions) {
          customerData.transactions.forEach(transaction => {
            if (transaction.items && Array.isArray(transaction.items)) {
              transaction.items.forEach((item: any) => {
                if (item && item.productId) {
                  const productId = item.productId
                  const productName = item.product?.name || 'Unknown Product'
                  const quantity = Number(item.quantity) || 0
                  const revenue = Number(item.totalPrice) || 0
                  
                  if (!productStats.has(productId)) {
                    productStats.set(productId, { quantity: 0, revenue: 0, name: productName })
                  }
                  
                  const stats = productStats.get(productId)!
                  stats.quantity += quantity
                  stats.revenue += revenue
                }
              })
            }
          })
        }
      })
      
      // Convert to array and sort by quantity
      const productsArray = Array.from(productStats.entries()).map(([productId, stats]) => ({
        productName: stats.name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        percentage: 0 // Will calculate below
      })).sort((a, b) => b.quantity - a.quantity).slice(0, 5)
      
      // Calculate percentages
      const totalQuantity = productsArray.reduce((sum, p) => sum + p.quantity, 0)
      productsArray.forEach(product => {
        product.percentage = totalQuantity > 0 ? (product.quantity / totalQuantity) * 100 : 0
      })
      
      topProducts[segmentLabel] = productsArray
    })

    // Calculate summary statistics
    const totalRevenue = rfmCustomers.reduce((sum, c) => sum + c.monetary, 0)
    const averageRecency = rfmCustomers.reduce((sum, c) => sum + c.recency, 0) / rfmCustomers.length
    const averageFrequency = rfmCustomers.reduce((sum, c) => sum + c.frequency, 0) / rfmCustomers.length
    const averageMonetary = rfmCustomers.reduce((sum, c) => sum + c.monetary, 0) / rfmCustomers.length

    const result: RFMAnalysisResult = {
      customers: rfmCustomers,
      segments,
      summary: {
        totalCustomers: rfmCustomers.length,
        totalRevenue,
        averageRecency,
        averageFrequency,
        averageMonetary,
        analysisDate
      },
      topProducts
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Error in RFM analysis:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
