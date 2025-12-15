import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'KASIR', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15 compatibility
    const { id } = await params

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

    const customer = await prisma.customer.findFirst({
      where: { 
        id: id,
        companyId: companyId
      },
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
        },
        // Get transaction stats
        transactions: {
          select: {
            total: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const totalTransactions = customer.transactions.length
    const totalSpent = customer.transactions.reduce((sum, t) => sum + Number(t.total), 0)

    // Transform response
    const transformedCustomer = {
      ...customer,
      storeName: customer.membershipStore?.name || null,
      totalTransactions,
      totalSpent,
      transactions: undefined // Remove transactions array from response
    }

    return NextResponse.json(transformedCustomer)

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15 compatibility
    const { id } = await params

    const body = await request.json()
    const { 
      name, 
      email, 
      phone, 
      address, 
      dateOfBirth, 
      gender, 
      isMember, 
      membershipTier, 
      membershipDiscount,
      membershipStoreId 
    } = body

    let companyId = session.user.companyId

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    // Check if customer exists and belongs to company
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        id: id,
        companyId: companyId
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      isMember,
      updatedAt: new Date()
    }

    // If becoming a member, set membership data
    if (isMember && !existingCustomer.isMember) {
      const membershipId = `MEMBER-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
      
      updateData.membershipId = membershipId
      updateData.membershipTier = membershipTier || 'bronze'
      updateData.membershipPoints = 0
      updateData.membershipDiscount = Number(membershipDiscount) || 5
      updateData.membershipJoinDate = new Date()
      updateData.membershipStoreId = membershipStoreId || null
    } else if (isMember) {
      // Update existing membership
      updateData.membershipTier = membershipTier
      updateData.membershipDiscount = Number(membershipDiscount) || 5
      updateData.membershipStoreId = membershipStoreId || null
    } else if (!isMember && existingCustomer.isMember) {
      // Remove membership
      updateData.membershipId = null
      updateData.membershipTier = null
      updateData.membershipPoints = 0
      updateData.membershipDiscount = 0
      updateData.membershipJoinDate = null
      updateData.membershipExpiry = null
      updateData.membershipStoreId = null
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: updateData,
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

    // Transform response
    const transformedCustomer = {
      ...updatedCustomer,
      storeName: updatedCustomer.membershipStore?.name || null
    }

    return NextResponse.json(transformedCustomer)

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15 compatibility
    const { id } = await params

    let companyId = session.user.companyId

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    // Check if customer exists and belongs to company
    const existingCustomer = await prisma.customer.findFirst({
      where: { 
        id: id,
        companyId: companyId
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if customer has transactions
    const transactionCount = await prisma.transaction.count({
      where: { customerId: id }
    })

    if (transactionCount > 0) {
      // Soft delete - just deactivate
      await prisma.customer.update({
        where: { id: id },
        data: { isActive: false }
      })
    } else {
      // Hard delete if no transactions
      await prisma.customer.delete({
        where: { id: id }
      })
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })

  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
