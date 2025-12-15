import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if transaction exists and user has permission
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // Check permissions
    const isSuperAdmin = session.user.role === 'SUPERADMIN'
    if (!isSuperAdmin && existingTransaction.companyId !== session.user.companyId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Update transaction (only fields that exist in Transaction model)
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        transactionNo: body.transactionNo,
        paymentMethod: body.paymentType || body.paymentMethod,
        total: parseFloat(body.amount) || parseFloat(body.total) || 0,
        discount: parseFloat(body.discountAmount) || 0,
        notes: body.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if transaction exists and user has permission
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { company: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // Check permissions
    const isSuperAdmin = session.user.role === 'SUPERADMIN'
    if (!isSuperAdmin && existingTransaction.companyId !== session.user.companyId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Transaction deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get single transaction (optional, for future use)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get transaction with company info
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    // Check permissions
    const isSuperAdmin = session.user.role === 'SUPERADMIN'
    if (!isSuperAdmin && transaction.companyId !== session.user.companyId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ transaction })

  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
