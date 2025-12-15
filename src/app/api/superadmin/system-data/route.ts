import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all system statistics
    const [
      totalUsers,
      totalCompanies,
      totalStores,
      totalProducts,
      totalTransactions,
      transactions,
      companies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.store.count(),
      prisma.product.count(),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          store: true,
          items: true
        }
      }),
      prisma.company.findMany({
        include: {
          stores: true,
          _count: {
            select: {
              employees: true
            }
          }
        }
      })
    ])

    // Calculate total revenue
    const allTransactions = await prisma.transaction.findMany({
      include: {
        items: true
      }
    })

    const totalRevenue = allTransactions.reduce((sum, transaction) => {
      const transactionTotal = transaction.items.reduce((itemSum, item) => {
        return itemSum + Number(item.totalPrice)
      }, 0)
      return sum + transactionTotal
    }, 0)

    // Format recent transactions
    const recentTransactions = transactions.map(transaction => ({
      id: transaction.id,
      transactionNo: transaction.transactionNo,
      date: new Date(transaction.createdAt).toLocaleDateString('id-ID'),
      customer: transaction.customer?.name || 'Walk-in Customer',
      store: transaction.store?.name || 'Default Store',
      total: transaction.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
    }))

    // Get companies data with performance metrics
    const companiesData = await Promise.all(
      companies.map(async (company) => {
        const [products, companyTransactions] = await Promise.all([
          prisma.product.count({
            where: { companyId: company.id }
          }),
          prisma.transaction.findMany({
            where: {
              store: {
                companyId: company.id
              }
            },
            include: {
              items: true
            }
          })
        ])

        const revenue = companyTransactions.reduce((sum, transaction) => {
          return sum + transaction.items.reduce((itemSum, item) => {
            return itemSum + Number(item.totalPrice)
          }, 0)
        }, 0)

        return {
          id: company.id,
          name: company.name,
          storeCount: company.stores.length,
          productCount: products,
          transactionCount: companyTransactions.length,
          revenue
        }
      })
    )

    const systemData = {
      totalUsers,
      totalCompanies,
      totalStores,
      totalProducts,
      totalTransactions,
      totalRevenue,
      recentTransactions,
      topProducts: [], // Can be implemented later
      companiesData
    }

    return NextResponse.json(systemData)

  } catch (error) {
    console.error('Error fetching system data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
