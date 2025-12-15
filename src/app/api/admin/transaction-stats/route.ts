import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      )
    }

    // Get transaction statistics
    const [transactionCount, totalRevenue, uniqueCustomers] = await Promise.all([
      // Total number of transactions
      prisma.transaction.count({
        where: {
          companyId: user.company.id
        }
      }),
      
      // Total revenue
      prisma.transaction.aggregate({
        where: {
          companyId: user.company.id
        },
        _sum: {
          total: true
        }
      }),
      
      // Unique customers who made transactions
      prisma.transaction.findMany({
        where: {
          companyId: user.company.id
        },
        select: {
          customerId: true
        },
        distinct: ['customerId']
      })
    ])

    const totalRevenueAmount = totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0
    const totalCustomers = uniqueCustomers.length
    const avgTransactionValue = transactionCount > 0 ? totalRevenueAmount / transactionCount : 0

    const stats = {
      totalTransactions: transactionCount,
      totalRevenue: totalRevenueAmount,
      totalCustomers: totalCustomers,
      avgTransactionValue: Math.round(avgTransactionValue)
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
