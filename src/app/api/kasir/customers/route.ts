import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Search customers for kasir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    // Get kasir's company
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      select: { companyId: true }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const customers = await prisma.customer.findMany({
      where: {
        companyId: employee.companyId,
        isActive: true,
        OR: search ? [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { uniqueId: { contains: search } },
          { membershipId: { contains: search } }
        ] : undefined
      },
      select: {
        id: true,
        uniqueId: true,
        name: true,
        email: true,
        phone: true,
        isMember: true,
        membershipId: true,
        membershipTier: true,
        membershipPoints: true,
        membershipDiscount: true
      },
      orderBy: { name: 'asc' },
      take: 20 // Limit results for performance
    })

    return NextResponse.json(customers)

  } catch (error) {
    console.error('Error searching customers:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new customer from kasir (quick registration)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized - Kasir access required' },
        { status: 401 }
      )
    }

    // Get kasir's company and store
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email },
      select: { companyId: true, storeId: true }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      phone,
      email,
      isMember = false
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    if (email || phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          companyId: employee.companyId,
          OR: [
            email ? { email } : {},
            phone ? { phone } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { message: 'Customer with this email or phone already exists' },
          { status: 400 }
        )
      }
    }

    // Generate unique customer ID
    const uniqueId = `CUST${Date.now().toString().slice(-8)}`
    
    // Generate membership data if member
    let membershipData = {}
    if (isMember) {
      const membershipId = `MBR${Date.now().toString().slice(-8)}`
      const membershipJoinDate = new Date()
      const membershipExpiry = new Date()
      membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1)
      
      membershipData = {
        membershipId,
        membershipTier: 'bronze',
        membershipPoints: 0,
        membershipDiscount: 5, // 5% for bronze (as integer)
        membershipJoinDate,
        membershipExpiry,
        membershipStoreId: employee.storeId // Assign to kasir's store
      }
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        uniqueId,
        name,
        email: email || null,
        phone: phone || null,
        isActive: true,
        companyId: employee.companyId,
        isMember,
        ...membershipData
      },
      select: {
        id: true,
        uniqueId: true,
        name: true,
        email: true,
        phone: true,
        isMember: true,
        membershipId: true,
        membershipTier: true,
        membershipPoints: true,
        membershipDiscount: true
      }
    })

    console.log(`✅ Kasir created new ${isMember ? 'member' : 'customer'}: ${customer.name}`)

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    console.error('Error creating customer from kasir:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
