import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate unique customer ID
function generateCustomerUniqueId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `CUST-${year}${month}${day}-${random}`
}

// Generate membership ID
function generateMembershipId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `MEMBER-${year}${month}${day}-${random}`
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'KASIR', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, phone, email, address, dateOfBirth, gender, isMember, membershipTier /*, membershipStoreId */ } = await request.json()

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
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

    // Check if phone already exists (if provided)
    if (phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          companyId: user.company.id,
          phone: phone
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { message: 'Customer with this phone number already exists' },
          { status: 400 }
        )
      }
    }

    // Generate unique IDs
    let uniqueId = generateCustomerUniqueId()
    let membershipId = null

    // Ensure uniqueId is unique
    while (await prisma.customer.findUnique({ where: { uniqueId } })) {
      uniqueId = generateCustomerUniqueId()
    }

    // Generate membership ID if customer is a member
    if (isMember) {
      membershipId = generateMembershipId()
      
      // Ensure membershipId is unique
      while (await prisma.customer.findUnique({ where: { membershipId } })) {
        membershipId = generateMembershipId()
      }
    }

    // Calculate membership discount based on tier
    const getDiscountByTier = (tier: string) => {
      const discounts = {
        bronze: 5,
        silver: 7,
        gold: 10,
        platinum: 15
      }
      return discounts[tier as keyof typeof discounts] || 5
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        uniqueId,
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        companyId: user.company.id,
        isMember: isMember || false,
        membershipId: membershipId,
        membershipTier: isMember ? (membershipTier || 'bronze') : null,
        membershipJoinDate: isMember ? new Date() : null,
        membershipPoints: 0,
        membershipDiscount: isMember ? getDiscountByTier(membershipTier || 'bronze') : 0
        // membershipStoreId: isMember && membershipStoreId ? membershipStoreId : null
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
        membershipDiscount: true,
        membershipJoinDate: true
        // membershipStoreId: true
      }
    })

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - List customers
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const memberOnly = searchParams.get('memberOnly') === 'true'
    const nonMemberOnly = searchParams.get('nonMemberOnly') === 'true'
    const tier = searchParams.get('tier') || ''
    const storeId = searchParams.get('storeId') || ''
    // const membershipStoreId = searchParams.get('membershipStoreId') || ''

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

    // Build where condition
    const whereCondition: any = {
      companyId: user.company.id,
      isActive: true
    }

    // Member filter
    if (memberOnly) {
      whereCondition.isMember = true
    } else if (nonMemberOnly) {
      whereCondition.isMember = false
    }

    // Tier filter
    if (tier && tier !== 'all') {
      whereCondition.membershipTier = tier
    }

    // Membership store filter - customers who are members of specific store
    // if (membershipStoreId && membershipStoreId !== 'all') {
    //   whereCondition.membershipStoreId = membershipStoreId
    // }

    // Search filter
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
        { membershipId: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereCondition,
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
          membershipDiscount: true,
          membershipJoinDate: true,
          // membershipStoreId: true,
          createdAt: true
        },
        orderBy: [
          { isMember: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.customer.count({ where: whereCondition })
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
