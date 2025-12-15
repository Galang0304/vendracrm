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

    const { accountId, action, amount, unit } = await request.json()

    if (!accountId || !action || !amount || !unit) {
      return NextResponse.json(
        { message: 'Missing required fields' },
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

    // Calculate the time adjustment
    let currentExpiry = company.subscriptionExpiry ? new Date(company.subscriptionExpiry) : new Date()
    
    // If no current expiry, start from now
    if (!company.subscriptionExpiry) {
      currentExpiry = new Date()
    }

    let newExpiry = new Date(currentExpiry)
    
    // Calculate adjustment based on unit
    let adjustmentInMs = 0
    switch (unit) {
      case 'days':
        adjustmentInMs = amount * 24 * 60 * 60 * 1000
        break
      case 'weeks':
        adjustmentInMs = amount * 7 * 24 * 60 * 60 * 1000
        break
      case 'months':
        // Handle months more accurately
        if (action === 'add') {
          newExpiry.setMonth(newExpiry.getMonth() + amount)
        } else {
          newExpiry.setMonth(newExpiry.getMonth() - amount)
        }
        break
    }

    // Apply adjustment for days and weeks
    if (unit !== 'months') {
      if (action === 'add') {
        newExpiry = new Date(currentExpiry.getTime() + adjustmentInMs)
      } else {
        newExpiry = new Date(currentExpiry.getTime() - adjustmentInMs)
      }
    }

    // Ensure the new expiry is not in the past (minimum is current time)
    const now = new Date()
    if (newExpiry < now && action === 'subtract') {
      newExpiry = now
    }

    await prisma.company.update({
      where: { id: accountId },
      data: {
        subscriptionExpiry: newExpiry,
        isActive: newExpiry > now
      }
    })

    return NextResponse.json({
      message: `Masa aktif berhasil ${action === 'add' ? 'ditambah' : 'dikurangi'}`,
      newExpiry: newExpiry.toISOString(),
      previousExpiry: company.subscriptionExpiry?.toISOString() || null
    })

  } catch (error) {
    console.error('Error adjusting expiry:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
