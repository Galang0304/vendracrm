import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RFMInsights {
  customerSegmentation: {
    totalCustomers: number
    segments: {
      [key: string]: {
        count: number
        percentage: number
        characteristics: string
        recommendations: string[]
      }
    }
  }
  businessInsights: {
    customerLifetimeValue: {
      average: number
      highest: number
      distribution: string
    }
    customerRetention: {
      loyalCustomers: number
      atRiskCustomers: number
      lostCustomers: number
      retentionRate: number
    }
    revenueAnalysis: {
      totalRevenue: number
      averageOrderValue: number
      topSpendingSegments: string[]
      revenueConcentration: string
    }
  }
  marketingRecommendations: {
    highValueSegments: string[]
    retentionStrategies: string[]
    acquisitionOpportunities: string[]
    campaignTargeting: {
      [segment: string]: string[]
    }
  }
  productInsights: {
    topProductsBySegment: {
      [segment: string]: Array<{
        productName: string
        popularity: number
        revenue: number
      }>
    }
    crossSellOpportunities: string[]
    inventoryOptimization: string[]
  }
}

// Helper function to get segment characteristics and recommendations
function getSegmentInsights(segment: string, stats: any): { characteristics: string, recommendations: string[] } {
  const insights: { [key: string]: { characteristics: string, recommendations: string[] } } = {
    'Best Customers': {
      characteristics: 'High-value customers who purchase frequently and recently. These are your most valuable customers.',
      recommendations: [
        'Provide VIP treatment and exclusive offers',
        'Create loyalty programs with premium benefits',
        'Ask for referrals and testimonials',
        'Offer early access to new products'
      ]
    },
    'Champions': {
      characteristics: 'Recent buyers with high frequency and spend. Your brand advocates.',
      recommendations: [
        'Reward their loyalty with special recognition',
        'Encourage them to become brand ambassadors',
        'Offer exclusive products or services',
        'Create a champions community program'
      ]
    },
    'Loyal Customers': {
      characteristics: 'Buy frequently but may not be the highest spenders. Consistent customers.',
      recommendations: [
        'Increase order value with upselling',
        'Offer bundle deals and volume discounts',
        'Introduce premium product lines',
        'Reward frequency with points programs'
      ]
    },
    'Big Spenders': {
      characteristics: 'High monetary value but may not purchase frequently.',
      recommendations: [
        'Increase purchase frequency with targeted campaigns',
        'Send personalized product recommendations',
        'Offer time-limited exclusive deals',
        'Create seasonal buying reminders'
      ]
    },
    'Potential Loyalists': {
      characteristics: 'Recent customers with good frequency potential.',
      recommendations: [
        'Nurture with onboarding campaigns',
        'Provide excellent customer service',
        'Offer loyalty program enrollment',
        'Send educational content about products'
      ]
    },
    'New Customers': {
      characteristics: 'Recent buyers with low frequency and spend. Need nurturing.',
      recommendations: [
        'Welcome series with product education',
        'First-time buyer incentives',
        'Customer satisfaction surveys',
        'Cross-sell complementary products'
      ]
    },
    'At Risk': {
      characteristics: 'Previously good customers who haven\'t purchased recently.',
      recommendations: [
        'Win-back campaigns with special offers',
        'Survey to understand why they stopped buying',
        'Personalized re-engagement emails',
        'Limited-time comeback discounts'
      ]
    },
    'Almost Lost': {
      characteristics: 'Customers showing signs of churn but still recoverable.',
      recommendations: [
        'Immediate intervention with attractive offers',
        'Personal outreach from customer service',
        'Product recommendation based on past purchases',
        'Feedback collection to improve experience'
      ]
    },
    'Lost Customers': {
      characteristics: 'Haven\'t purchased in a long time. Difficult to recover.',
      recommendations: [
        'Aggressive win-back campaigns',
        'Deep discount offers',
        'New product announcements',
        'Rebranding or repositioning messages'
      ]
    },
    'Lost Cheap Customers': {
      characteristics: 'Low-value customers who haven\'t purchased recently.',
      recommendations: [
        'Low-cost re-engagement campaigns',
        'Automated email sequences',
        'Focus resources on higher-value segments',
        'Consider removing from active marketing'
      ]
    },
    'Others': {
      characteristics: 'Mixed characteristics that don\'t fit standard segments.',
      recommendations: [
        'Further analysis to understand behavior',
        'A/B test different approaches',
        'Gradual nurturing campaigns',
        'Monitor for segment migration'
      ]
    }
  }

  return insights[segment] || {
    characteristics: 'Customers with mixed purchasing patterns requiring individual analysis.',
    recommendations: ['Analyze individual customer behavior', 'Apply targeted strategies', 'Monitor segment changes']
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId } = await request.json()
    const targetCompanyId = session.user.role === 'SUPERADMIN' 
      ? companyId || session.user.companyId
      : session.user.companyId

    if (!targetCompanyId) {
      return NextResponse.json(
        { message: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Fetch RFM analysis data
    const rfmResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/rfm-analysis?companyId=${targetCompanyId}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    if (!rfmResponse.ok) {
      throw new Error('Failed to fetch RFM data')
    }

    const rfmData = await rfmResponse.json()

    if (!rfmData.customers || rfmData.customers.length === 0) {
      return NextResponse.json({
        message: 'No customer data available for RFM analysis',
        insights: null
      })
    }

    // Process RFM data into AI-friendly insights
    const insights: RFMInsights = {
      customerSegmentation: {
        totalCustomers: rfmData.summary.totalCustomers,
        segments: {}
      },
      businessInsights: {
        customerLifetimeValue: {
          average: rfmData.summary.averageMonetary,
          highest: Math.max(...rfmData.customers.map((c: any) => c.monetary)),
          distribution: rfmData.summary.averageMonetary > 1000000 ? 'High-value market' : 
                        rfmData.summary.averageMonetary > 500000 ? 'Mid-value market' : 'Budget-conscious market'
        },
        customerRetention: {
          loyalCustomers: 0,
          atRiskCustomers: 0,
          lostCustomers: 0,
          retentionRate: 0
        },
        revenueAnalysis: {
          totalRevenue: rfmData.summary.totalRevenue,
          averageOrderValue: rfmData.summary.averageMonetary / rfmData.summary.averageFrequency,
          topSpendingSegments: [],
          revenueConcentration: ''
        }
      },
      marketingRecommendations: {
        highValueSegments: [],
        retentionStrategies: [],
        acquisitionOpportunities: [],
        campaignTargeting: {}
      },
      productInsights: {
        topProductsBySegment: rfmData.topProducts || {},
        crossSellOpportunities: [],
        inventoryOptimization: []
      }
    }

    // Process segments
    Object.entries(rfmData.segments).forEach(([segment, stats]: [string, any]) => {
      const segmentInsights = getSegmentInsights(segment, stats)
      
      insights.customerSegmentation.segments[segment] = {
        count: stats.count,
        percentage: stats.percentage,
        characteristics: segmentInsights.characteristics,
        recommendations: segmentInsights.recommendations
      }

      // Categorize segments for business insights
      if (['Best Customers', 'Champions', 'Loyal Customers'].includes(segment)) {
        insights.businessInsights.customerRetention.loyalCustomers += stats.count
        insights.marketingRecommendations.highValueSegments.push(segment)
      }
      
      if (['At Risk', 'Almost Lost'].includes(segment)) {
        insights.businessInsights.customerRetention.atRiskCustomers += stats.count
        insights.marketingRecommendations.retentionStrategies.push(
          `Target ${segment} with re-engagement campaigns`
        )
      }
      
      if (['Lost Customers', 'Lost Cheap Customers'].includes(segment)) {
        insights.businessInsights.customerRetention.lostCustomers += stats.count
      }

      if (['New Customers', 'Potential Loyalists'].includes(segment)) {
        insights.marketingRecommendations.acquisitionOpportunities.push(
          `Nurture ${segment} to increase loyalty`
        )
      }

      // Campaign targeting
      insights.marketingRecommendations.campaignTargeting[segment] = segmentInsights.recommendations
    })

    // Calculate retention rate
    const totalActiveCustomers = insights.businessInsights.customerRetention.loyalCustomers + 
                                insights.businessInsights.customerRetention.atRiskCustomers
    insights.businessInsights.customerRetention.retentionRate = 
      (totalActiveCustomers / rfmData.summary.totalCustomers) * 100

    // Top spending segments
    const segmentsByRevenue = Object.entries(rfmData.segments)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3)
      .map(([segment]) => segment)
    
    insights.businessInsights.revenueAnalysis.topSpendingSegments = segmentsByRevenue

    // Revenue concentration analysis
    const topSegmentRevenue = Object.values(rfmData.segments)[0] as any
    const revenueShare = (topSegmentRevenue?.totalRevenue || 0) / rfmData.summary.totalRevenue * 100
    
    insights.businessInsights.revenueAnalysis.revenueConcentration = 
      revenueShare > 50 ? 'High concentration - dependent on few segments' :
      revenueShare > 30 ? 'Moderate concentration - balanced distribution' :
      'Low concentration - diversified customer base'

    // Product insights
    Object.entries(rfmData.topProducts || {}).forEach(([segment, products]: [string, any]) => {
      if (products && products.length > 0) {
        insights.productInsights.topProductsBySegment[segment] = products.map((p: any) => ({
          productName: p.productName,
          popularity: p.percentage,
          revenue: p.revenue
        }))

        // Cross-sell opportunities
        if (products.length > 1) {
          insights.productInsights.crossSellOpportunities.push(
            `Cross-sell opportunities in ${segment}: Bundle ${products[0].productName} with ${products[1].productName}`
          )
        }
      }
    })

    // Inventory optimization suggestions
    const highValueSegments = ['Best Customers', 'Champions', 'Big Spenders']
    highValueSegments.forEach(segment => {
      if (insights.productInsights.topProductsBySegment[segment]) {
        const topProduct = insights.productInsights.topProductsBySegment[segment][0]
        if (topProduct) {
          insights.productInsights.inventoryOptimization.push(
            `Ensure adequate stock of ${topProduct.productName} for ${segment}`
          )
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'RFM insights generated successfully',
      insights,
      analysisDate: new Date().toISOString(),
      companyId: targetCompanyId
    })

  } catch (error) {
    console.error('Error generating RFM insights:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
