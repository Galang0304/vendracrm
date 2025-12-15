import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Test database structure and data
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database structure and data...')

    // Check all tables and their counts
    const [
      companyCount,
      userCount,
      employeeCount,
      productCount,
      storeCount,
      transactionCount,
      customerCount
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.employee.count(),
      prisma.product.count(),
      prisma.store.count(),
      prisma.transaction.count(),
      prisma.customer.count()
    ])

    console.log('📊 Database Counts:')
    console.log(`Companies: ${companyCount}`)
    console.log(`Users: ${userCount}`)
    console.log(`Employees: ${employeeCount}`)
    console.log(`Products: ${productCount}`)
    console.log(`Stores: ${storeCount}`)
    console.log(`Transactions: ${transactionCount}`)
    console.log(`Customers: ${customerCount}`)

    // Get sample data from each table
    const [
      sampleCompanies,
      sampleUsers,
      sampleEmployees,
      sampleProducts,
      sampleStores,
      sampleTransactions
    ] = await Promise.all([
      prisma.company.findMany({ take: 3, select: { id: true, name: true, subscriptionTier: true } }),
      prisma.user.findMany({ take: 3, select: { id: true, name: true, role: true, company: { select: { name: true } } } }),
      prisma.employee.findMany({ take: 3, select: { id: true, name: true, role: true, company: { select: { name: true } } } }),
      prisma.product.findMany({ take: 3, select: { id: true, name: true, price: true, stock: true, company: { select: { name: true } } } }),
      prisma.store.findMany({ take: 3, select: { id: true, name: true, code: true, company: { select: { name: true } } } }),
      prisma.transaction.findMany({ take: 3, select: { id: true, transactionNo: true, total: true, company: { select: { name: true } } } })
    ])

    // Test employee data per company
    const companiesWithEmployees = await Promise.all(
      sampleCompanies.map(async (company) => {
        const employeeCount = await prisma.employee.count({ where: { companyId: company.id } })
        const employees = await prisma.employee.findMany({ 
          where: { companyId: company.id },
          select: { name: true, role: true, isActive: true }
        })
        return {
          company: company.name,
          employeeCount,
          employees
        }
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Database check completed',
      counts: {
        companies: companyCount,
        users: userCount,
        employees: employeeCount,
        products: productCount,
        stores: storeCount,
        transactions: transactionCount,
        customers: customerCount
      },
      sampleData: {
        companies: sampleCompanies,
        users: sampleUsers,
        employees: sampleEmployees,
        products: sampleProducts,
        stores: sampleStores,
        transactions: sampleTransactions
      },
      companiesWithEmployees,
      databaseStatus: 'Connected and operational'
    })

  } catch (error) {
    console.error('❌ Database check error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Database check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        databaseStatus: 'Connection failed'
      },
      { status: 500 }
    )
  }
}
