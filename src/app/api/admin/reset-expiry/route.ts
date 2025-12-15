import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        { message: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Get the company
    const company = await prisma.company.findUnique({
      where: { id: accountId }
    })

    if (!company) {
      return NextResponse.json(
        { message: 'Company tidak ditemukan' },
        { status: 404 }
      )
    }

    // Reset expiry date to 1 month from now
    const newExpiry = new Date()
    newExpiry.setMonth(newExpiry.getMonth() + 1)

    await prisma.company.update({
      where: { id: accountId },
      data: {
        subscriptionExpiry: newExpiry,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Masa aktif berhasil direset',
      newExpiry: newExpiry.toISOString()
    })

  } catch (error) {
    console.error('Error resetting expiry:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
