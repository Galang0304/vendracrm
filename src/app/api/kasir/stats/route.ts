import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get kasir daily statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    // Get kasir's employee data
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { company: true, store: true }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's transactions by this kasir
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        employeeId: employee.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        items: true,
        customer: true
      }
    })

    // Calculate statistics
    const totalTransactions = todayTransactions.length
    const totalRevenue = todayTransactions.reduce((sum, tx) => sum + Number(tx.total), 0)
    const totalItems = todayTransactions.reduce((sum, tx) => 
      sum + tx.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Payment method breakdown
    const paymentMethods = todayTransactions.reduce((acc, tx) => {
      acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Customer type breakdown
    const memberTransactions = todayTransactions.filter(tx => tx.customer.isMember).length
    const nonMemberTransactions = totalTransactions - memberTransactions

    // Hourly breakdown
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const hourTransactions = todayTransactions.filter(tx => 
        tx.createdAt.getHours() === hour
      )
      return {
        hour,
        transactions: hourTransactions.length,
        revenue: hourTransactions.reduce((sum, tx) => sum + Number(tx.total), 0)
      }
    })

    // Recent transactions (last 5)
    const recentTransactions = todayTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(tx => ({
        id: tx.id,
        transactionNo: tx.transactionNo,
        total: Number(tx.total),
        paymentMethod: tx.paymentMethod,
        customerName: tx.customer.name,
        itemCount: tx.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: tx.createdAt
      }))

    const stats = {
      today: {
        date: today.toISOString().split('T')[0],
        totalTransactions,
        totalRevenue,
        totalItems,
        averageTransaction,
        memberTransactions,
        nonMemberTransactions
      },
      paymentMethods,
      hourlyStats: hourlyStats.filter(stat => stat.transactions > 0),
      recentTransactions,
      kasirInfo: {
        name: employee.name,
        storeName: employee.store?.name || 'Semua Toko',
        companyName: employee.company.name
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching kasir stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
