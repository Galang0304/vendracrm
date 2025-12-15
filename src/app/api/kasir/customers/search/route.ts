import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Search customers for kasir (filtered by store)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Get kasir's employee data with store and company info
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      include: { 
        company: true,
        store: true 
      }
    })

    if (!employee || !employee.company) {
      return NextResponse.json(
        { message: 'Employee or company not found' },
        { status: 404 }
      )
    }

    const companyId = employee.company.id
    const storeId = employee.storeId

    // Build where condition for customer search
    let whereCondition = `
      companyId = '${companyId}'
      AND isActive = true
      AND name NOT IN ('Import Customer', 'Walk-in Customer')
      AND (
        LOWER(name) LIKE LOWER('%${query}%')
        OR phone LIKE '%${query}%'
        OR email LIKE '%${query}%'
        OR membershipId LIKE '%${query}%'
        OR uniqueId LIKE '%${query}%'
      )
    `

    // If kasir is assigned to specific store, filter customers by store
    if (storeId) {
      whereCondition += ` AND (membershipStoreId = '${storeId}' OR membershipStoreId IS NULL)`
    }

    // Search customers with store filtering
    const customers = await prisma.$queryRawUnsafe(`
      SELECT 
        id, uniqueId, name, email, phone, isMember, membershipId, 
        membershipTier, membershipPoints, membershipDiscount, membershipJoinDate,
        membershipStoreId
      FROM customers 
      WHERE ${whereCondition}
      ORDER BY isMember DESC, name ASC
      LIMIT 10
    `)

    // Get store names for customers
    const customersWithStore = await Promise.all(
      (customers as any[]).map(async (customer) => {
        if (customer.membershipStoreId) {
          const store = await prisma.store.findUnique({
            where: { id: customer.membershipStoreId },
            select: { name: true, code: true }
          })
          return {
            ...customer,
            storeName: store?.name,
            storeCode: store?.code
          }
        }
        return {
          ...customer,
          storeName: 'Semua Toko',
          storeCode: 'ALL'
        }
      })
    )

    return NextResponse.json(customersWithStore)

  } catch (error) {
    console.error('Error searching customers for kasir:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
