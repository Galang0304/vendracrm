import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
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

    // Fetch store
    const store = await prisma.store.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(store)

  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update store
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, code, address, phone, email, manager, isActive } = await request.json()

    // Validation
    if (!name || !code || !address) {
      return NextResponse.json(
        { message: 'Name, code, and address are required' },
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

    // Check if store exists and belongs to company
    const existingStore = await prisma.store.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!existingStore) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      )
    }

    // Check if new code conflicts with other stores (excluding current store)
    if (code !== existingStore.code) {
      const codeConflict = await prisma.store.findFirst({
        where: {
          companyId: user.company.id,
          code: code,
          id: { not: id }
        }
      })

      if (codeConflict) {
        return NextResponse.json(
          { message: 'Store code already exists' },
          { status: 400 }
        )
      }
    }

    // Update store
    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        code,
        address,
        phone: phone || null,
        email: email || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(store)

  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
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

    // Check if store exists and belongs to company
    const store = await prisma.store.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    })

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      )
    }

    // Delete store
    await prisma.store.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Store deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
