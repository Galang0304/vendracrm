import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getRFMLabel(r: number, f: number, m: number): string {
  // RFM scoring logic with Indonesian labels
  if (r >= 4 && f >= 4 && m >= 4) return 'Pelanggan Terbaik'
  if (r >= 4 && f >= 3 && m >= 3) return 'Juara'
  if (r >= 3 && f >= 4 && m >= 3) return 'Pelanggan Setia'
  if (r >= 3 && f >= 3 && m >= 4) return 'Pembeli Besar'
  if (r >= 4 && f >= 2 && m >= 2) return 'Calon Setia'
  if (r >= 4 && f >= 1 && m >= 1) return 'Pelanggan Baru'
  if (r >= 2 && f >= 3 && m >= 3) return 'Berisiko Hilang'
  if (r >= 2 && f >= 2 && m >= 2) return 'Hampir Hilang'
  if (r <= 2 && f >= 2 && m >= 3) return 'Pelanggan Hilang'
  if (r <= 2 && f <= 2 && m <= 2) return 'Pelanggan Hilang Murah'
  return 'Lainnya'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all transactions with customer and company data
    const transactions = await prisma.transaction.findMany({
      include: {
        customer: true,
        items: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (transactions.length === 0) {
      return NextResponse.json({
        customers: [],
        stats: {
          totalCustomers: 0,
          totalRevenue: 0,
          avgFrequency: 0,
          avgRecency: 0
        },
        segments: []
      })
    }

    // Calculate RFM metrics for each customer
    const customerMetrics = new Map()
    const today = new Date()

    transactions.forEach(transaction => {
      const customerId = transaction.customer?.id || 'walk-in'
      const customerName = transaction.customer?.name || 'Walk-in Customer'
      const customerEmail = transaction.customer?.email || 'walk-in@customer.com'
      const companyName = transaction.company?.name || 'Unknown Company'
      
      // Calculate transaction total from items
      const transactionTotal = transaction.items.reduce((sum: number, item: any) => {
        return sum + Number(item.totalPrice || 0)
      }, 0)

      if (!customerMetrics.has(customerId)) {
        customerMetrics.set(customerId, {
          id: customerId,
          name: customerName,
          email: customerEmail,
          companyName: companyName,
          transactions: [],
          totalSpent: 0,
          lastPurchase: transaction.createdAt
        })
      }

      const customer = customerMetrics.get(customerId)
      customer.transactions.push({
        date: transaction.createdAt,
        amount: transactionTotal
      })
      customer.totalSpent += transactionTotal
      
      // Update last purchase date
      if (transaction.createdAt > customer.lastPurchase) {
        customer.lastPurchase = transaction.createdAt
      }
    })

    // Calculate RFM scores
    const customers = Array.from(customerMetrics.values()).map(customer => {
      // Recency: days since last purchase
      const recency = Math.floor((today.getTime() - new Date(customer.lastPurchase).getTime()) / (1000 * 60 * 60 * 24))
      
      // Frequency: number of transactions
      const frequency = customer.transactions.length
      
      // Monetary: total amount spent
      const monetary = customer.totalSpent

      return {
        ...customer,
        recency,
        frequency,
        monetary,
        totalOrders: frequency
      }
    })

    // Calculate quartiles for RFM scoring
    const recencyValues = customers.map(c => c.recency).sort((a, b) => a - b)
    const frequencyValues = customers.map(c => c.frequency).sort((a, b) => b - a)
    const monetaryValues = customers.map(c => c.monetary).sort((a, b) => b - a)

    const getQuartile = (value: number, values: number[], reverse = false) => {
      const len = values.length
      const q1 = values[Math.floor(len * 0.25)]
      const q2 = values[Math.floor(len * 0.5)]
      const q3 = values[Math.floor(len * 0.75)]

      if (reverse) {
        if (value <= q1) return 4
        if (value <= q2) return 3
        if (value <= q3) return 2
        return 1
      } else {
        if (value >= q3) return 4
        if (value >= q2) return 3
        if (value >= q1) return 2
        return 1
      }
    }

    // Assign RFM scores and segments
    const rfmCustomers = customers.map(customer => {
      const rScore = getQuartile(customer.recency, recencyValues, true) // Lower recency is better
      const fScore = getQuartile(customer.frequency, frequencyValues)
      const mScore = getQuartile(customer.monetary, monetaryValues)
      
      const rfmScore = `${rScore}${fScore}${mScore}`
      const segment = getRFMLabel(rScore, fScore, mScore)

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        companyName: customer.companyName,
        segment,
        recency: customer.recency,
        frequency: customer.frequency,
        monetary: customer.monetary,
        rfmScore,
        lastPurchase: new Date(customer.lastPurchase).toLocaleDateString('id-ID'),
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent
      }
    })

    // Calculate statistics
    const stats = {
      totalCustomers: rfmCustomers.length,
      totalRevenue: rfmCustomers.reduce((sum, c) => sum + c.monetary, 0),
      avgFrequency: rfmCustomers.reduce((sum, c) => sum + c.frequency, 0) / rfmCustomers.length,
      avgRecency: rfmCustomers.reduce((sum, c) => sum + c.recency, 0) / rfmCustomers.length
    }

    // Calculate segment distribution
    const segmentCounts = new Map()
    rfmCustomers.forEach(customer => {
      const segment = customer.segment
      if (!segmentCounts.has(segment)) {
        segmentCounts.set(segment, {
          segment,
          count: 0,
          revenue: 0,
          totalRecency: 0,
          totalFrequency: 0
        })
      }
      
      const segmentData = segmentCounts.get(segment)
      segmentData.count++
      segmentData.revenue += customer.monetary
      segmentData.totalRecency += customer.recency
      segmentData.totalFrequency += customer.frequency
    })

    const segments = Array.from(segmentCounts.values()).map(segment => ({
      segment: segment.segment,
      count: segment.count,
      revenue: segment.revenue,
      avgRecency: segment.totalRecency / segment.count,
      avgFrequency: segment.totalFrequency / segment.count,
      percentage: (segment.count / rfmCustomers.length) * 100
    })).sort((a, b) => b.count - a.count)

    return NextResponse.json({
      customers: rfmCustomers,
      stats,
      segments
    })

  } catch (error) {
    console.error('Error in SuperAdmin RFM analysis:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data analisis RFM' },
      { status: 500 }
    )
  }
}
