import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// GET - Get all customers/members for company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'KASIR', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    let companyId = session.user.companyId

    // If kasir, get company from employee record
    if (session.user.role === 'KASIR') {
      const employee = await prisma.employee.findUnique({
        where: { email: session.user.email },
        select: { companyId: true }
      })
      companyId = employee?.companyId
    }

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    const customers = await prisma.customer.findMany({
      where: { 
        companyId,
        // Filter out system-generated customers
        NOT: {
          name: {
            in: ['Import Customer', 'Walk-in Customer']
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uniqueId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        isActive: true,
        isMember: true,
        membershipId: true,
        membershipTier: true,
        membershipPoints: true,
        membershipDiscount: true,
        membershipJoinDate: true,
        membershipExpiry: true,
        createdAt: true,
        updatedAt: true,
        membershipStoreId: true,
        membershipStore: {
          select: {
            name: true
          }
        }
      }
    })

    // Transform data to include storeName
    const transformedCustomers = customers.map(customer => ({
      ...customer,
      storeName: customer.membershipStore?.name || null
    }))

    return NextResponse.json(transformedCustomers)

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new customer/member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'KASIR', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    let companyId = session.user.companyId

    // If kasir, get company from employee record
    if (session.user.role === 'KASIR') {
      const employee = await prisma.employee.findUnique({
        where: { email: session.user.email },
        select: { companyId: true }
      })
      companyId = employee?.companyId
    }

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      isMember = false,
      membershipTier = 'bronze'
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if email already exists for this company
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email,
          companyId
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { message: 'Customer with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate unique customer ID
    const uniqueId = `CUST${Date.now().toString().slice(-8)}`
    
    // Generate membership ID if member
    let membershipId = null
    let membershipJoinDate = null
    let membershipExpiry = null
    
    if (isMember) {
      membershipId = `MBR${Date.now().toString().slice(-8)}`
      membershipJoinDate = new Date()
      // Set membership expiry to 1 year from now
      membershipExpiry = new Date()
      membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1)
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        uniqueId,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        isActive: true,
        companyId,
        isMember,
        membershipId,
        membershipTier: isMember ? membershipTier : null,
        membershipPoints: isMember ? 0 : 0,
        membershipDiscount: isMember ? getMembershipDiscount(membershipTier) : 0,
        membershipJoinDate,
        membershipExpiry
      }
    })

    console.log(`✅ Created new ${isMember ? 'member' : 'customer'}: ${customer.name}`)

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get membership discount based on tier
function getMembershipDiscount(tier: string): number {
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return 0.05 // 5%
    case 'silver':
      return 0.10 // 10%
    case 'gold':
      return 0.15 // 15%
    case 'platinum':
      return 0.20 // 20%
    default:
      return 0.05 // Default 5%
  }
}
