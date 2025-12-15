import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email! }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get today's date range (start and end of today)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get transactions for this kasir - ONLY TODAY for security/privacy
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          companyId: employee.companyId,
          employeeId: employee.id,
          createdAt: {
            gte: startOfToday,
            lt: endOfToday
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true
                }
              }
            }
          },
          customer: {
            select: {
              name: true,
              email: true,
              isMember: true
            }
          },
          store: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: {
          companyId: employee.companyId,
          employeeId: employee.id,
          createdAt: {
            gte: startOfToday,
            lt: endOfToday
          }
        }
      })
    ])

    // Format response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      transactionNo: transaction.transactionNo,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      paymentStatus: transaction.paymentStatus,
      createdAt: transaction.createdAt,
      customer: transaction.customer,
      store: transaction.store,
      itemCount: transaction.items.length,
      items: transaction.items.map(item => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
