import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const brand = searchParams.get('brand')
    const itemGroup = searchParams.get('itemGroup')
    const paymentType = searchParams.get('paymentType')
    const companyId = searchParams.get('companyId')
    const storeId = searchParams.get('storeId')
    const isExport = searchParams.get('export') === 'true'

    const skip = (page - 1) * limit
    const isSuperAdmin = session.user.role === 'SUPERADMIN'
    const targetCompanyId = isSuperAdmin && companyId ? companyId : session.user.companyId

    // Build SQL query with proper escaping - using transactions and transaction_items tables
    let baseQuery = `
      SELECT 
        t.id,
        t.transactionNo,
        t.date,
        t.paymentMethod,
        t.companyId,
        t.storeId,
        ti.quantity as qty,
        ti.unitPrice as price,
        ti.totalPrice as amount,
        ti.addOnPrice,
        ti.discountPercent,
        ti.discountAmount,
        ti.totalCost,
        ti.profit,
        ti.paidToBrand,
        p.name as itemName,
        p.sku as itemSku,
        p.brand,
        p.category as itemGroup,
        'IDR' as currency,
        0 as brandCommissionRate,
        0 as brandCommissionAmount,
        0 as taxAmount,
        s.name as storeName,
        c.name as companyName
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transactionId
      LEFT JOIN products p ON ti.productId = p.id
      LEFT JOIN stores s ON t.storeId = s.id
      LEFT JOIN companies c ON t.companyId = c.id
      WHERE t.companyId = '${targetCompanyId}'`
    
    let countQuery = `
      SELECT 
        COUNT(DISTINCT t.transactionNo) as totalOrders,
        SUM(ti.totalPrice) as totalRevenue,
        SUM(ti.profit) as totalProfit,
        SUM(ti.quantity) as totalItems,
        COUNT(*) as totalRecords
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transactionId
      LEFT JOIN products p ON ti.productId = p.id
      WHERE t.companyId = '${targetCompanyId}'`
    
    if (storeId) {
      baseQuery += ` AND t.storeId = '${storeId}'`
      countQuery += ` AND t.storeId = '${storeId}'`
    }
    if (year) {
      baseQuery += ` AND YEAR(t.date) = ${year}`
      countQuery += ` AND YEAR(t.date) = ${year}`
    }
    if (month) {
      baseQuery += ` AND MONTH(t.date) = ${month}`
      countQuery += ` AND MONTH(t.date) = ${month}`
    }
    if (dateFrom) {
      baseQuery += ` AND t.date >= '${dateFrom}'`
      countQuery += ` AND t.date >= '${dateFrom}'`
    }
    if (dateTo) {
      baseQuery += ` AND t.date <= '${dateTo}'`
      countQuery += ` AND t.date <= '${dateTo}'`
    }
    if (brand) {
      baseQuery += ` AND p.brand LIKE '%${brand}%'`
      countQuery += ` AND p.brand LIKE '%${brand}%'`
    }
    if (itemGroup) {
      baseQuery += ` AND p.category LIKE '%${itemGroup}%'`
      countQuery += ` AND p.category LIKE '%${itemGroup}%'`
    }
    if (paymentType) {
      baseQuery += ` AND t.paymentMethod LIKE '%${paymentType}%'`
      countQuery += ` AND t.paymentMethod LIKE '%${paymentType}%'`
    }
    if (search) {
      baseQuery += ` AND (t.transactionNo LIKE '%${search}%' OR p.name LIKE '%${search}%' OR p.sku LIKE '%${search}%')`
      countQuery += ` AND (t.transactionNo LIKE '%${search}%' OR p.name LIKE '%${search}%' OR p.sku LIKE '%${search}%')`
    }

    baseQuery += ` ORDER BY t.date DESC`
    if (!isExport) {
      baseQuery += ` LIMIT ${limit} OFFSET ${skip}`
    }

    // Debug: Check what's in the database
    console.log('🔍 Debug Info:', {
      targetCompanyId,
      userCompanyId: session.user.companyId,
      isSuperAdmin,
      baseQuery: baseQuery.substring(0, 200) + '...'
    })
    
    const debugTransactionCount = await prisma.transaction.count({
      where: { companyId: targetCompanyId }
    })
    
    const debugAllTransactions = await prisma.transaction.findMany({
      select: { id: true, companyId: true, transactionNo: true },
      take: 5
    })
    
    console.log('🔍 Database Debug:', {
      transactionCountForCompany: debugTransactionCount,
      allTransactionsPreview: debugAllTransactions
    })

    // Get data from transactions and transaction_items tables (imported data)
    const olseraTransactions = await prisma.$queryRawUnsafe(baseQuery) as any[]
    
    console.log('🔍 Query Results:', {
      resultCount: olseraTransactions.length,
      firstResult: olseraTransactions[0]
    })

    // Get total stats for all data (not just current page)
    const totalStatsResult = await prisma.$queryRawUnsafe(countQuery) as any[]
    const stats = totalStatsResult[0] || {}

    const totalStats = {
      totalOrders: Number(stats.totalOrders || 0),
      totalRevenue: Number(stats.totalRevenue || 0),
      totalProfit: Number(stats.totalProfit || 0),
      totalItems: Number(stats.totalItems || 0)
    }

    // Transform data to match frontend interface
    console.log('🔍 Sample raw data:', olseraTransactions[0])
    const transformedData = olseraTransactions.map((item: any) => ({
      id: item.id,
      transactionNo: item.transactionNo,
      orderTime: item.date,
      brand: item.brand || '',
      brandCommissionRate: Number(item.brandCommissionRate || 0),
      brandCommissionAmount: Number(item.brandCommissionAmount || 0),
      itemGroup: item.itemGroup || '',
      itemName: item.itemName || '',
      itemSku: item.itemSku || '',
      qty: Number(item.qty || 0),
      currency: item.currency || 'IDR',
      price: Number(item.price || 0),
      addOnPrice: Number(item.addOnPrice || 0),
      discountPercent: Number(item.discountPercent || 0),
      discountAmount: Number(item.discountAmount || 0),
      amount: Number(item.amount || 0),
      taxAmount: Number(item.taxAmount || 0),
      costPerUnit: Number(item.costPerUnit || 0),
      totalCost: Number(item.totalCost || 0),
      profit: Number(item.profit || 0),
      paidToBrand: Number(item.paidToBrand || 0),
      paymentType: item.paymentMethod || '',
      storeName: item.storeName || '',
      companyName: item.companyName || ''
    }))
    
    console.log('🔍 Sample transformed data:', transformedData[0])

    // Handle CSV export
    if (isExport) {
      const csvHeaders = [
        'Order No', 'Order Time', 'Brand', 'Brand Commission Rate', 'Brand Commission Amount',
        'Item Group', 'Item Name', 'Item SKU', 'Qty', 'Currency', 'Price', 'Add-on Price',
        'Discount Percent', 'Discount Amount', 'Amount', 'Tax Amount', 'Cost Per Unit',
        'Total Cost', 'Profit', 'Paid to Brand', 'Payment Type'
      ]

      if (isSuperAdmin) {
        csvHeaders.push('Company', 'Store')
      }

      const csvRows = transformedData.map((item: any) => {
        const row = [
          item.transactionNo,
          item.orderTime,
          item.brand,
          item.brandCommissionRate,
          item.brandCommissionAmount,
          item.itemGroup,
          item.itemName,
          item.itemSku,
          item.qty,
          item.currency,
          item.price,
          item.addOnPrice,
          item.discountPercent,
          item.discountAmount,
          item.amount,
          item.taxAmount,
          item.costPerUnit,
          item.totalCost,
          item.profit,
          item.paidToBrand,
          item.paymentType
        ]

        if (isSuperAdmin) {
          row.push(item.companyName || '', item.storeName || '')
        }

        return row
      })

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="olsera-data-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    const totalRecords = Number(stats.totalRecords || 0)
    const totalPages = Math.ceil(totalRecords / limit)

    return NextResponse.json({
      transactions: transformedData,
      total: totalRecords,
      totalStats,
      page,
      totalPages
    })

  } catch (error) {
    console.error('Error fetching Olsera data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
