import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SubscriptionTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    console.log('OTP Verification attempt:', { email, otp })

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email dan OTP wajib diisi' },
        { status: 400 }
      )
    }

    // First, let's check if user exists with this email
    const userExists = await prisma.user.findFirst({
      where: { email: email },
      include: { company: true }
    })

    console.log('User exists:', userExists ? {
      email: userExists.email,
      otpCode: userExists.otpCode,
      otpExpires: userExists.otpExpires,
      isVerified: userExists.isVerified,
      subscriptionTier: userExists.company?.subscriptionTier
    } : 'No user found')

    // Find user with pending verification
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        otpCode: otp,
        otpExpires: {
          gt: new Date()
        }
      },
      include: {
        company: true
      }
    })

    console.log('User with valid OTP:', user ? 'Found' : 'Not found')

    if (!user) {
      // Check if OTP is correct but expired
      const userWithOtp = await prisma.user.findFirst({
        where: {
          email: email,
          otpCode: otp
        }
      })

      if (userWithOtp) {
        console.log('OTP correct but expired')
        return NextResponse.json(
          { message: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.' },
          { status: 400 }
        )
      }

      console.log('Invalid OTP or user not found')
      return NextResponse.json(
        { message: 'Kode OTP tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      )
    }

    // For FREE plan, activate immediately
    if (user.company?.subscriptionTier === SubscriptionTier.FREE) {
      await prisma.$transaction(async (tx) => {
        // Update user
        await tx.user.update({
          where: { id: user.id },
          data: {
            otpCode: null,
            otpExpires: null,
            isVerified: true,
            isActive: true,
            approvedAt: new Date()
          }
        })

        // Activate company
        await tx.company.update({
          where: { id: user.company!.id },
          data: {
            isActive: true
          }
        })
      })

      return NextResponse.json({
        message: 'Verifikasi berhasil! Akun FREE Anda telah aktif.',
        approved: true
      })
    } else {
      // For paid plans, mark as verified but not active (pending approval)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpires: null,
          isVerified: true
        }
      })

      return NextResponse.json({
        message: 'Verifikasi berhasil! Silakan upload bukti pembayaran.',
        approved: false
      })
    }

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
