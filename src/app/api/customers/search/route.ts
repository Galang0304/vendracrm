import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Search customers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'KASIR', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
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

    // Search customers by name, phone, email, or membershipId
    // Using raw query for case-insensitive search for better compatibility
    const customers = await prisma.$queryRaw`
      SELECT 
        id, uniqueId, name, email, phone, isMember, membershipId, 
        membershipTier, membershipPoints, membershipDiscount, membershipJoinDate
      FROM customers 
      WHERE companyId = ${user.company.id}
        AND isActive = true
        AND name NOT IN ('Import Customer', 'Walk-in Customer')
        AND (
          LOWER(name) LIKE LOWER(${`%${query}%`})
          OR phone LIKE ${`%${query}%`}
          OR email LIKE ${`%${query}%`}
          OR membershipId LIKE ${`%${query}%`}
          OR uniqueId LIKE ${`%${query}%`}
        )
      ORDER BY isMember DESC, name ASC
      LIMIT 10
    `

    return NextResponse.json(customers)

  } catch (error) {
    console.error('Error searching customers:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
